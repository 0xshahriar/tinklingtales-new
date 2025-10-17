import { renderHeader } from "./components/site-header.js";
import { renderFooter } from "./components/site-footer.js";
import { auth } from "./auth.js";
import { showToast } from "./utils.js";
import { ERROR_MESSAGES, FALLBACK_IMAGE } from "./constants.js";
import { applySeoMetadata } from "./seo.js";

const pageInitializers = new Map();

export function registerPage(pageId, initializer) {
  pageInitializers.set(pageId, initializer);
}

function mountLayout() {
  const headerContainer = document.querySelector("[data-component='header']");
  const footerContainer = document.querySelector("[data-component='footer']");

  if (headerContainer) {
    headerContainer.innerHTML = renderHeader(window.location.pathname);
  }

  if (footerContainer) {
    footerContainer.innerHTML = renderFooter();
  }

  const toggle = document.querySelector(".navbar__toggle");
  const links = document.querySelector("[data-nav-links]");
  if (toggle && links) {
    const menuIcon = toggle.querySelector('[data-icon="menu"]');
    const closeIcon = toggle.querySelector('[data-icon="close"]');

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.classList.toggle("is-active", isOpen);
      if (menuIcon && closeIcon) {
        menuIcon.hidden = isOpen;
        closeIcon.hidden = !isOpen;
      }
    });

    links.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("is-active");
        if (menuIcon && closeIcon) {
          menuIcon.hidden = false;
          closeIcon.hidden = true;
        }
      })
    );
  }
}

function enableImageFallbacks() {
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.hasAttribute("data-fallback")) return;
      if (target.dataset.fallbackApplied === "true") return;

      target.dataset.fallbackApplied = "true";
      const fallbackSrc = target.dataset.fallbackSrc || FALLBACK_IMAGE;
      target.src = fallbackSrc;
    },
    true
  );
}

function enforceProtection() {
  const protectedPage = document.body.dataset.protectedPage || document.body.dataset.protected;
  if (!protectedPage) return true;

  const requireAdmin = protectedPage === "admin";
  const result = auth.requireAuth({ admin: requireAdmin });

  if (!result.allowed) {
    const redirectTo = requireAdmin ? "login.html?admin=true" : "login.html";
    const message =
      result.reason === "forbidden" ? ERROR_MESSAGES.forbidden : ERROR_MESSAGES.unauthorized;
    showToast(message, "warning");
    window.location.replace(redirectTo);
    return false;
  }

  return true;
}

function setupLogout() {
  const logoutBtn = document.querySelector("[data-action='logout']");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (event) => {
      event.preventDefault();
      auth.logout();
      showToast("Signed out successfully", "success");
      window.location.replace("index.html");
    });
  }
}

function initializePage() {
  const pageId = document.body.dataset.page;
  if (!pageId) return;

  const initializer = pageInitializers.get(pageId);
  if (typeof initializer === "function") {
    initializer().catch((error) => {
      console.error(`Error while initializing page: ${pageId}`, error);
      showToast(ERROR_MESSAGES.unknown, "error");
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  applySeoMetadata();
  enableImageFallbacks();
  mountLayout();
  if (!enforceProtection()) return;
  setupLogout();
  initializePage();
});
