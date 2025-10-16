import { APP_CONFIG } from "./constants.js";

async function request(endpoint, { method = "GET", body, token } = {}) {
  const url = new URL(endpoint, APP_CONFIG.apiBaseUrl);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "omit"
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(payload?.message || "Request failed");
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    console.error("API request failed", error);
    throw error;
  }
}

export const api = {
  getProducts() {
    return request("/products");
  },
  getProductById(id) {
    return request(`/products/${encodeURIComponent(id)}`);
  },
  createOrder(data, token) {
    return request("/orders", { method: "POST", body: data, token });
  },
  authenticate(credentials) {
    return request("/auth/login", { method: "POST", body: credentials });
  },
  getOrders(token) {
    return request("/orders", { token });
  },
  getDashboard(token) {
    return request("/admin/dashboard", { token });
  }
};
