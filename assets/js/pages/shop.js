import { registerPage } from "../app.js";
import { products } from "../../data/products.js";
import { addToCart } from "../cart.js";
import { formatCurrency, sanitizeHTML, debounce, showToast } from "../utils.js";
import { FALLBACK_IMAGE } from "../constants.js";
import { toggleFavourite, isFavourite } from "../wishlist.js";
import { getIcon } from "../icons.js";

function favouriteButtonMarkup(product) {
  const favourite = isFavourite(product.id);
  const label = favourite
    ? `Remove ${sanitizeHTML(product.name)} from favourites`
    : `Save ${sanitizeHTML(product.name)} to favourites`;

  return `
    <button
      type="button"
      class="icon-button product-card__favorite ${favourite ? "is-active" : ""}"
      data-action="toggle-favorite"
      data-product-name="${sanitizeHTML(product.name)}"
      aria-pressed="${favourite}"
      aria-label="${label}"
    >
      <span class="icon" data-favorite-icon="off" aria-hidden="true" ${favourite ? "hidden" : ""}>${getIcon(
        "heartOutline"
      )}</span>
      <span class="icon" data-favorite-icon="on" aria-hidden="true" ${favourite ? "" : "hidden"}>${getIcon("heart")}</span>
      <span class="icon-button__label">${favourite ? "Saved" : "Save"}</span>
      <span class="sr-only">${label}</span>
    </button>
  `;
}

function updateFavouriteButtonState(button, isActive) {
  const productName = button.dataset.productName || "item";
  const onIcon = button.querySelector('[data-favorite-icon="on"]');
  const offIcon = button.querySelector('[data-favorite-icon="off"]');
  const srOnly = button.querySelector(".sr-only");
  const labelEl = button.querySelector(".icon-button__label");
  const label = isActive
    ? `Remove ${productName} from favourites`
    : `Save ${productName} to favourites`;

  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.setAttribute("aria-label", label);
  if (onIcon) onIcon.hidden = !isActive;
  if (offIcon) offIcon.hidden = isActive;
  if (srOnly) srOnly.textContent = label;
  if (labelEl) labelEl.textContent = isActive ? "Saved" : "Save";
}

function renderProductCard(product) {
  return `
    <article class="card product-card" data-product-id="${product.id}">
      <img
        src="${product.image}"
        alt="${sanitizeHTML(product.name)}"
        class="product-card__image"
        loading="lazy"
        onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
      />
      <div class="product-card__content">
        <h3 class="card__title">${sanitizeHTML(product.name)}</h3>
        <p>${sanitizeHTML(product.description)}</p>
        <div class="chip-group">
          ${product.colors.map((color) => `<span class="chip">${sanitizeHTML(color)}</span>`).join("")}
        </div>
        <div class="product-card__actions">
          <span class="card__price">${formatCurrency(product.price)}</span>
          <div class="product-card__buttons">
            ${favouriteButtonMarkup(product)}
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="button-link">Details</a>
            <button type="button" data-action="add-to-cart">Add to cart</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function filterProducts({ search = "", category = "all" }) {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts(list) {
  const container = document.querySelector("[data-product-list]");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p>No products found. Try adjusting your filters.</p>`;
    return;
  }

  container.innerHTML = list.map(renderProductCard).join("");
}

function handleFilters() {
  const searchInput = document.querySelector("[data-filter='search']");
  const categoryChips = document.querySelectorAll("[data-filter='category']");

  let state = { search: "", category: "all" };

  const applyFilters = () => {
    const filtered = filterProducts(state);
    renderProducts(filtered);
  };

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((event) => {
        state = { ...state, search: event.target.value };
        applyFilters();
      }, 200)
    );
  }

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      categoryChips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      state = { ...state, category: chip.dataset.value };
      applyFilters();
    });
  });
}

function handleProductInteractions() {
  const container = document.querySelector("[data-product-list]");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='add-to-cart']");
    const favouriteBtn = event.target.closest("[data-action='toggle-favorite']");

    if (favouriteBtn) {
      const card = favouriteBtn.closest("[data-product-id]");
      if (!card) return;
      const product = products.find((item) => item.id === card.dataset.productId);
      if (!product) return;
      const { favourite } = toggleFavourite(product);
      updateFavouriteButtonState(favouriteBtn, favourite);
      showToast(
        favourite ? `${product.name} saved to favourites` : `${product.name} removed from favourites`,
        favourite ? "success" : "warning"
      );
      return;
    }

    if (button) {
      const card = button.closest("[data-product-id]");
      if (!card) return;

      const product = products.find((item) => item.id === card.dataset.productId);
      if (!product) return;

      addToCart(product, 1);
      showToast(`${product.name} added to cart`, "success");
    }
  });
}

function hydrateSearchIcon() {
  const iconHolder = document.querySelector("[data-icon='search-field']");
  if (iconHolder) {
    iconHolder.innerHTML = getIcon("search");
  }
}

registerPage("shop", async () => {
  renderProducts(products);
  handleFilters();
  handleProductInteractions();
  hydrateSearchIcon();
});
