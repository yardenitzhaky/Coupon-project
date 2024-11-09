import React, { createContext, useContext, useState, useEffect } from 'react';
import Session from 'supertokens-auth-react/recipe/session';
import { signOut } from 'supertokens-auth-react/recipe/emailpassword';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await Session.doesSessionExist();
      if (session) {
        const userData = await Session.getUserId();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // Implement login logic
    // For now, we'll simulate a successful login
    setUser({ username });
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const createUser = async (username, password) => {
    // Implement user creation logic with your mock API
    // This should only be accessible by admin users
    console.log('Creating user:', username);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    createUser,
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
