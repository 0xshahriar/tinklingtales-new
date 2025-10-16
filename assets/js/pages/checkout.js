import { registerPage } from "../app.js";
import { getCartTotals, clearCart } from "../cart.js";
import { formatCurrency, showToast } from "../utils.js";
import { api } from "../api.js";
import { auth } from "../auth.js";
import { ERROR_MESSAGES } from "../constants.js";

function populateSummary() {
  const totals = getCartTotals();
  const summary = document.querySelector("[data-checkout-summary]");
  if (!summary) return totals;

  const { cart, subtotal, shipping, total } = totals;

  summary.innerHTML = `
    <ul>
      ${cart
        .map(
          (item) => `
          <li class="summary-row">
            <span>${item.name} × ${item.quantity}</span>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
          </li>
        `
        )
        .join("")}
    </ul>
    <hr />
    <p class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></p>
    <p class="summary-row"><span>Shipping</span><span>${formatCurrency(shipping)}</span></p>
    <p class="summary-row summary-row--bold"><span>Total</span><span>${formatCurrency(total)}</span></p>
  `;

  return totals;
}

function serializeForm(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const { cart, subtotal, shipping, total } = getCartTotals();

  if (!cart.length) {
    showToast("Your cart is empty", "warning");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  const payload = {
    order: serializeForm(form),
    items: cart,
    totals: { subtotal, shipping, total }
  };

  const token = auth.getState().token;

  try {
    await api.createOrder(payload, token);
    clearCart();
    showToast("Order placed successfully!", "success");
    window.location.replace("account.html#orders");
  } catch (error) {
    const message =
      error.status === 401
        ? ERROR_MESSAGES.unauthorized
        : error.status === 403
        ? ERROR_MESSAGES.forbidden
        : ERROR_MESSAGES.unknown;
    showToast(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Place order";
  }
}

registerPage("checkout", async () => {
  const { cart } = populateSummary();
  if (!cart.length) {
    showToast("Add items to cart before checkout", "warning");
    window.location.replace("shop.html");
    return;
  }

  const form = document.querySelector("[data-checkout-form]");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});
