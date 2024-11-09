import axios from 'axios';

const API_URL = '/api/coupons';

const couponService = {
  getAllCoupons: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getCoupon: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await axios.post(API_URL, couponData);
    return response.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await axios.put(`${API_URL}/${id}`, couponData);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default couponService;