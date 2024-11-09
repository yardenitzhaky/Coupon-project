export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user';

export const ROUTES = {
  LOGIN: '/login',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    COUPONS: '/admin/coupons',
    REPORTS: '/admin/reports',
    CREATE_USER: '/admin/create-user',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CREATE_USER: '/api/auth/users',
    ME: '/api/auth/me',
  },
};