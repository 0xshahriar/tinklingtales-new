import { storage } from "./storage.js";

function getCart() {
  return storage.read(storage.keys.cart, []);
}

function saveCart(cart) {
  storage.write(storage.keys.cart, cart);
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart();
  const updated = cart.map((item) =>
    item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );

  saveCart(updated);
  return updated;
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 120 : 0;
  const total = subtotal + shipping;

  return { cart, subtotal, shipping, total };
}
