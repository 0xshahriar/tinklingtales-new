function getOrdersSheet_() {
  return getSheet_(SHEETS.ORDERS);
}

function mapOrderRow_(row) {
  return {
    orderId: row.orderId,
    customerId: row.customerId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    shippingAddress: parseJson_(row.shippingAddress, {}),
    items: parseJson_(row.items, []),
    total: parseNumber_(row.total),
    status: row.status || "pending",
    locked: normaliseBoolean_(row.locked),
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || ""
  };
}

function listOrdersForUser_(userId) {
  const sheet = getOrdersSheet_();
  const table = getTable_(sheet);
  return table.rows
    .filter(function (row) {
      return (row.customerId || "") === userId;
    })
    .map(mapOrderRow_)
    .sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

function listAllOrders_() {
  const sheet = getOrdersSheet_();
  const table = getTable_(sheet);
  return table.rows.map(function (row, index) {
    return {
      data: mapOrderRow_(row),
      rowIndex: index + 2,
      headers: table.headers
    };
  });
}

function createOrder_(payload, session, userProfile) {
  if (!session) {
    throw new Error("Unauthenticated");
  }
  const sheet = getOrdersSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const timestamp = nowIso_();

  const orderDetails = payload.order || {};
  const totals = payload.totals || {};
  const items = payload.items || [];

  if (!items.length) {
    throw new Error("Cart is empty");
  }

  const customerName = [orderDetails.firstName, orderDetails.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const orderRecord = {
    orderId: payload.orderId || generateId_("ord"),
    customerId: session.userId,
    customerName: customerName || userProfile?.name || "",
    customerEmail: orderDetails.email || userProfile?.email || "",
    shippingAddress: serialiseJson_({
      address: orderDetails.address || "",
      city: orderDetails.city || "",
      state: orderDetails.state || "",
      postal: orderDetails.postal || "",
      notes: orderDetails.notes || "",
      phone: orderDetails.phone || userProfile?.phone || ""
    }),
    items: serialiseJson_(items),
    total: parseNumber_(totals.total || 0),
    status: "pending",
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  appendRow_(sheet, headers, orderRecord);
  return mapOrderRow_(orderRecord);
}

function updateOrderStatus_(orderId, status) {
  const all = listAllOrders_();
  const target = all.find(function (entry) {
    return entry.data.orderId === orderId;
  });
  if (!target) {
    return null;
  }
  const currentIndex = ORDER_STATUS_FLOW.indexOf(target.data.status);
  const requestedIndex = ORDER_STATUS_FLOW.indexOf(status);
  if (requestedIndex === -1) {
    throw new Error("Invalid status");
  }
  if (currentIndex > requestedIndex) {
    throw new Error("Status cannot move backwards");
  }
  const isLocked = currentIndex > 0 && target.data.locked;
  if (isLocked && status === "pending") {
    throw new Error("Locked orders cannot revert to pending");
  }

  const updatedAt = nowIso_();
  const locked = status !== "pending";
  updateRow_(getOrdersSheet_(), target.headers, target.rowIndex, {
    status,
    locked,
    updatedAt
  });
  return Object.assign({}, target.data, { status, locked, updatedAt });
}

function autoConfirmExpiredOrders_() {
  const sheet = getOrdersSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const now = new Date();
  const updatedOrders = [];

  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if ((row.status || "") !== "pending") {
      continue;
    }
    const createdAt = new Date(row.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }
    const elapsedHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (elapsedHours >= 2) {
      const rowIndex = index + 2;
      updateRow_(sheet, headers, rowIndex, {
        status: "confirmed",
        locked: true,
        updatedAt: nowIso_()
      });
      updatedOrders.push(row.orderId);
    }
  }

  return updatedOrders;
}

function handleOrderRoute(method, resourceId, body, origin, headers) {
  if (method === "GET" && !resourceId) {
    const sessionCheck = requireSession_(headers, origin);
    if (sessionCheck.error) {
      return sessionCheck.error;
    }
    const orders = listOrdersForUser_(sessionCheck.session.userId);
    return createResponse_(HTTP_STATUS.OK, { orders }, origin);
  }

  if (method === "POST" && !resourceId) {
    if (body && body.type === "custom-request") {
      try {
        const request = createCustomRequestFromPublic_(body.payload || {});
        return createResponse_(HTTP_STATUS.CREATED, { request }, origin);
      } catch (error) {
        if (error && error.message) {
          return badRequest_(origin, error.message);
        }
        return serverError_(origin, error);
      }
    }

    const sessionCheck = requireSession_(headers, origin);
    if (sessionCheck.error) {
      return sessionCheck.error;
    }
    try {
      const userLookup = getUserById_(sessionCheck.session.userId);
      const order = createOrder_(body, sessionCheck.session, userLookup ? userLookup.user : null);
      return createResponse_(HTTP_STATUS.CREATED, { order }, origin);
    } catch (error) {
      if (error && error.message === "Cart is empty") {
        return badRequest_(origin, error.message);
      }
      if (error && error.message === "Unauthenticated") {
        return unauthorized_(origin);
      }
      return serverError_(origin, error);
    }
  }

  return methodNotAllowed_(origin);
}
