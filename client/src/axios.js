// src/axios.js
import Axios from 'axios';

// Prefer an env var in prod; fallback to Vite proxy in dev
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = Axios.create({
  baseURL,
  withCredentials: true, // keep cookie flow for desktop
});

// Attach Bearer token (mobile/iOS Safari fallback)
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Only normalize 401 on auth-check endpoints, not on writes
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    // Keep your existing behavior for /auth/me (so callers can treat unauth as null)
    const isAuthMe = url.includes('/auth/me') || url.endsWith('/me');
    if (status === 401 && isAuthMe) {
      return Promise.resolve({ data: { user: null } });
    }

    // Otherwise, surface the real error (so POST /questions doesn't get silently "okayed")
    return Promise.reject(error);
  }
);

export default api;

// Optional helpers
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}
export function clearToken() {
  localStorage.removeItem('token');
}
