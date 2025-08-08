import axios from 'axios';

// Local dev uses Vite proxy at /api. We'll keep prod handling for later.
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // NOTE: this was logging `err` (undefined) and crashing the interceptor
    console.warn('[axios error]', error?.response?.status, error?.response?.data);
    if (error?.response?.status === 401) {
      // normalize 401 for callers that expect a null user
      return Promise.resolve({ data: { user: null } });
    }
    return Promise.reject(error);
  }
);

export default axios;