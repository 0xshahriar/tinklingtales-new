import { registerPage } from "../app.js";
import { api } from "../api.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

registerPage("forgot-password", async () => {
  const form = document.querySelector("[data-forgot-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      await api.requestPasswordReset(payload);
      showToast("Reset instructions sent. Please check your email.", "success");
      form.reset();
    } catch (error) {
      const message = error.status === 404 ? "Account not found" : ERROR_MESSAGES.unknown;
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send reset link";
    }
  });
});
