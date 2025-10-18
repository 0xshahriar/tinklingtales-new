const SHEETS = {
  PRODUCTS: "Products",
  ORDERS: "Orders",
  USERS: "Users",
  SESSIONS: "Sessions",
  CUSTOM_REQUESTS: "CustomRequests",
  PASSWORD_RESETS: "PasswordResets"
};

const ORDER_STATUS_FLOW = ["pending", "confirmed", "delivered", "received"];

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  received: "Received"
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  ERROR: 500
};

const CONFIG = (function () {
  const props = PropertiesService.getScriptProperties();
  const originsProp = props.getProperty("ALLOWED_ORIGINS") || "";
  const allowedOrigins = originsProp
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    spreadsheetId: props.getProperty("SPREADSHEET_ID"),
    tokenExpiryHours: Number(props.getProperty("TOKEN_EXPIRY_HOURS")) || 168,
    jwtSecret: props.getProperty("JWT_SECRET") || "",
    allowedOrigins
  };
})();

function getSpreadsheet_() {
  if (!CONFIG.spreadsheetId) {
    throw new Error("SPREADSHEET_ID property is not configured");
  }
  return SpreadsheetApp.openById(CONFIG.spreadsheetId);
}

function getSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function ensureSchema_() {
  getSheet_(SHEETS.PRODUCTS, [
    "id",
    "name",
    "price",
    "currency",
    "description",
    "images",
    "tags",
    "inventory",
    "isActive",
    "createdAt",
    "updatedAt"
  ]);

  getSheet_(SHEETS.ORDERS, [
    "orderId",
    "customerId",
    "customerName",
    "customerEmail",
    "shippingAddress",
    "items",
    "total",
    "status",
    "locked",
    "createdAt",
    "updatedAt"
  ]);

  getSheet_(SHEETS.USERS, [
    "userId",
    "email",
    "passwordHash",
    "name",
    "phone",
    "preferredChannel",
    "role",
    "createdAt",
    "updatedAt"
  ]);

  getSheet_(SHEETS.SESSIONS, [
    "token",
    "userId",
    "role",
    "issuedAt",
    "expiresAt"
  ]);

  getSheet_(SHEETS.CUSTOM_REQUESTS, [
    "requestId",
    "customerName",
    "customerEmail",
    "details",
    "status",
    "createdAt",
    "updatedAt"
  ]);

  getSheet_(SHEETS.PASSWORD_RESETS, [
    "token",
    "userId",
    "expiresAt",
    "createdAt"
  ]);

  ensureDefaultAdminUser_();
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function getOrigin_(e) {
  const origin = (e?.headers?.Origin || e?.headers?.origin || "").trim();
  if (!origin) {
    return "";
  }
  if (!CONFIG.allowedOrigins.length) {
    return origin;
  }
  return CONFIG.allowedOrigins.indexOf(origin) > -1 ? origin : "";
}

function createResponse_(statusCode, body, origin, extraHeaders) {
  const payload = body !== undefined ? JSON.stringify(body) : "";
  const response = ContentService.createTextOutput(payload);
  response.setMimeType(ContentService.MimeType.JSON);
  response.setStatusCode(statusCode);

  const headers = Object.assign(
    {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-HTTP-Method-Override"
    },
    extraHeaders || {}
  );

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  Object.keys(headers).forEach(function (key) {
    response.appendHeader(key, headers[key]);
  });

  return response;
}

function notFound_(origin) {
  return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "Not found" }, origin);
}

function methodNotAllowed_(origin) {
  return createResponse_(HTTP_STATUS.METHOD_NOT_ALLOWED, { message: "Method not allowed" }, origin);
}

function badRequest_(origin, message) {
  return createResponse_(HTTP_STATUS.BAD_REQUEST, { message: message || "Invalid request" }, origin);
}

function unauthorized_(origin) {
  return createResponse_(HTTP_STATUS.UNAUTHORIZED, { message: "Authentication required" }, origin);
}

function forbidden_(origin) {
  return createResponse_(HTTP_STATUS.FORBIDDEN, { message: "You do not have access" }, origin);
}

function serverError_(origin, error) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  Logger.log("[ERROR] %s", message);
  return createResponse_(HTTP_STATUS.ERROR, { message }, origin);
}

function parsePath_(pathInfo) {
  if (!pathInfo) {
    return [];
  }
  return pathInfo
    .split("/")
    .filter(function (segment) {
      return segment && segment.trim().length > 0;
    });
}

function routeRequest_(method, pathSegments, body, query, headers, origin) {
  if (pathSegments.length === 0) {
    return createResponse_(HTTP_STATUS.OK, { message: "Tinkling Tales API" }, origin);
  }

  const [resource, resourceId, action] = pathSegments;

  try {
    switch (resource) {
      case "products":
        return handleProductRoute(method, resourceId, body, origin);
      case "orders":
        return handleOrderRoute(method, resourceId, body, origin, headers);
      case "auth":
        return handleAuthRoute(method, resourceId, body, origin);
      case "admin":
        return handleAdminRoute(method, resourceId, action, body, origin, headers);
      case "custom-requests":
        return handlePublicCustomRequestRoute(method, body, origin);
      default:
        return notFound_(origin);
    }
  } catch (error) {
    Logger.log("[ERROR] Routing failure: %s", error);
    return serverError_(origin, error);
  }
}

function extractToken_(headers) {
  if (!headers) {
    return "";
  }
  const authHeader = headers.Authorization || headers.authorization || "";
  if (!authHeader) {
    return "";
  }
  const parts = authHeader.split(" ");
  return parts.length === 2 ? parts[1] : "";
}

function resolveSession_(headers) {
  const token = extractToken_(headers);
  if (!token) {
    return null;
  }
  try {
    return getSessionByToken(token);
  } catch (error) {
    Logger.log("[WARN] Invalid session token: %s", error);
    return null;
  }
}

function doGet(e) {
  ensureSchema_();
  const origin = getOrigin_(e);
  const pathSegments = parsePath_(e?.pathInfo);
  const headers = e?.headers || {};
  const query = e?.parameter || {};
  const session = resolveSession_(headers);
  return routeRequest_("GET", pathSegments, {}, query, Object.assign({}, headers, { session }), origin);
}

function doPost(e) {
  ensureSchema_();
  const origin = getOrigin_(e);
  const headers = e?.headers || {};
  const overrideHeader = headers["X-HTTP-Method-Override"] || headers["x-http-method-override"] || "";
  const overrideParam = e?.parameter?._method || e?.parameter?.__method || e?.parameter?.method || "";
  const resolvedMethod = (overrideHeader || overrideParam || "POST").toString().toUpperCase();

  const pathSegments = parsePath_(e?.pathInfo);
  const body = parseBody_(e);
  const query = e?.parameter || {};
  const session = resolveSession_(headers);
  const extendedHeaders = Object.assign({}, headers, { session });

  switch (resolvedMethod) {
    case "POST":
      return routeRequest_("POST", pathSegments, body, query, extendedHeaders, origin);
    case "PATCH":
      return routeRequest_("PATCH", pathSegments, body, query, extendedHeaders, origin);
    case "DELETE":
      return routeRequest_("DELETE", pathSegments, body, query, extendedHeaders, origin);
    case "PUT":
      return routeRequest_("PUT", pathSegments, body, query, extendedHeaders, origin);
    default:
      return methodNotAllowed_(origin);
  }
}

function doOptions(e) {
  const origin = getOrigin_(e);
  return createResponse_(HTTP_STATUS.NO_CONTENT, "", origin, {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-HTTP-Method-Override"
  });
}

function requireSession_(headers, origin) {
  const session = headers?.session;
  if (!session) {
    return { error: unauthorized_(origin) };
  }
  return { session };
}

function requireRole_(headers, origin, roles) {
  const check = requireSession_(headers, origin);
  if (check.error) {
    return check;
  }
  const session = check.session;
  if (roles.indexOf(session.role) === -1) {
    return { error: forbidden_(origin) };
  }
  return { session };
}

