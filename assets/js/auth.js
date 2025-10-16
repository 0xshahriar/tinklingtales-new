import { storage } from "./storage.js";

const defaultAuthState = {
  isAuthenticated: false,
  isAdmin: false,
  profile: null,
  token: null
};

function getAuthState() {
  return storage.read(storage.keys.auth, defaultAuthState);
}

function saveAuthState(state) {
  storage.write(storage.keys.auth, state);
}

export function login({ token, profile, isAdmin = false }) {
  const state = {
    isAuthenticated: true,
    isAdmin,
    profile,
    token
  };
  saveAuthState(state);
  return state;
}

export function logout() {
  saveAuthState(defaultAuthState);
  return defaultAuthState;
}

export function requireAuth({ admin = false } = {}) {
  const state = getAuthState();
  if (!state.isAuthenticated) {
    return { allowed: false, reason: "unauthenticated" };
  }
  if (admin && !state.isAdmin) {
    return { allowed: false, reason: "forbidden" };
  }
  return { allowed: true, state };
}

export const auth = {
  getState: getAuthState,
  login,
  logout,
  requireAuth
};
