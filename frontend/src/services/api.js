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

// Export the configured axios instance
export default api;

// Export type definitions for endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register'
  },
  coupons: {
    base: '/coupons',
    validate: '/coupons/validate',
    validateMultiple: '/coupons/validate-multiple',
    canCombine: '/coupons/can-combine'
  },
  reports: {
    couponsByUser: (userId) => `/reports/coupons/by-user/${userId}`,
    couponsByDate: '/reports/coupons/by-date',
    export: '/reports/coupons/export',
    users: '/reports/users'
  },
  customer: {
    validateCoupons: '/customer/validate-coupons'
  }
};