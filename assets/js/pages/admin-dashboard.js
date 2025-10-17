import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { mountAdminNav } from "../components/admin-nav.js";
import { formatCurrency, showToast } from "../utils.js";
import { ORDER_STATUS, ERROR_MESSAGES } from "../constants.js";

function renderStats(stats = {}) {
  const container = document.querySelector("[data-admin-stats]");
  if (!container) return;

  const cards = [
    { label: "Total revenue", value: formatCurrency(stats.revenue || 0) },
    { label: "Average order", value: formatCurrency(stats.averageOrder || 0) },
    { label: "Orders", value: stats.orders || 0 },
    { label: "New customers", value: stats.customers || 0 }
  ]
    .map(
      ({ label, value }) => `
        <div class="card">
          <p class="text-muted">${label}</p>
          <h3 class="mb-none">${value}</h3>
        </div>
      `
    )
    .join("");

  container.innerHTML = cards;
}

function renderTrend(trend = []) {
  const container = document.querySelector("[data-admin-trend]");
  if (!container) return;

  if (!trend.length) {
    container.innerHTML = `<p class="text-muted">Trend data will appear once you start receiving orders.</p>`;
    return;
  }

  const items = trend
    .slice(-7)
    .map((point) => {
      const dateLabel = new Date(point.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      return `
        <li>
          <span>${dateLabel}</span>
          <strong>${formatCurrency(point.revenue)}</strong>
        </li>
      `;
    })
    .join("");

  container.innerHTML = `
    <ul class="stat-list">
      ${items}
    </ul>
  `;
}

function renderTopProducts(products = []) {
  const container = document.querySelector("[data-admin-top-products]");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = `<p class="text-muted">No product performance data yet. Keep an eye on this panel after your first few orders.</p>`;
    return;
  }

  const items = products
    .slice(0, 5)
    .map(
      (product) => `
        <li>
          <span>${product.name}</span>
          <span>${product.unitsSold || 0} sold</span>
        </li>
      `
    )
    .join("");

  container.innerHTML = `
    <ul class="stat-list stat-list--two-column">
      ${items}
    </ul>
  `;
}

function renderRecentOrders(orders = []) {
  const container = document.querySelector("[data-admin-recent-orders]");
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = `<p class="text-muted">Recent orders will surface here once customers start checking out.</p>`;
    return;
  }

  const rows = orders
    .slice(0, 5)
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
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
          <th>Order #</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Placed</th>
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
    renderTrend(data.trend || []);
    renderTopProducts(data.topProducts || []);
    renderRecentOrders(data.recentOrders || []);
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

registerPage("admin-dashboard", async () => {
  mountAdminNav("dashboard");
  await loadDashboard();
});
