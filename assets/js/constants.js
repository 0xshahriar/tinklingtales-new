export const APP_CONFIG = {
  siteName: "Tinkling Tales",
  siteUrl: "https://tinklingtales.netlify.app",
  contactEmail: "hello@tinklingtales.com",
  apiBaseUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  social: {
    facebook: "https://www.facebook.com/tinklingtales",
    instagram: "https://www.instagram.com/tinklingtales",
    messenger: "https://m.me/tinklingtales"
  }
};

export const STORAGE_KEYS = {
  cart: "tinklingtales_cart",
  auth: "tinklingtales_auth",
  wishlist: "tinklingtales_wishlist"
};

export const ERROR_MESSAGES = {
  network: "We couldn't reach the server. Please check your connection and try again.",
  unauthorized: "You need to sign in to access this page.",
  forbidden: "You don't have permission to view this page.",
  unknown: "Something went wrong. Please try again later."
};

export const ORDER_STATUS = {
  processing: { label: "Processing", className: "status-pill status-pill--pending" },
  completed: { label: "Completed", className: "status-pill status-pill--success" },
  cancelled: { label: "Cancelled", className: "status-pill status-pill--danger" }
};

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80";
