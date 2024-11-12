// src/services/reportService.js
import { reportsApi } from './api';
import authService from './authService';

class ReportService {
  constructor() {
    this.checkAuth = () => {
      if (!authService.isAuthenticated()) {
        throw new Error('User is not authenticated');
      }
    };
  }

  async getCouponsByUser(userId) {
    try {
        const response = await api.get(`/reports/coupons/by-user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching coupons by user:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch coupons by user');
    }
}

  async getCouponsByDateRange(startDate, endDate) {
    this.checkAuth();
    try {
      return await reportsApi.getCouponsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('ReportService - getCouponsByDateRange error:', error);
      throw error;
    }
  }

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