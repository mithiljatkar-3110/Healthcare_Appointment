import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
