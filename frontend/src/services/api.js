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

export const couponsApi = {
  getAll: () => api.get('/coupons'),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const reportsApi = {
  getCouponsByUser: (userId) => api.get(API_ENDPOINTS.reports.couponsByUser(userId)),
  getCouponsByDateRange: (startDate, endDate) => api.get(API_ENDPOINTS.reports.couponsByDate, { params: { startDate, endDate } }),
  exportCoupons: (filters) => api.post(API_ENDPOINTS.reports.export, filters, { responseType: 'blob' }),
  getUsers: () => api.get(API_ENDPOINTS.reports.users),
};