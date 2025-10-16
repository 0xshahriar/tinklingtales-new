const products = [
  {
    id: 'midnight-noor',
    name: 'Midnight Noor Bangles',
    price: 1899,
    category: 'Festive Collection',
    description:
      'Gunmetal bangles adorned with mirror work and pearl clusters for starlit celebrations.',
    image:
      'https://images.unsplash.com/photo-1587837073080-448bc6a2329b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'blush-bouquet',
    name: 'Blush Bouquet Stack',
    price: 1499,
    category: 'Everyday Chic',
    description:
      'Soft rose gold trio with textured details and dainty charms for effortless elegance.',
    image:
      'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'noor-dusk',
    name: 'Dusk Radiance Set',
    price: 2199,
    category: 'Limited Edition',
    description:
      'Matte black bangles with kundan studs and silver filigree for bold evenings.',
    image:
      'https://images.unsplash.com/photo-1518544801958-efcbf8a7ec10?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'moonlit-pearls',
    name: 'Moonlit Pearl Cuffs',
    price: 1299,
    category: 'Minimal Luxe',
    description:
      'Polished ivory cuffs with freshwater pearls to elevate monochrome ensembles.',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'heritage-glow',
    name: 'Heritage Glow Kada',
    price: 2499,
    category: 'Bridal Treasure',
    description:
      'Antique silver kada with temple motifs and adjustable clasp for heirloom vibes.',
    image:
      'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'noor-trio',
    name: 'Noor Trio',
    price: 999,
    category: 'Gifting Favourites',
    description:
      'Delicate trio with matte, gloss, and glitter finishes to mix and match with ease.',
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  },
];

const productList = document.getElementById('product-list');
const filterButtons = document.querySelectorAll('[data-filter]');
const cart = document.getElementById('cart');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartButton = document.querySelector('.cart-button');
const cartClose = document.querySelector('.cart-close');
const checkoutButton = document.querySelector('.checkout-button');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navBar = document.querySelector('.navbar');
const navBackdrop = document.getElementById('nav-backdrop');

if (navToggle && !navToggle.hasAttribute('aria-expanded')) {
  navToggle.setAttribute('aria-expanded', 'false');
}

const cartState = new Map();
let activeFilter = 'all';

const initialFilterButton = Array.from(filterButtons).find((button) =>
  button.classList.contains('is-active') && button.dataset.filter
);

if (initialFilterButton?.dataset.filter) {
  activeFilter = initialFilterButton.dataset.filter;
}

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function renderProducts() {
  if (!productList) return;

  const filteredProducts =
    activeFilter === 'all'
      ? products
      : products.filter((product) => product.category === activeFilter);

  productList.innerHTML = '';

  if (filteredProducts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent =
      productList.dataset.emptyMessage ||
      'We are carefully crafting new pieces. Check back soon!';
    productList.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredProducts.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <button type="button" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
    fragment.appendChild(card);
  });

  productList.appendChild(fragment);
}

function updateCartDisplay() {
  if (!cartItemsContainer || !cartTotal || !cartCount) return;

  cartItemsContainer.innerHTML = '';

  if (cartState.size === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'cart-empty';
    emptyState.textContent = 'Your cart is waiting for a shimmer!';
    cartItemsContainer.appendChild(emptyState);
    cartTotal.textContent = formatPrice(0);
    cartCount.textContent = '0';
    return;
  }

  let total = 0;
  const fragment = document.createDocumentFragment();

  cartState.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <span class="cart-item-title">${item.name}</span>
        <span>${item.quantity} × ${formatPrice(item.price)}</span>
      </div>
      <button class="cart-item-remove" data-product-id="${item.id}">Remove</button>
    `;
    total += item.price * item.quantity;
    fragment.appendChild(li);
  });

  cartItemsContainer.appendChild(fragment);
  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = `${Array.from(cartState.values()).reduce(
    (sum, item) => sum + item.quantity,
    0
  )}`;
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cartState.get(productId) || {
    ...product,
    quantity: 0,
  };

  existing.quantity += 1;
  cartState.set(productId, existing);
  updateCartDisplay();
  openCart();
}

function removeFromCart(productId) {
  if (!cartState.has(productId)) return;

  const current = cartState.get(productId);
  if (current.quantity <= 1) {
    cartState.delete(productId);
  } else {
    cartState.set(productId, { ...current, quantity: current.quantity - 1 });
  }

  updateCartDisplay();
}

function openCart() {
  if (!cart || !cartBackdrop) return;
  cart.classList.add('is-open');
  cartBackdrop.classList.add('is-active');
  cart.setAttribute('aria-hidden', 'false');
  cartBackdrop.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  if (!cart || !cartBackdrop) return;
  cart.classList.remove('is-open');
  cartBackdrop.classList.remove('is-active');
  cart.setAttribute('aria-hidden', 'true');
  cartBackdrop.setAttribute('aria-hidden', 'true');
}

function syncNavPosition() {
  if (!navLinks || !navBar) return;
  const { bottom } = navBar.getBoundingClientRect();
  const offset = bottom + 12;
  navLinks.style.setProperty('--nav-top', `${offset}px`);
}

function toggleNav() {
  if (!navLinks || !navToggle) return;
  syncNavPosition();
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navBackdrop?.classList.toggle('is-active', isOpen);
  navBackdrop?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  document.body.classList.toggle('nav-open', isOpen);
}

function closeNav() {
  if (!navLinks || !navToggle) return;
  navLinks.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navBackdrop?.classList.remove('is-active');
  navBackdrop?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('nav-open');
  navLinks.style.removeProperty('--nav-top');
}

function initEventListeners() {
  productList?.addEventListener('click', (event) => {
    const target = event.target;
    if (
      target instanceof HTMLButtonElement &&
      target.dataset.productId
    ) {
      addToCart(target.dataset.productId);
    }
  });

  cartItemsContainer?.addEventListener('click', (event) => {
    const target = event.target;
    if (
      target instanceof HTMLButtonElement &&
      target.dataset.productId
    ) {
      removeFromCart(target.dataset.productId);
    }
  });

  cartButton?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);

  navToggle?.addEventListener('click', toggleNav);
  navBackdrop?.addEventListener('click', closeNav);

  navLinks?.addEventListener('click', (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.closest('a') || target.closest('button'))
    ) {
      closeNav();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navLinks || !navToggle) return;
    if (!navLinks.classList.contains('is-open')) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!navLinks.contains(target) && !navToggle.contains(target)) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNav();
    } else if (navLinks?.classList.contains('is-open')) {
      syncNavPosition();
    }
  });

  filterButtons.forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.setAttribute(
        'aria-pressed',
        button.classList.contains('is-active') ? 'true' : 'false'
      );
    }

    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';

      filterButtons.forEach((other) => {
        if (other instanceof HTMLButtonElement) {
          const isActive = other === button;
          other.classList.toggle('is-active', isActive);
          other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        }
      });

      renderProducts();
    });
  });

  checkoutButton?.addEventListener('click', () => {
    window.open('https://www.facebook.com/TinklingTales', '_blank');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
      closeNav();
    }
  });

  const contactForm = document.querySelector('.contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    form.reset();
    alert('Thank you! We will reach out to you shortly.');
  });
}

function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
}

renderProducts();
updateCartDisplay();
initEventListeners();
initFooterYear();
