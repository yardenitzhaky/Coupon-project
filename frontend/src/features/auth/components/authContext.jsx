import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../../services/authService';

// Create the authentication context
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  // State variables for user and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
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

  // Function to handle user login
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

  // Function to handle user logout
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

  // Function to create a new user
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

  // Value object provided by the AuthContext
  const value = {
    user,
    loading,
    login,
    logout,
    createUser,
    isAuthenticated: Boolean(user),
  };

  // Render the AuthContext Provider with the value and child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};