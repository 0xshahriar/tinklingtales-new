import { registerPage } from "../app.js";
import { auth } from "../auth.js";
import { api } from "../api.js";
import { formatCurrency, showToast } from "../utils.js";
import { ORDER_STATUS, ERROR_MESSAGES } from "../constants.js";

function populateProfile(profile) {
  const profileContainer = document.querySelector("[data-profile]");
  if (!profileContainer) return;

  profileContainer.innerHTML = `
    <div class="card">
      <h2>${profile.name || "Guest"}</h2>
      <p>${profile.email || "No email on file"}</p>
      <p>${profile.phone || "No phone on file"}</p>
      <button type="button" class="button-link" data-action="logout">Sign out</button>
    </div>
  `;
}

function renderOrders(orders = []) {
  const table = document.querySelector("[data-orders]");
  if (!table) return;

  if (!orders.length) {
    table.innerHTML = `<p>You have not placed any orders yet.</p>`;
    return;
  }

  const rows = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      return `
        <tr>
          <td>${order.orderId}</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>${formatCurrency(order.total)}</td>
          <td><span class="${status.className}">${status.label}</span></td>
        </tr>
      `;
    })
    .join("");

  table.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Date</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadOrders() {
  const token = auth.getState().token;
  try {
    const data = await api.getOrders(token);
    renderOrders(data.orders || []);
  } catch (error) {
    const message = error.status === 401 ? ERROR_MESSAGES.unauthorized : ERROR_MESSAGES.unknown;
    showToast(message, "error");
  }
}

registerPage("account", async () => {
  const { profile } = auth.getState();
  populateProfile(profile || {});
  await loadOrders();
});
