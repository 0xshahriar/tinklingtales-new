import { registerPage } from "../app.js";
import { api } from "../api.js";
import { login as loginUser } from "../auth.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

function parseRedirect() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") === "true") {
    return "admin.html";
  }
  return params.get("redirect") || "account.html";
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type='submit']");

  const formData = new FormData(form);
  const credentials = Object.fromEntries(formData.entries());

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    const response = await api.authenticate(credentials);
    loginUser({
      token: response.token,
      profile: response.profile,
      isAdmin: Boolean(response.isAdmin)
    });
    showToast("Welcome back!", "success");
    window.location.replace(parseRedirect());
  } catch (error) {
    const message =
      error.status === 401 ? "Invalid login details. Please try again." : ERROR_MESSAGES.unknown;
    showToast(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";
  }
}

registerPage("login", async () => {
  const form = document.querySelector("[data-login-form]");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});
