// src/services/couponService.js
import { couponsApi } from './api';

class CouponService {
  async getAllCoupons() {
    try {
      const coupons = await couponsApi.getAll();
      return coupons;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }

  async getCouponById(id) {
    try {
      const coupon = await couponsApi.getById(id);
      return coupon;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupon');
    }
  }

  async createCoupon(couponData) {
    try {
      const createdCoupon = await couponsApi.create(couponData);
      return createdCoupon;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
  }

  async updateCoupon(id, couponData) {
    try {
      const updatedCoupon = await couponsApi.update(id, couponData);
      return updatedCoupon;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update coupon');
    }
  }

  async deleteCoupon(id) {
    try {
      await couponsApi.delete(id);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
  }

  async validateCoupon(code, orderAmount) {
    try {
      const validationResult = await couponsApi.validate(code, orderAmount);
      return validationResult;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate coupon');
    }
  }

  async validateMultipleCoupons(coupons, orderAmount) {
    try {
      const validationResult = await customerApi.validateCoupons(coupons, orderAmount);
      return validationResult;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate coupons');
    }
  }
}

export default new CouponService();