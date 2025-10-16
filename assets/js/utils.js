export function formatCurrency(value) {
  try {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0
    }).format(value);
  } catch (error) {
    console.warn("Falling back to manual currency format", error);
    return `৳${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
}

export function createElementFromHTML(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild;
}

export function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("is-visible");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
