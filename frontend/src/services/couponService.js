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

   // Validate a single coupon
   async validateCoupon(code, orderAmount, previouslyAppliedCoupons = []) {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderAmount,
        previouslyAppliedCoupons
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate coupon');
    }
  }


   // Validate multiple coupons at once
   async validateMultipleCoupons(couponCodes, orderAmount) {
    try {
      const response = await api.post('/coupons/validate-multiple', {
        couponCodes,
        orderAmount
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate coupons');
    }
  } 
    // Check if coupons can be combined
    async canCombineCoupons(couponCodes) {
      try {
        const response = await api.post('/coupons/can-combine', couponCodes);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to check coupon compatibility');
      }
    }
}

export default new CouponService();