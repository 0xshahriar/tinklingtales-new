import { registerPage } from "../app.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { mountAdminNav } from "../components/admin-nav.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

function renderUsers(users = []) {
  const container = document.querySelector("[data-admin-users]");
  if (!container) return;

  if (!users.length) {
    container.innerHTML = `<p class="text-muted">Invite your teammates to collaborate on fulfilment and catalogue management.</p>`;
    return;
  }

  const rows = users
    .map(
      (user) => `
        <tr>
          <td data-label="Name">${user.name || "—"}</td>
          <td data-label="Email">${user.email}</td>
          <td data-label="Role">${user.role}</td>
          <td data-label="Last active">${user.lastActive ? new Date(user.lastActive).toLocaleString() : "—"}</td>
        </tr>
      `
    )
    .join("");

  container.innerHTML = `
    <table class="table table--responsive">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Last active</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadUsers() {
  const token = auth.getState().token;
  try {
    const data = await api.getAdminUsers(token);
    renderUsers(data.users || []);
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

function handleRoleForm() {
  const form = document.querySelector("[data-role-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = auth.getState().token;
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      await api.updateUserRole(payload, token);
      showToast("User role updated", "success");
      form.reset();
      await loadUsers();
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

registerPage("admin-users", async () => {
  mountAdminNav("users");
  await loadUsers();
  handleRoleForm();
});
