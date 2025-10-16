import { registerPage } from "../app.js";
import { api } from "../api.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

function validatePasswords(password, confirmPassword) {
  if (password !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return false;
  }
  if (password.length < 6) {
    showToast("Password should be at least 6 characters", "error");
    return false;
  }
  return true;
}

async function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!validatePasswords(data.password, data.confirmPassword)) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    await api.registerAccount({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      preferredChannel: data.preferredChannel || null
    });
    showToast("Account created! Please sign in.", "success");
    window.location.replace("login.html");
  } catch (error) {
    const message = error.status === 409 ? "An account with this email already exists." : ERROR_MESSAGES.unknown;
    showToast(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
}

registerPage("signup", async () => {
  const form = document.querySelector("[data-signup-form]");
  if (form) {
    form.addEventListener("submit", handleSignup);
  }
});
