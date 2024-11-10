import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/authContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import LoginForm from './features/auth/components/LoginForm';
import CreateUserForm from './features/auth/components/CreateUserForm';
import CouponList from './features/coupons/components/CouponList';
import Reports from './features/reports/components/Reports'; 
import { PrimeReactProvider } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';

const App = () => {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <Router>
          <ConfirmDialog />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<div>Dashboard Content</div>} />
              <Route path="create-user" element={<CreateUserForm />} />
              <Route path="coupons" element={<CouponList />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
};

export default App;