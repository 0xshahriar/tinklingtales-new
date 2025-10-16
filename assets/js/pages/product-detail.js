import { registerPage } from "../app.js";
import { products } from "../../data/products.js";
import { addToCart } from "../cart.js";
import { getQueryParam, formatCurrency, sanitizeHTML, showToast } from "../utils.js";
import { FALLBACK_IMAGE } from "../constants.js";
import { toggleFavourite, isFavourite } from "../wishlist.js";
import { getIcon } from "../icons.js";

function renderProduct(product) {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  const favourite = isFavourite(product.id);
  const favouriteLabel = favourite
    ? `Remove ${sanitizeHTML(product.name)} from favourites`
    : `Save ${sanitizeHTML(product.name)} to favourites`;

  container.innerHTML = `
    <div class="grid grid--split grid--gap-lg">
      <div class="card card--image">
        <img
          src="${product.image}"
          alt="${sanitizeHTML(product.name)}"
          data-product-image
          data-fallback
          data-fallback-src="${FALLBACK_IMAGE}"
          loading="lazy"
        />
      </div>
      <div class="card">
        <span class="badge">${sanitizeHTML(product.category)}</span>
        <h1 class="section__title text-left">${sanitizeHTML(product.name)}</h1>
        <p>${sanitizeHTML(product.description)}</p>
        <div class="chip-group" aria-label="Available colors">
          ${product.colors.map((color) => `<span class="chip">${sanitizeHTML(color)}</span>`).join("")}
        </div>
        <div class="chip-group mt-sm" aria-label="Materials used">
          ${product.materials.map((material) => `<span class="chip">${sanitizeHTML(material)}</span>`).join("")}
        </div>
        <p class="product-rating"><strong>Customer love:</strong> <span class="icon icon--inline">${getIcon("star")}</span> ${
    product.rating
  } (${product.reviews} reviews)</p>
        <div class="flex flex--align-center flex--gap-md mt-md product-detail__actions">
          <span class="card__price card__price--lg">${formatCurrency(product.price)}</span>
          <button type="button" data-action="add-to-cart">Add to cart</button>
          <button
            type="button"
            class="icon-button ${favourite ? "is-active" : ""}"
            data-action="toggle-favorite"
            data-product-name="${sanitizeHTML(product.name)}"
            aria-pressed="${favourite}"
            aria-label="${favouriteLabel}"
          >
            <span class="icon" data-favorite-icon="off" aria-hidden="true" ${favourite ? "hidden" : ""}>${getIcon(
              "heartOutline"
            )}</span>
            <span class="icon" data-favorite-icon="on" aria-hidden="true" ${favourite ? "" : "hidden"}>${getIcon(
              "heart"
            )}</span>
            <span class="icon-button__label">${favourite ? "Saved" : "Save"}</span>
            <span class="sr-only">${favouriteLabel}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupAddToCart(product) {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-action='add-to-cart']");
    const favouriteBtn = event.target.closest("[data-action='toggle-favorite']");

    if (addButton) {
      addToCart(product, 1);
      showToast(`${product.name} added to cart`, "success");
      return;
    }

    if (favouriteBtn) {
      const { favourite } = toggleFavourite(product);
      const productName = favouriteBtn.dataset.productName || product.name;
      const onIcon = favouriteBtn.querySelector('[data-favorite-icon="on"]');
      const offIcon = favouriteBtn.querySelector('[data-favorite-icon="off"]');
      const srOnly = favouriteBtn.querySelector(".sr-only");
      const labelEl = favouriteBtn.querySelector(".icon-button__label");
      const label = favourite
        ? `Remove ${productName} from favourites`
        : `Save ${productName} to favourites`;

      favouriteBtn.classList.toggle("is-active", favourite);
      favouriteBtn.setAttribute("aria-pressed", String(favourite));
      favouriteBtn.setAttribute("aria-label", label);
      if (onIcon) onIcon.hidden = !favourite;
      if (offIcon) offIcon.hidden = favourite;
      if (srOnly) srOnly.textContent = label;
      if (labelEl) labelEl.textContent = favourite ? "Saved" : "Save";

      showToast(
        favourite ? `${product.name} saved to favourites` : `${product.name} removed from favourites`,
        favourite ? "success" : "warning"
      );
    }
  });
}

function setupImageFallback() {
  const image = document.querySelector("[data-product-image]");
  if (!image) return;
  image.addEventListener("error", () => {
    image.setAttribute("src", FALLBACK_IMAGE);
  }, { once: true });
}

registerPage("product-detail", async () => {
  const id = getQueryParam("id");
  if (!id) {
    window.location.replace("shop.html");
    return;
  }

  const product = products.find((item) => item.id === id);
  if (!product) {
    window.location.replace("404.html");
    return;
  }

  renderProduct(product);
  setupAddToCart(product);
  setupImageFallback();
});
