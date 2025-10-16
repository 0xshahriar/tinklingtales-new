import { registerPage } from "../app.js";
import { products } from "../../data/products.js";
import { addToCart } from "../cart.js";
import { getQueryParam, formatCurrency, sanitizeHTML, showToast } from "../utils.js";
import { FALLBACK_IMAGE } from "../constants.js";

function renderProduct(product) {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid--split grid--gap-lg">
      <div class="card card--image">
        <img src="${product.image}" alt="${sanitizeHTML(product.name)}" data-product-image loading="lazy" />
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
        <p><strong>Customer love:</strong> ⭐ ${product.rating} (${product.reviews} reviews)</p>
        <div class="flex flex--align-center flex--gap-md mt-md">
          <span class="card__price card__price--lg">${formatCurrency(product.price)}</span>
          <button type="button" data-action="add-to-cart">Add to cart</button>
        </div>
      </div>
    </div>
  `;
}

function setupAddToCart(product) {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='add-to-cart']");
    if (!button) return;
    addToCart(product, 1);
    showToast(`${product.name} added to cart`, "success");
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
