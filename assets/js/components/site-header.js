import { APP_CONFIG } from "../../js/constants.js";
import { auth } from "../../js/auth.js";

export function renderHeader(currentPath = "/") {
  const { isAuthenticated, isAdmin } = auth.getState();

  const links = [
    { href: "index.html", label: "Home" },
    { href: "shop.html", label: "Shop" },
    { href: "custom.html", label: "Custom Orders" },
    { href: "cart.html", label: "Cart" },
    { href: "about.html", label: "About" }
  ];

  const navLinks = links
    .map(({ href, label }) => {
      const isActive = currentPath.endsWith(href) || (href === "index.html" && currentPath.endsWith("/"));
      return `<a href="${href}" class="${isActive ? "is-active" : ""}">${label}</a>`;
    })
    .join("");

  const accountLink = isAuthenticated
    ? `<a href="account.html" class="button-link">My Account</a>`
    : `<a href="login.html" class="button-link">Sign In</a>`;

  const adminLink = isAdmin ? `<a href="admin.html" class="button-link">Admin</a>` : "";

  return `
    <header class="header">
      <div class="container">
        <nav class="navbar" aria-label="Main navigation">
          <a class="navbar__brand" href="index.html" aria-label="${APP_CONFIG.siteName} home">
            <span>✨</span>
            <span>${APP_CONFIG.siteName}</span>
          </a>
          <button class="navbar__toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">
            ☰
          </button>
          <div class="navbar__links" data-nav-links>
            ${navLinks}
          </div>
          <div class="navbar__actions">
            ${adminLink}
            <a href="cart.html" class="button-link">Cart</a>
            ${accountLink}
          </div>
        </nav>
      </div>
    </header>
  `;
}
