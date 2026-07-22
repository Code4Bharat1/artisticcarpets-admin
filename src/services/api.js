import axios from "axios";

// Axios instance using relative API url mapped by Vite proxy in dev
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to headers dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("artistic_carpets_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
