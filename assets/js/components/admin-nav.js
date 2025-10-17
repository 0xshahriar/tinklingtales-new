import { getIcon } from "../icons.js";

const LINKS = [
  { id: "dashboard", href: "index.html", label: "Overview", icon: "dashboard" },
  { id: "orders", href: "orders.html", label: "Orders", icon: "orders" },
  { id: "products", href: "products.html", label: "Products", icon: "products" },
  { id: "users", href: "users.html", label: "Users & Roles", icon: "users" },
  { id: "custom", href: "custom-requests.html", label: "Custom Requests", icon: "customRequests" }
];

export function renderAdminNav(activeId = "dashboard") {
  const items = LINKS.map(({ id, href, label, icon }) => {
    const isActive = id === activeId;
    const classes = ["admin-nav__link", isActive ? "is-active" : ""].filter(Boolean).join(" ");
    return `
      <a class="${classes}" href="${href}">
        <span class="icon" aria-hidden="true">${getIcon(icon)}</span>
        <span>${label}</span>
      </a>
    `;
  }).join("");

  return `
    <nav class="admin-nav" aria-label="Admin navigation">
      ${items}
    </nav>
  `;
}

export function mountAdminNav(activeId = "dashboard") {
  const container = document.querySelector("[data-admin-nav]");
  if (!container) return;
  container.innerHTML = renderAdminNav(activeId);
}
