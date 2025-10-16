import { registerPage } from "../app.js";
import { api } from "../api.js";
import { showToast } from "../utils.js";
import { ERROR_MESSAGES } from "../constants.js";

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const formData = new FormData(form);

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    await api.createOrder({
      type: "custom-request",
      payload: Object.fromEntries(formData.entries())
    });
    form.reset();
    showToast("Your custom request has been sent!", "success");
  } catch (error) {
    const message = error.status ? ERROR_MESSAGES.unknown : ERROR_MESSAGES.network;
    showToast(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit request";
  }
}

registerPage("custom", async () => {
  const form = document.querySelector("[data-custom-form]");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});
