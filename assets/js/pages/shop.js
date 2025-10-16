import { registerPage } from "../app.js";
import { products } from "../../data/products.js";
import { addToCart } from "../cart.js";
import { formatCurrency, sanitizeHTML, debounce, showToast } from "../utils.js";

function renderProductCard(product) {
  return `
    <article class="card product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${sanitizeHTML(product.name)}" class="product-card__image" loading="lazy" />
      <div class="product-card__content">
        <h3 class="card__title">${sanitizeHTML(product.name)}</h3>
        <p>${sanitizeHTML(product.description)}</p>
        <div class="chip-group">
          ${product.colors.map((color) => `<span class="chip">${sanitizeHTML(color)}</span>`).join("")}
        </div>
        <div class="product-card__actions">
          <span class="card__price">${formatCurrency(product.price)}</span>
          <div>
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

function handleCartActions() {
  const container = document.querySelector("[data-product-list]");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='add-to-cart']");
    if (!button) return;

    const card = button.closest("[data-product-id]");
    if (!card) return;

    const product = products.find((item) => item.id === card.dataset.productId);
    if (!product) return;

    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success");
  });
}

registerPage("shop", async () => {
  renderProducts(products);
  handleFilters();
  handleCartActions();
});
