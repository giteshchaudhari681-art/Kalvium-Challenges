import axios from 'axios';
import { clearAuthStorage, dispatchAuthLogout } from '../auth/session';

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
});

let isHandlingUnauthorized = false;

// Request interceptor to add Authorization header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest =
      requestUrl.endsWith('/login') || requestUrl.endsWith('/signup');

    if (status === 401 && !isAuthRequest) {
      clearAuthStorage();

      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        dispatchAuthLogout('expired');
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 0);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
