// src/axios.js
import Axios from 'axios';

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
  console.log("AXIOS: sending ", config.method, config.url, config.headers)
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

const uploadBaseURL = import.meta.env.VITE_UPLOAD_URL || baseURL;

export const uploadAxios = Axios.create({
  baseURL: uploadBaseURL,
  withCredentials: true,
});

uploadAxios.interceptors.request.use((config) => {
  if(USE_BEARER) {
    const t = localStorage.getItem('token');
    if(t) config.headers.Authorization = `Bearer ${t}`
  }
  return config;
})

export default api;
export function setToken(token){ if (token) localStorage.setItem('token', token); }
export function clearToken(){ localStorage.removeItem('token'); }
