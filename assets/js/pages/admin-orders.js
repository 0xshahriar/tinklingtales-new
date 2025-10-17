import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { mountAdminNav } from "../components/admin-nav.js";
import { formatCurrency, showToast } from "../utils.js";
import { ORDER_STATUS, ORDER_STATUS_FLOW, ERROR_MESSAGES } from "../constants.js";

let cachedOrders = [];

function renderOrdersTable(orders = []) {
  const container = document.querySelector("[data-admin-orders]");
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = `<p class="text-muted">No orders yet. Once customers place orders, they will appear here for fulfilment.</p>`;
    return;
  }

  const rows = orders
    .map((order) => {
      const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
      const autoLocked = order.status !== "pending" && Boolean(order.locked);
      return `
        <tr>
          <td data-label="Order">${order.orderId}</td>
          <td data-label="Customer">${order.customerName}</td>
          <td data-label="Total">${formatCurrency(order.total)}</td>
          <td data-label="Placed">${new Date(order.createdAt).toLocaleString()}</td>
          <td data-label="Status"><span class="${status.className}">${status.label}</span>${
            autoLocked ? '<span class="badge badge--info">Locked</span>' : ""
          }</td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <table class="table table--responsive">
      <thead>
        <tr>
          <th>Order</th>
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

function populateStatusOptions() {
  const select = document.querySelector("[data-order-status]");
  if (!select) return;

  select.innerHTML = ORDER_STATUS_FLOW.map(
    (status) => `
      <option value="${status}">${ORDER_STATUS[status].label}</option>
    `
  ).join("");
}

async function autoConfirmOrders(orders, token) {
  const updates = [];
  const now = Date.now();

  const normalised = orders.map((order) => {
    if (order.status !== "pending") {
      return order;
    }

    const createdAt = new Date(order.createdAt).getTime();
    if (Number.isNaN(createdAt)) {
      return order;
    }

    const elapsedHours = (now - createdAt) / (1000 * 60 * 60);
    if (elapsedHours >= 2) {
      updates.push({ orderId: order.orderId, status: "confirmed" });
      return { ...order, status: "confirmed", locked: true };
    }

    return order;
  });

  if (!updates.length) {
    return normalised;
  }

  await Promise.all(
    updates.map((payload) =>
      api.updateOrderStatus(payload, token).catch((error) => {
        console.error("Auto confirmation failed", error);
        return null;
      })
    )
  );

  if (updates.length) {
    showToast(`${updates.length} order${updates.length > 1 ? "s" : ""} auto-confirmed after 2 hours`, "info");
  }

  return normalised;
}

async function loadOrders() {
  const token = auth.getState().token;
  try {
    const data = await api.getAdminOrders(token);
    const orders = await autoConfirmOrders(data.orders || [], token);
    cachedOrders = orders;
    renderOrdersTable(orders);
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

function handleOrderForm() {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = auth.getState().token;
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const targetStatus = payload.status;

    const existing = cachedOrders.find((order) => order.orderId === payload.orderId);
    if (existing) {
      const currentIndex = ORDER_STATUS_FLOW.indexOf(existing.status);
      const nextIndex = ORDER_STATUS_FLOW.indexOf(targetStatus);
      if (nextIndex === -1) {
        showToast("Select a valid status from the list.", "error");
        return;
      }
      if (nextIndex < currentIndex) {
        showToast("Orders can only move forward in the fulfilment flow.", "warning");
        return;
      }
      if (currentIndex >= 0 && ORDER_STATUS_FLOW[currentIndex] !== "pending" && targetStatus === "pending") {
        showToast("Confirmed orders cannot be reverted to pending.", "warning");
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      await api.updateOrderStatus(payload, token);
      showToast("Order status updated", "success");
      form.reset();
      populateStatusOptions();
      await loadOrders();
    } catch (error) {
      const message =
        error.status === 404
          ? "Order not found"
          : error.status === 403
          ? ERROR_MESSAGES.forbidden
          : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update order";
    }
  });
}

registerPage("admin-orders", async () => {
  mountAdminNav("orders");
  populateStatusOptions();
  await loadOrders();
  handleOrderForm();
});
