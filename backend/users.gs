function getUsersSheet_() {
  return getSheet_(SHEETS.USERS);
}

function mapUserRow_(row) {
  if (!row) {
    return null;
  }
  return {
    userId: row.userId,
    email: (row.email || "").toString().trim().toLowerCase(),
    passwordHash: row.passwordHash || "",
    name: row.name || "",
    phone: row.phone || "",
    preferredChannel: row.preferredChannel || "",
    role: row.role || "customer",
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || ""
  };
}

function getUserByEmail_(email) {
  if (!email) {
    return null;
  }
  const sheet = getUsersSheet_();
  const table = getTable_(sheet);
  const target = (email || "").toString().trim().toLowerCase();

  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if ((row.email || "").toString().trim().toLowerCase() === target) {
      return { user: mapUserRow_(row), rowIndex: index + 2, headers: table.headers };
    }
  }
  return null;
}

function getUserById_(userId) {
  if (!userId) {
    return null;
  }
  const sheet = getUsersSheet_();
  const table = getTable_(sheet);

  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if ((row.userId || "") === userId) {
      return { user: mapUserRow_(row), rowIndex: index + 2, headers: table.headers };
    }
  }
  return null;
}

function createUser_(payload) {
  const sheet = getUsersSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;

  if (getUserByEmail_(payload.email)) {
    throw new Error("A user with this email already exists");
  }

  const timestamp = nowIso_();
  const user = {
    userId: payload.userId || generateId_("usr"),
    email: payload.email,
    passwordHash: payload.passwordHash,
    name: payload.name || "",
    phone: payload.phone || "",
    preferredChannel: payload.preferredChannel || "",
    role: payload.role || "customer",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  appendRow_(sheet, headers, user);
  return user;
}

function updateUserRole_(userId, role) {
  const lookup = getUserById_(userId);
  if (!lookup) {
    return null;
  }
  const sheet = getUsersSheet_();
  const headers = lookup.headers;
  const updatedAt = nowIso_();
  updateRow_(sheet, headers, lookup.rowIndex, { role, updatedAt });
  return Object.assign({}, lookup.user, { role, updatedAt });
}

function listUsers_() {
  const sheet = getUsersSheet_();
  const table = getTable_(sheet);
  return table.rows.map(mapUserRow_);
}
