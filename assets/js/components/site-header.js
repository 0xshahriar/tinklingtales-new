import { APP_CONFIG } from "../../js/constants.js";
import { auth } from "../../js/auth.js";
import { getIcon } from "../../js/icons.js";

export function renderHeader(currentPath = "/") {
  const { isAuthenticated, isAdmin } = auth.getState();

  const links = [
    { href: "index.html", label: "Home" },
    { href: "shop.html", label: "Shop" },
    { href: "custom.html", label: "Custom Orders" },
    { href: "blog.html", label: "Blog" },
    { href: "about.html", label: "About" },
    { href: "cart.html", label: "Cart" }
  ];

  if (!isAuthenticated) {
    links.push(
      { href: "login.html", label: "Log in", extraClass: "navbar__link--auth" },
      { href: "signup.html", label: "Sign up", extraClass: "navbar__link--auth" }
    );
  }

  const navLinks = links
    .map(({ href, label, extraClass }) => {
      const isActive = currentPath.endsWith(href) || (href === "index.html" && currentPath.endsWith("/"));
      const classes = [isActive ? "is-active" : "", extraClass || ""].filter(Boolean).join(" ");
      return `<a href="${href}" class="${classes}">${label}</a>`;
    })
    .join("");

  const accountLink = isAuthenticated
    ? `<a href="account.html" class="button-link">My Account</a>`
    : `
        <div class="navbar__auth-actions">
          <a href="login.html" class="button-link button-link--ghost">Log in</a>
          <a href="signup.html" class="button-link">Sign up</a>
        </div>
      `;

  const adminLink = isAdmin ? `<a href="admin/index.html" class="button-link">Admin</a>` : "";

  return `
    <header class="header">
      <div class="container">
        <nav class="navbar" aria-label="Main navigation">
          <a class="navbar__brand" href="index.html" aria-label="${APP_CONFIG.siteName} home">
            <span class="icon icon--brand" aria-hidden="true">${getIcon("logo")}</span>
            <span>${APP_CONFIG.siteName}</span>
          </a>
          <button class="navbar__toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">
            <span class="icon" data-icon="menu" aria-hidden="true">${getIcon("menu")}</span>
            <span class="icon" data-icon="close" aria-hidden="true" hidden>${getIcon("close")}</span>
            <span class="sr-only">Toggle navigation</span>
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
