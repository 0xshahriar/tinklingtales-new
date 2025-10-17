import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { mountAdminNav } from "../components/admin-nav.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

const REQUEST_STATUS = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "quoted", label: "Quote shared" },
  { value: "completed", label: "Completed" }
];

let cachedRequests = [];

function renderRequests(requests = []) {
  const container = document.querySelector("[data-custom-requests]");
  if (!container) return;

  if (!requests.length) {
    container.innerHTML = '<p class="text-muted">Custom order inquiries will appear here once a shopper submits the request form.</p>';
    return;
  }

  const items = requests
    .map((request) => {
      const statusDefinition = REQUEST_STATUS.find((status) => status.value === request.status);
      const statusLabel = statusDefinition ? statusDefinition.label : "New";
      return `
        <article class="card">
          <header class="admin-toolbar">
            <div>
              <h3 class="mb-none">${request.name || "Unnamed request"}</h3>
              <p class="text-muted">${request.email || "No email"} • ${new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <span class="badge">${statusLabel}</span>
          </header>
          <p>${request.details || "No details provided."}</p>
          <dl class="data-list">
            <div>
              <dt>Budget</dt>
              <dd>${request.budget ? `${request.budget} BDT` : "Not specified"}</dd>
            </div>
            <div>
              <dt>Occasion</dt>
              <dd>${request.occasion || "—"}</dd>
            </div>
          </dl>
        </article>
      `;
    })
    .join("");

  container.innerHTML = items;
}

async function loadRequests() {
  const token = auth.getState().token;
  try {
    const data = await api.getCustomRequests(token);
    cachedRequests = data.requests || [];
    renderRequests(cachedRequests);
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

function populateRequestSelector() {
  const select = document.querySelector("[data-custom-status]");
  if (!select) return;

  select.innerHTML = REQUEST_STATUS.map((status) => `<option value="${status.value}">${status.label}</option>`).join("");
}

function handleUpdateForm() {
  const form = document.querySelector("[data-custom-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = auth.getState().token;
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const existing = cachedRequests.find((item) => item.requestId === payload.requestId);
    if (!existing) {
      showToast("Request not found", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    try {
      await api.updateCustomRequest(payload, token);
      showToast("Request updated", "success");
      form.reset();
      populateRequestSelector();
      await loadRequests();
    } catch (error) {
      const message = error.status === 403 ? ERROR_MESSAGES.forbidden : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update request";
    }
  });
}

registerPage("admin-custom", async () => {
  mountAdminNav("custom");
  populateRequestSelector();
  await loadRequests();
  handleUpdateForm();
});
