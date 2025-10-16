import { storage } from "./storage.js";

function getWishlist() {
  return storage.read(storage.keys.wishlist, []);
}

function saveWishlist(list) {
  storage.write(storage.keys.wishlist, list);
}

export function listWishlist() {
  return getWishlist();
}

export function isFavourite(productId) {
  return getWishlist().some((item) => item.id === productId);
}

export function toggleFavourite(product) {
  const wishlist = getWishlist();
  const exists = wishlist.find((item) => item.id === product.id);

  if (exists) {
    const updated = wishlist.filter((item) => item.id !== product.id);
    saveWishlist(updated);
    return { favourite: false, items: updated };
  }

  const entry = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category
  };
  const updated = [...wishlist, entry];
  saveWishlist(updated);
  return { favourite: true, items: updated };
}
