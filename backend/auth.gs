function getSessionsSheet_() {
  return getSheet_(SHEETS.SESSIONS);
}

function hashPassword_(password) {
  if (!password) {
    throw new Error("Password is required");
  }
  const secret = CONFIG.jwtSecret || "tinklingtales";
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret + password);
  return Utilities.base64Encode(digest);
}

function verifyPassword_(password, hash) {
  if (!hash) {
    return false;
  }
  return hashPassword_(password) === hash;
}

function createSession_(user) {
  const sheet = getSessionsSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const issuedAt = nowIso_();
  const expiresAtDate = new Date();
  expiresAtDate.setHours(expiresAtDate.getHours() + CONFIG.tokenExpiryHours);
  const tokenSeed = user.userId + "|" + issuedAt + "|" + Utilities.getUuid();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, (CONFIG.jwtSecret || "tinkling") + tokenSeed);
  const token = Utilities.base64EncodeWebSafe(digest);

  appendRow_(sheet, headers, {
    token,
    userId: user.userId,
    role: user.role,
    issuedAt,
    expiresAt: expiresAtDate.toISOString()
  });

  return {
    token,
    userId: user.userId,
    role: user.role,
    issuedAt,
    expiresAt: expiresAtDate.toISOString()
  };
}

function getSessionByToken(token) {
  if (!token) {
    throw new Error("Session token missing");
  }
  const sheet = getSessionsSheet_();
  const table = getTable_(sheet);

  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if (row.token === token) {
      const expiresAt = new Date(row.expiresAt);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
        deleteRow_(sheet, index + 2);
        throw new Error("Session expired");
      }
      return {
        token: row.token,
        userId: row.userId,
        role: row.role,
        issuedAt: row.issuedAt,
        expiresAt: row.expiresAt
      };
    }
  }
  throw new Error("Session not found");
}

function destroySession_(token) {
  if (!token) {
    return;
  }
  const sheet = getSessionsSheet_();
  const table = getTable_(sheet);
  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if (row.token === token) {
      deleteRow_(sheet, index + 2);
      return;
    }
  }
}

function handleAuthRoute(method, resourceId, body, origin) {
  switch (resourceId) {
    case "login":
      if (method !== "POST") {
        return methodNotAllowed_(origin);
      }
      return handleLogin_(body, origin);
    case "register":
      if (method !== "POST") {
        return methodNotAllowed_(origin);
      }
      return handleRegister_(body, origin);
    case "forgot-password":
      if (method !== "POST") {
        return methodNotAllowed_(origin);
      }
      return handleForgotPassword_(body, origin);
    default:
      return notFound_(origin);
  }
}

function handleLogin_(body, origin) {
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!email || !password) {
    return badRequest_(origin, "Email and password are required");
  }

  const lookup = getUserByEmail_(email);
  if (!lookup) {
    return createResponse_(HTTP_STATUS.UNAUTHORIZED, { message: "Invalid credentials" }, origin);
  }

  if (!verifyPassword_(password, lookup.user.passwordHash)) {
    return createResponse_(HTTP_STATUS.UNAUTHORIZED, { message: "Invalid credentials" }, origin);
  }

  const session = createSession_(lookup.user);
  const profile = {
    userId: lookup.user.userId,
    name: lookup.user.name,
    email: lookup.user.email,
    phone: lookup.user.phone || ""
  };
  const isAdmin = lookup.user.role === "admin" || lookup.user.role === "manager";

  return createResponse_(HTTP_STATUS.OK, {
    token: session.token,
    profile,
    isAdmin
  }, origin);
}

function handleRegister_(body, origin) {
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();
  const name = (body.name || "").toString().trim();

  if (!email || !password) {
    return badRequest_(origin, "Email and password are required");
  }

  try {
    const user = createUser_({
      email,
      passwordHash: hashPassword_(password),
      name,
      phone: body.phone || "",
      preferredChannel: body.preferredChannel || "",
      role: "customer"
    });
    return createResponse_(HTTP_STATUS.CREATED, {
      userId: user.userId,
      email: user.email
    }, origin);
  } catch (error) {
    if (error && error.message && error.message.indexOf("exists") > -1) {
      return createResponse_(HTTP_STATUS.CONFLICT, { message: error.message }, origin);
    }
    return serverError_(origin, error);
  }
}

function getPasswordResetSheet_() {
  return getSheet_(SHEETS.PASSWORD_RESETS);
}

function handleForgotPassword_(body, origin) {
  const email = (body.email || "").toString().trim().toLowerCase();
  if (!email) {
    return badRequest_(origin, "Email is required");
  }

  const lookup = getUserByEmail_(email);
  if (!lookup) {
    return createResponse_(HTTP_STATUS.NOT_FOUND, { message: "Account not found" }, origin);
  }

  const sheet = getPasswordResetSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const token = generateId_("rst");
  const expiresAtDate = new Date();
  expiresAtDate.setHours(expiresAtDate.getHours() + 1);

  appendRow_(sheet, headers, {
    token,
    userId: lookup.user.userId,
    expiresAt: expiresAtDate.toISOString(),
    createdAt: nowIso_()
  });

  return createResponse_(HTTP_STATUS.OK, {
    message: "Password reset recorded",
    token
  }, origin);
}
