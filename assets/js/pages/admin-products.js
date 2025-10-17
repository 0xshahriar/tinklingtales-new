import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { mountAdminNav } from "../components/admin-nav.js";
import { showToast, formatCurrency } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

let cachedProducts = [];

function renderProductList(products = []) {
  const container = document.querySelector("[data-admin-product-list]");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = `<p class="text-muted">No products found. Add a new product to populate your shop.</p>`;
    return;
  }

  const rows = products
    .map(
      (product) => `
        <tr>
          <td data-label="ID">${product.id}</td>
          <td data-label="Name">${product.name}</td>
          <td data-label="Price">${formatCurrency(product.price)}</td>
          <td data-label="Category">${product.category || "—"}</td>
          <td data-label="Updated">${product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "—"}</td>
        </tr>
      `
    )
    .join("");

  container.innerHTML = `
    <table class="table table--responsive">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price (BDT)</th>
          <th>Category</th>
          <th>Last updated</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadProducts() {
  try {
    const data = await api.getProducts();
    cachedProducts = data.products || data || [];
    renderProductList(cachedProducts);
  } catch (error) {
    console.error("Failed to load products", error);
    showToast(ERROR_MESSAGES.unknown, "error");
  }
}

function handleUpsertForm() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = auth.getState().token;
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.price = Number(payload.price);

    if (Number.isNaN(payload.price)) {
      showToast("Enter a valid price in BDT", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      await api.upsertProduct(payload, token);
      showToast("Product saved", "success");
      form.reset();
      await loadProducts();
    } catch (error) {
      const message = error.status === 403 ? ERROR_MESSAGES.forbidden : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save product";
    }
  });
}

function handleDeleteForm() {
  const form = document.querySelector("[data-product-delete]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = auth.getState().token;
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const productId = formData.get("productId");

    submitBtn.disabled = true;
    submitBtn.textContent = "Removing...";

    try {
      await api.deleteProduct(productId, token);
      showToast("Product removed", "success");
      form.reset();
      await loadProducts();
    } catch (error) {
      const message =
        error.status === 404
          ? "Product not found"
          : error.status === 403
          ? ERROR_MESSAGES.forbidden
          : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Remove product";
    }
  });
}

registerPage("admin-products", async () => {
  mountAdminNav("products");
  await loadProducts();
  handleUpsertForm();
  handleDeleteForm();
});
