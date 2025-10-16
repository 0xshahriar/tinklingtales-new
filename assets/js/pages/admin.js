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

registerPage("admin", async () => {
  await loadDashboard();
});
