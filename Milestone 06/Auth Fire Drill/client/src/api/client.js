
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '/api',
});

const getCsrfToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token).csrfToken || null;
  } catch (error) {
    return null;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    const method = config.method?.toLowerCase();
    const isStateChangingRequest = method && !['get', 'head', 'options'].includes(method);
    const csrfToken = getCsrfToken(token);

    if (isStateChangingRequest && csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

export default api;
