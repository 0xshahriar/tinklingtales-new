import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { formatCurrency, showToast } from "../utils.js";
import { ORDER_STATUS, ERROR_MESSAGES } from "../constants.js";

function renderStats(stats) {
  const container = document.querySelector("[data-admin-stats]");
  if (!container) return;

  const cards = [
    { label: "Total Revenue", value: formatCurrency(stats.revenue || 0) },
    { label: "Orders", value: stats.orders || 0 },
    { label: "Pending", value: stats.pending || 0 },
    { label: "Customers", value: stats.customers || 0 }
  ]
    .map(
      (item) => `
      <div class="card text-center">
        <h3>${item.value}</h3>
        <p class="text-muted">${item.label}</p>
      </div>
    `
    )
    .join("");

  container.innerHTML = cards;
}

function renderOrdersTable(orders = []) {
  const container = document.querySelector("[data-admin-orders]");
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = `<p>No orders yet.</p>`;
    return;
  }

  const rows = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.processing;
      return `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.customerName}</td>
          <td>${formatCurrency(order.total)}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td><span class="${status.className}">${status.label}</span></td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadDashboard() {
  const token = auth.getState().token;
  try {
    const data = await api.getDashboard(token);
    renderStats(data.stats || {});
    renderOrdersTable(data.recentOrders || []);
  } catch (error) {
    const message =
      error.status === 401
        ? ERROR_MESSAGES.unauthorized
        : error.status === 403
        ? ERROR_MESSAGES.forbidden
        : ERROR_MESSAGES.unknown;
    showToast(message, "error");
  }
}

function handleProductForm() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    const token = auth.getState().token;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.price = Number(payload.price);
    if (Number.isNaN(payload.price)) {
      showToast("Enter a valid price in BDT", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Save product";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      await api.upsertProduct(payload, token);
      showToast("Product saved successfully", "success");
      form.reset();
      await loadDashboard();
    } catch (error) {
      const message = error.status === 403 ? ERROR_MESSAGES.forbidden : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save product";
    }
  });
}

function handleOrderForm() {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    const token = auth.getState().token;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    try {
      await api.updateOrderStatus(payload, token);
      showToast("Order status updated", "success");
      form.reset();
      await loadDashboard();
    } catch (error) {
      const message =
        error.status === 404 ? "Order not found" : error.status === 403 ? ERROR_MESSAGES.forbidden : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update order";
    }
  });
}

function handleRoleForm() {
  const form = document.querySelector("[data-role-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    const token = auth.getState().token;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    try {
      await api.updateUserRole(payload, token);
      showToast("User role updated", "success");
      form.reset();
    } catch (error) {
      const message =
        error.status === 404
          ? "User not found"
          : error.status === 403
          ? ERROR_MESSAGES.forbidden
          : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update role";
    }
  });
}

registerPage("admin", async () => {
  await loadDashboard();
  handleProductForm();
  handleOrderForm();
  handleRoleForm();
});
