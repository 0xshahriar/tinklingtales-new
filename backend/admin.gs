const USER_ROLES = ["customer", "manager", "admin"];

function handleAdminRoute(method, resourceId, action, body, origin, headers) {
  switch (resourceId) {
    case "dashboard":
      return handleAdminDashboard_(method, origin, headers);
    case "orders":
      return handleAdminOrders_(method, action, body, origin, headers);
    case "products":
      return handleAdminProducts_(method, action, body, origin, headers);
    case "users":
      return handleAdminUsers_(method, action, body, origin, headers);
    case "custom-requests":
      return handleAdminCustomRequests_(method, body, origin, headers);
    default:
      return notFound_(origin);
  }
}

function handleAdminDashboard_(method, origin, headers) {
  if (method !== "GET") {
    return methodNotAllowed_(origin);
  }
  const authz = requireRole_(headers, origin, ["admin", "manager"]);
  if (authz.error) {
    return authz.error;
  }
  const summary = buildDashboardSummary_();
  return createResponse_(HTTP_STATUS.OK, summary, origin);
}

function handleAdminOrders_(method, action, body, origin, headers) {
  const authz = requireRole_(headers, origin, ["admin", "manager"]);
  if (authz.error) {
    return authz.error;
  }

  if (method === "GET") {
    autoConfirmExpiredOrders_();
    const orders = listAllOrders_().map(function (entry) {
      return entry.data;
    });
    return createResponse_(HTTP_STATUS.OK, { orders }, origin);
  }

  if (method === "PATCH" && action === "status") {
    if (!body || !body.orderId || !body.status) {
      return badRequest_(origin, "Order ID and status are required");
    }
    try {
      const order = updateOrderStatus_(body.orderId, body.status);
      if (!order) {
        return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "Order not found" }, origin);
      }
      return createResponse_(HTTP_STATUS.OK, { order }, origin);
    } catch (error) {
      return badRequest_(origin, error.message);
    }
  }

  return methodNotAllowed_(origin);
}

function handleAdminProducts_(method, action, body, origin, headers) {
  const authz = requireRole_(headers, origin, ["admin", "manager"]);
  if (authz.error) {
    return authz.error;
  }

  if (method === "POST") {
    try {
      const product = upsertProduct_(body || {});
      return createResponse_(HTTP_STATUS.OK, { product }, origin);
    } catch (error) {
      return badRequest_(origin, error.message);
    }
  }

  if (method === "DELETE" && action) {
    const deleted = deleteProduct_(action);
    if (!deleted) {
      return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "Product not found" }, origin);
    }
    return createResponse_(HTTP_STATUS.NO_CONTENT, "", origin);
  }

  if (method === "GET") {
    const products = listProducts_(true);
    return createResponse_(HTTP_STATUS.OK, { products }, origin);
  }

  return methodNotAllowed_(origin);
}

function handleAdminUsers_(method, action, body, origin, headers) {
  const authz = requireRole_(headers, origin, ["admin"]);
  if (authz.error) {
    return authz.error;
  }

  if (method === "GET") {
    const users = listUsers_().map(function (user) {
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        preferredChannel: user.preferredChannel,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });
    return createResponse_(HTTP_STATUS.OK, { users }, origin);
  }

  if (method === "PATCH" && action === "role") {
    const userId = body?.userId;
    const role = body?.role;
    if (!userId || !role) {
      return badRequest_(origin, "User ID and role are required");
    }
    if (USER_ROLES.indexOf(role) === -1) {
      return badRequest_(origin, "Role is invalid");
    }
    const updated = updateUserRole_(userId, role);
    if (!updated) {
      return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "User not found" }, origin);
    }
    return createResponse_(HTTP_STATUS.OK, { user: updated }, origin);
  }

  return methodNotAllowed_(origin);
}

function handleAdminCustomRequests_(method, body, origin, headers) {
  const authz = requireRole_(headers, origin, ["admin", "manager"]);
  if (authz.error) {
    return authz.error;
  }

  if (method === "GET") {
    const requests = listCustomRequests_().map(function (entry) {
      return entry.data;
    });
    return createResponse_(HTTP_STATUS.OK, { requests }, origin);
  }

  if (method === "PATCH") {
    const requestId = body?.requestId;
    const status = body?.status;
    if (!requestId || !status) {
      return badRequest_(origin, "Request ID and status are required");
    }
    try {
      const updated = updateCustomRequest_(requestId, status);
      if (!updated) {
        return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "Request not found" }, origin);
      }
      return createResponse_(HTTP_STATUS.OK, { request: updated }, origin);
    } catch (error) {
      return badRequest_(origin, error.message);
    }
  }

  return methodNotAllowed_(origin);
}
