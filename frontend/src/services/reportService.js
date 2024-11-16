// src/services/reportService.js
import { reportsApi } from './api';
import authService from './authService';

class ReportService {
  constructor() {
    // Method to check if the user is authenticated
    this.checkAuth = () => {
      if (!authService.isAuthenticated()) {
        throw new Error('User is not authenticated');
      }
    };
  }

  // Fetch coupons by user ID
  async getCouponsByUser(userId) {
    try {
      const response = await api.get(`/reports/coupons/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons by user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons by user');
    }
  }

  // Fetch coupons within a specific date range
  async getCouponsByDateRange(startDate, endDate) {
    this.checkAuth();
    try {
      return await reportsApi.getCouponsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('ReportService - getCouponsByDateRange error:', error);
      throw error;
    }
  }

  // Export coupons based on filters
  async exportCoupons(filters) {
    this.checkAuth();
    try {
      const blob = await reportsApi.exportCoupons(filters);
      this.downloadExcelFile(blob);
    } catch (error) {
      console.error('ReportService - exportCoupons error:', error);
      throw error;
    }
  }

  // Fetch all users
  async getUsers() {
    this.checkAuth();
    try {
      const users = await reportsApi.getUsers();
      return users.map(user => ({
        label: user.username,
        value: user.id
      }));
    } catch (error) {
      console.error('ReportService - getUsers error:', error);
      throw error;
    }
  }

  // Helper method to download an Excel file
  downloadExcelFile(blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `coupons-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new ReportService();