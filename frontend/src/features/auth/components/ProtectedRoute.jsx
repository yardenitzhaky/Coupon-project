import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import LoadingSpinner from '../../design/LoadingSpinner';

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If there's no authenticated user, redirect to the login page and preserve the intended location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the child components (protected content)
  return children;
};

export default ProtectedRoute;
