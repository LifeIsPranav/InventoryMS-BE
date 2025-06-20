import axios from "axios";

const API_BASE_URL = 'http://localhost:4444/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/', data),
  updatePassword: (data) => api.put('/users/update_password', data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users/'),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getBySupplier: (supplierId) => api.get(`/products/supplier/${supplierId}`),
  getNeedsRestock: () => api.get('/products/needsRestock'),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory/'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory/create', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getProducts: (id) => api.get(`/inventory/${id}/products`),
  addProduct: (id, data) => api.post(`/inventory/${id}/products`, data),
  removeProduct: (id, data) => api.delete(`/inventory/${id}/products`, { data }),
  addStorage: (id, data) => api.post(`/inventory/${id}/storage`, data),
  removeStorage: (id, data) => api.delete(`/inventory/${id}/storage`, { data }),
  getUtilization: (id) => api.get(`/inventory/${id}/utilization`),
  getCostSummary: (id) => api.get(`/inventory/${id}/cost-summary`),
};

// Transportation API
export const transportationAPI = {
  getAll: () => api.get('/transports/'),
  getById: (id) => api.get(`/transports/${id}`),
  getByStatus: (status) => api.get(`/transports/status/${status}`),
  getOverdue: () => api.get('/transports/overdue'),
  cancel: (id) => api.delete(`/transports/${id}`),
};

// Storage API
export const storageAPI = {
  getAll: () => api.get('/storages/'),
  getById: (id) => api.get(`/storages/${id}`),
  create: (data) => api.post('/storages/', data),
  update: (id, data) => api.put(`/storages/${id}`, data),
  delete: (id) => api.delete(`/storages/${id}`),
};

// Wages API
export const wagesAPI = {
  getAll: () => api.get('/wages/'),
  calculate: () => api.post('/wages/calculate'),
  getOverworked: () => api.get('/wages/overworked'),
  update: (userId, data) => api.put(`/wages/${userId}`, data),
};

// Alerts API
export const alertsAPI = {
  getAll: () => api.get('/alerts/'),
  trigger: (data) => api.post('/alerts/trigger', data),
  send: (data) => api.post('/alerts/send', data),
};

export default api;
