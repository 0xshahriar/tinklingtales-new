import { registerPage } from "../app.js";
import { getCartTotals, updateQuantity, removeFromCart, clearCart } from "../cart.js";
import { formatCurrency, showToast } from "../utils.js";
import { getIcon } from "../icons.js";

function renderCartTable(cart) {
  const tbody = document.querySelector("[data-cart-body]");
  const emptyState = document.querySelector("[data-empty-cart]");

  if (!tbody || !emptyState) return;

  if (!cart.length) {
    tbody.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  tbody.innerHTML = cart
    .map(
      (item) => `
      <tr data-product-id="${item.id}">
        <td data-label="Item">
          <strong>${item.name}</strong>
          <div class="text-muted text-sm">${item.category}</div>
        </td>
        <td data-label="Price">${formatCurrency(item.price)}</td>
        <td data-label="Qty">
          <div class="quantity-control" data-quantity>
            <button
              type="button"
              class="quantity-control__btn"
              data-action="decrease-quantity"
              aria-label="Decrease quantity for ${item.name}"
            >
              <span class="icon icon--inline" aria-hidden="true">${getIcon("minus")}</span>
            </button>
            <input
              type="number"
              min="1"
              value="${item.quantity}"
              data-action="update-quantity"
              aria-label="Update quantity for ${item.name}"
            />
            <button
              type="button"
              class="quantity-control__btn"
              data-action="increase-quantity"
              aria-label="Increase quantity for ${item.name}"
            >
              <span class="icon icon--inline" aria-hidden="true">${getIcon("plus")}</span>
            </button>
          </div>
        </td>
        <td data-label="Total">${formatCurrency(item.price * item.quantity)}</td>
        <td data-label="Remove">
          <button type="button" class="button-link" data-action="remove-item">Remove</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderTotals({ subtotal, shipping, total }) {
  const subtotalEl = document.querySelector("[data-subtotal]");
  const shippingEl = document.querySelector("[data-shipping]");
  const totalEl = document.querySelector("[data-total]");

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (shippingEl) shippingEl.textContent = formatCurrency(shipping);
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function refreshCart() {
  const totals = getCartTotals();
  renderCartTable(totals.cart);
  renderTotals(totals);
}

function handleCartEvents() {
  const table = document.querySelector("[data-cart-table]");
  if (!table) return;

  table.addEventListener("change", (event) => {
    const input = event.target.closest("[data-action='update-quantity']");
    if (!input) return;

    const row = input.closest("[data-product-id]");
    const productId = row?.dataset.productId;
    const quantity = parseInt(input.value, 10) || 1;

    updateQuantity(productId, quantity);
    refreshCart();
    showToast("Cart updated", "success");
  });

  table.addEventListener("click", (event) => {
    const adjustButton = event.target.closest(
      "[data-action='increase-quantity'], [data-action='decrease-quantity']"
    );

    if (adjustButton) {
      const row = adjustButton.closest("[data-product-id]");
      const productId = row?.dataset.productId;
      const input = row?.querySelector("[data-action='update-quantity']");
      if (!productId || !input) return;

      const delta = adjustButton.dataset.action === "increase-quantity" ? 1 : -1;
      const currentValue = parseInt(input.value, 10) || 1;
      const nextValue = Math.max(1, currentValue + delta);

      if (nextValue === currentValue) return;

      updateQuantity(productId, nextValue);
      refreshCart();
      showToast("Cart updated", "success");
      return;
    }

    const button = event.target.closest("[data-action='remove-item']");
    if (!button) return;

    const row = button.closest("[data-product-id]");
    const productId = row?.dataset.productId;
    removeFromCart(productId);
    refreshCart();
    showToast("Item removed", "warning");
  });
}

function handleCheckoutButton() {
  const checkoutBtn = document.querySelector("[data-action='checkout']");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const { cart } = getCartTotals();
    if (!cart.length) {
      showToast("Add items to your cart before checking out", "warning");
      return;
    }
    window.location.href = "checkout.html";
  });
}

function handleClearCart() {
  const clearBtn = document.querySelector("[data-action='clear-cart']");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    clearCart();
    refreshCart();
    showToast("Cart cleared", "warning");
  });
}

registerPage("cart", async () => {
  refreshCart();
  handleCartEvents();
  handleCheckoutButton();
  handleClearCart();
});
