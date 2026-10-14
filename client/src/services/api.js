import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smarthr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle session expiration / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('smarthr_token');
        localStorage.removeItem('smarthr_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
