import axios from "axios";

// Automatically use local proxy in development, and absolute Railway URL in production
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "/api/v1"
    : "https://ticketsbackend-production-ca61.up.railway.app/api/v1");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ticket_app_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token if 401 unauthenticated
      localStorage.removeItem("ticket_app_token");
      localStorage.removeItem("ticket_app_user");
    }
    return Promise.reject(error);
  }
);

export default api;