import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error.response?.data?.message || fallback;

export const SOCKET_URL = API_URL.replace('/api', '');

export const setupApiInterceptors = (store) => {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch({ type: 'auth/logout' });
      }
      return Promise.reject(error);
    }
  );
};

export default api;
