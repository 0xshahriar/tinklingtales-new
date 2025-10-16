import { registerPage } from "../app.js";
import { products, testimonials } from "../../data/products.js";
import { formatCurrency } from "../utils.js";
import { FALLBACK_IMAGE } from "../constants.js";

function renderHeroProducts() {
  const container = document.querySelector("[data-hero-products]");
  if (!container) return;

  const featured = products.filter((product) => product.bestseller).slice(0, 3);
  const cards = featured
    .map(
      (product) => `
      <article class="card product-card">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-card__image"
          loading="lazy"
          onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
        />
        <div class="product-card__content">
          <span class="tag">Bestseller</span>
          <h3 class="card__title">${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-card__actions">
            <span class="card__price">${formatCurrency(product.price)}</span>
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="button-link">View</a>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  container.innerHTML = cards;
}

function renderTestimonials() {
  const container = document.querySelector("[data-testimonials]");
  if (!container) return;

  container.innerHTML = testimonials
    .map(
      (item) => `
      <article class="card testimonial">
        <p>“${item.quote}”</p>
        <div class="testimonial__author">${item.author}</div>
        <span class="testimonial__location">${item.location}</span>
      </article>
    `
    )
    .join("");
}

function renderTimeline() {
  const steps = [
    {
      title: "Share your story",
      description: "Tell us about your outfit, occasion and colors."
    },
    {
      title: "Collaborate with our designers",
      description: "We sketch and source charms, beads and fabrics inspired by you."
    },
    {
      title: "Crafted & delivered",
      description: "Each piece is handcrafted, inspected and beautifully packaged."
    }
  ];

  const container = document.querySelector("[data-timeline]");
  if (!container) return;

  const markup = steps
    .map(
      (step, index) => `
      <div class="card">
        <span class="badge">Step ${index + 1}</span>
        <h3>${step.title}</h3>
        <p>${step.description}</p>
      </div>
    `
    )
    .join("");

  container.innerHTML = markup;
}

function renderInstagramFeed() {
  const feed = document.querySelector("[data-instagram]");
  if (!feed) return;

  const images = [
    "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1550246140-29f40b909e5b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
  ];

  feed.innerHTML = images
    .map(
      (src, index) => `
      <a href="https://www.instagram.com/tinklingtales" target="_blank" rel="noopener" aria-label="Follow us on Instagram">
        <img src="${src}" alt="Instagram preview ${index + 1}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
      </a>
    `
    )
    .join("");
}

function setupHeroCta() {
  const shopButton = document.querySelector("[data-action='shop-now']");
  if (shopButton) {
    shopButton.addEventListener("click", () => {
      window.location.href = "shop.html";
    });
  }
}

registerPage("landing", async () => {
  renderHeroProducts();
  renderTestimonials();
  renderTimeline();
  renderInstagramFeed();
  setupHeroCta();
});
