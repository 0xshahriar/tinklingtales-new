function getProductsSheet_() {
  return getSheet_(SHEETS.PRODUCTS);
}

function mapProductRow_(row) {
  const isActiveValue = row.isActive === "" || row.isActive === undefined ? true : normaliseBoolean_(row.isActive);
  return {
    id: row.id,
    name: row.name,
    price: parseNumber_(row.price),
    currency: row.currency || "BDT",
    description: row.description || "",
    images: parseJson_(row.images, []),
    tags: parseJson_(row.tags, []),
    inventory: parseNumber_(row.inventory),
    isActive: isActiveValue,
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || ""
  };
}

function listProducts_(includeInactive) {
  const sheet = getProductsSheet_();
  const table = getTable_(sheet);
  return table.rows
    .map(mapProductRow_)
    .filter(function (product) {
      return includeInactive ? true : product.isActive !== false;
    });
}

function getProductByIdInternal_(id) {
  if (!id) {
    return null;
  }
  const sheet = getProductsSheet_();
  const table = getTable_(sheet);
  for (let index = 0; index < table.rows.length; index++) {
    const row = table.rows[index];
    if ((row.id || "") === id) {
      return { product: mapProductRow_(row), rowIndex: index + 2, headers: table.headers };
    }
  }
  return null;
}

function upsertProduct_(payload) {
  const sheet = getProductsSheet_();
  const table = getTable_(sheet);
  const headers = table.headers;
  const timestamp = nowIso_();
  const existing = payload.id ? getProductByIdInternal_(payload.id) : null;

  const record = {
    id: payload.id || generateId_("prd"),
    name: payload.name || "Unnamed Product",
    price: parseNumber_(payload.price),
    currency: payload.currency || "BDT",
    description: payload.description || "",
    images: serialiseJson_(payload.images || []),
    tags: serialiseJson_(payload.tags || []),
    inventory: parseNumber_(payload.inventory || 0),
    isActive: payload.isActive === false ? false : true,
    updatedAt: timestamp
  };

  if (existing) {
    updateRow_(sheet, headers, existing.rowIndex, Object.assign({}, record, { createdAt: existing.product.createdAt }));
    return Object.assign({}, existing.product, record);
  }

  record.createdAt = timestamp;
  appendRow_(sheet, headers, record);
  return mapProductRow_(record);
}

function deleteProduct_(id) {
  const existing = getProductByIdInternal_(id);
  if (!existing) {
    return false;
  }
  const sheet = getProductsSheet_();
  deleteRow_(sheet, existing.rowIndex);
  return true;
}

function handleProductRoute(method, resourceId, body, origin) {
  if (method === "GET" && !resourceId) {
    const products = listProducts_(false);
    return createResponse_(HTTP_STATUS.OK, { products }, origin);
  }

  if (method === "GET" && resourceId) {
    const product = getProductByIdInternal_(resourceId);
    if (!product) {
      return notFound_(origin);
    }
    return createResponse_(HTTP_STATUS.OK, { product: product.product }, origin);
  }

  return methodNotAllowed_(origin);
}
