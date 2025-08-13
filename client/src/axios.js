// src/axios.js
import Axios from 'axios';

const isProd = import.meta.env.MODE === 'production';
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = Axios.create({
  baseURL,
  withCredentials: true,
});

const USE_BEARER = import.meta.env.VITE_USE_BEARER === 'true'

api.interceptors.request.use((config) => {
  if(USE_BEARER) {
    const t = localStorage.getItem('token');
    if(t) config.headers.Authorization = `Bearer ${t}`
  } else {
    if(config.headers?.Authorization) delete config.headers.Authorization
  }
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
