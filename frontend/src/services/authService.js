import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } finally {
      localStorage.removeItem('user');
    }
  },

  createUser: async (username, password) => {
    const response = await axios.post(`${API_URL}/users`, {
      username,
      password,
    });
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
