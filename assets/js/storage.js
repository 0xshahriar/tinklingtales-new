import { STORAGE_KEYS } from "./constants.js";

const isBrowser = typeof window !== "undefined";

function read(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Storage read failed", error);
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage write failed", error);
  }
}

function remove(key) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Storage remove failed", error);
  }
}

export const storage = {
  read,
  write,
  remove,
  keys: STORAGE_KEYS
};
