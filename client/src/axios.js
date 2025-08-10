// src/axios.js
import Axios from 'axios';

const isProd = import.meta.env.MODE === 'production';
// In prod (same origin), use relative paths; in dev, use Vite proxy at /api
const baseURL = isProd ? '/api' : (import.meta.env.VITE_API_URL ?? '/api');

const api = Axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isAuthMe = url.includes('/auth/me') || url.endsWith('/me');
    if (status === 401 && isAuthMe) return Promise.resolve({ data: { user: null } });
    return Promise.reject(error);
  }
);

export default api;
export function setToken(token){ if (token) localStorage.setItem('token', token); }
export function clearToken(){ localStorage.removeItem('token'); }
