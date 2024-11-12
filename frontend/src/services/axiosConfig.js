// src/services/api.js
import axios from 'axios';

// API Configuration Constants
const BASE_URL = 'http://localhost:5190/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Coupons API endpoints
export const couponsApi = {
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  create: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },

  update: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validate: async (code, orderAmount) => {
    const response = await api.post('/coupons/validate', { code, orderAmount });
    return response.data;
  },
};

// Reports API endpoints with error handling
export const reportsApi = {
  getCouponsByUser: async (userId) => {
    try {
      const response = await api.get(`/reports/coupons/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons by user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons by user');
    }
  },

  getCouponsByDateRange: async (startDate, endDate) => {
    try {
      // Format dates for API
      const formattedStartDate = startDate instanceof Date ? startDate.toISOString() : startDate;
      const formattedEndDate = endDate instanceof Date ? endDate.toISOString() : endDate;
      
      const response = await api.get('/reports/coupons/by-date', {
        params: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons by date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons by date range');
    }
  },

  exportCoupons: async (filters) => {
    try {
      // Format dates in filters if they exist
      const formattedFilters = {
        ...filters,
        startDate: filters.startDate instanceof Date ? filters.startDate.toISOString() : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate,
      };

      const response = await api.get('/reports/coupons/export', {
        params: formattedFilters,
        responseType: 'blob', // Required for file downloads
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting coupons:', error);
      throw new Error(error.response?.data?.message || 'Failed to export coupons');
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/reports/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }
};

// Customer API endpoints
export const customerApi = {
  validateCoupons: async (coupons, orderAmount) => {
    const response = await api.post('/customer/validate-coupons', {
      coupons,
      orderAmount,
    });
    return response.data;
  },
};

export default api;