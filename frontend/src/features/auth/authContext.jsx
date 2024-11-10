// src/features/auth/authContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear the user state even if the API call fails
      setUser(null);
    }
  };

  const createUser = async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await authService.createUser({
        username: userData.username,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });
      return response;
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    createUser,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};