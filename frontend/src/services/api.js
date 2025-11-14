import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (params) => api.get('/products/search', { params }),
  scanBarcode: (barcode) => api.post('/products/scan', { barcode })
};

// Basket API
export const basketAPI = {
  get: (basketId) => api.get('/basket', { params: { basketId } }),
  getAll: (userId) => api.get('/basket/all', { params: { userId } }),
  create: (data) => api.post('/basket/create', data),
  delete: (basketId) => api.delete(`/basket/delete/${basketId}`),
  addItem: (data) => api.post('/basket', data),
  removeItem: (itemId) => api.delete(`/basket/${itemId}`),
  optimize: (data) => api.post('/basket/optimize', data),
  compare: (data) => api.post('/basket/compare', data)
};

export default api;
