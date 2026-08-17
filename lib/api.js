import axios from "axios";

// Axios instance using relative API url mapped by Next.js rewrites in dev
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/admin/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to headers dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("artistic_carpets_admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired, clear it and redirect to login
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
        localStorage.removeItem("artistic_carpets_admin_token");
        localStorage.removeItem("artistic_carpets_admin_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
// Helper methods to standardize responses
export const apiRequest = {
  get: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
  },
  post: async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
  },
  put: async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
  },
  patch: async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
  },
  delete: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },
};

export default api;
