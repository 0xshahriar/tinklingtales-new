const CUSTOM_REQUEST_STATUSES = ["new", "in-progress", "quoted", "completed"];

function getCustomRequestsSheet_() {
  return getSheet_(SHEETS.CUSTOM_REQUESTS);
}

function mapCustomRequestRow_(row) {
  return {
    requestId: row.requestId,
    customerName: row.customerName || "",
    customerEmail: row.customerEmail || "",
    details: parseJson_(row.details, {}),
    status: row.status || "new",
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || ""
  };
}

function createCustomRequestFromPublic_(payload) {
  const name = (payload.name || payload.fullName || "").toString().trim();
  const email = (payload.email || "").toString().trim();
  const phone = (payload.phone || "").toString().trim();
  const occasion = payload.occasion || "";
  const description = payload.description || payload.details || "";

  if (!email && !phone) {
    throw new Error("A contact email or phone number is required");
  }

  const sheet = getCustomRequestsSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const timestamp = nowIso_();

  const record = {
    requestId: generateId_("cst"),
    customerName: name,
    customerEmail: email,
    details: serialiseJson_({
      phone,
      occasion,
      description,
      source: "web"
    }),
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  appendRow_(sheet, headers, record);
  return mapCustomRequestRow_(record);
}

function listCustomRequests_() {
  const sheet = getCustomRequestsSheet_();
  const table = getTable_(sheet);
  return table.rows.map(function (row, index) {
    return {
      data: mapCustomRequestRow_(row),
      rowIndex: index + 2,
      headers: table.headers
    };
  });
}

function updateCustomRequest_(requestId, status) {
  const entries = listCustomRequests_();
  const target = entries.find(function (entry) {
    return entry.data.requestId === requestId;
  });
  if (!target) {
    return null;
  }
  if (CUSTOM_REQUEST_STATUSES.indexOf(status) === -1) {
    throw new Error("Invalid status");
  }
  const updatedAt = nowIso_();
  updateRow_(getCustomRequestsSheet_(), target.headers, target.rowIndex, {
    status,
    updatedAt
  });
  return Object.assign({}, target.data, { status, updatedAt });
}

function handlePublicCustomRequestRoute(method, body, origin) {
  if (method === "POST") {
    try {
      const request = createCustomRequestFromPublic_(body || {});
      return createResponse_(HTTP_STATUS.CREATED, { request }, origin);
    } catch (error) {
      if (error && error.message) {
        return badRequest_(origin, error.message);
      }
      return serverError_(origin, error);
    }
  }
  return methodNotAllowed_(origin);
}
