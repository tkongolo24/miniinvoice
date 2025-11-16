import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth
export const register = (userData) => api.post('/api/auth/register', userData);
export const login = (credentials) => api.post('/api/auth/login', credentials);

// Profile
export const getProfile = () => api.get('/api/auth/profile');
export const updateProfile = (profileData) => api.put('/api/auth/profile', profileData);

// Invoices
export const getInvoices = () => api.get('/api/invoices');
export const getInvoice = (id) => api.get(`/api/invoices/${id}`);
export const createInvoice = (invoiceData) => api.post('/api/invoices', invoiceData);
export const updateInvoice = (id, invoiceData) => api.put(`/api/invoices/${id}`, invoiceData);
export const updateInvoiceStatus = (id, status) => api.put(`/api/invoices/${id}`, { status });
export const deleteInvoice = (id) => api.delete(`/api/invoices/${id}`);

export default api;