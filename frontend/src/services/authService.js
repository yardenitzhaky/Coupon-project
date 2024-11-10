// src/services/authService.js
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5190/api';

class AuthService {
  async login(username, password) {
    try {
        console.log('Attempting login with:', { username, password });
        
        const response = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message;
            } catch {
                errorMessage = 'Authentication failed';
            }
            throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);

        if (data.token) {
            localStorage.setItem('token', data.token);
            const user = {
                username: data.username,
            };
            localStorage.setItem('user', JSON.stringify(user));
            return { user, token: data.token };
        } else {
            throw new Error('No token received from server');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          const user = JSON.parse(localStorage.getItem('user'));
          return { ...user, token };
        } else {
          this.logout();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  }

  async createUser(userData) {
    try {
      console.log('Attempting to create user with data:', userData);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        })
      });

      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      const isJson = contentType && contentType.includes("application/json");
      const responseData = isJson ? JSON.parse(responseText) : responseText;

      console.log('Server response:', {
        status: response.status,
        isJson,
        data: responseData
      });

      if (!response.ok) {
        // Log the error response for debugging
        console.error('Server error response:', responseData);

        // Throw error with details
        throw {
          message: responseData.message || 'Failed to create user',
          response: {
            data: responseData
          }
        };
      }

      return responseData;
    } catch (error) {
      console.error('Create user error details:', error);
      throw error;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();