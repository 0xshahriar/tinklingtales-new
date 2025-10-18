function nowIso_() {
  return new Date().toISOString();
}

function generateId_(prefix) {
  const uuid = Utilities.getUuid();
  return prefix ? prefix + "_" + uuid : uuid;
}

function normaliseBoolean_(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    return normalised === "true" || normalised === "1" || normalised === "yes";
  }
  return false;
}

function parseNumber_(value) {
  if (typeof value === "number") {
    return value;
  }
  if (!value) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function serialiseJson_(value) {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

function parseJson_(value, fallback) {
  if (!value || typeof value !== "string") {
    return fallback || null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback || null;
  }
}

function getTable_(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return { headers, rows };
}

function appendRow_(sheet, headers, payload) {
  const row = headers.map(function (header) {
    return payload[header] !== undefined ? payload[header] : "";
  });
  sheet.appendRow(row);
}

function updateRow_(sheet, headers, rowIndex, payload) {
  const range = sheet.getRange(rowIndex, 1, 1, headers.length);
  const values = range.getValues();
  const existing = values[0];
  const updated = headers.map(function (header, idx) {
    const current = existing[idx];
    return payload.hasOwnProperty(header) ? payload[header] : current;
  });
  range.setValues([updated]);
}

function deleteRow_(sheet, rowIndex) {
  sheet.deleteRow(rowIndex);
}
