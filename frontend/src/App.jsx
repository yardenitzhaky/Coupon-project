import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './features/auth/authContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import EnhancedLoginPage from './features/auth/components/CombinedLoginPage';
import CreateUserForm from './features/auth/components/CreateUserForm';
import CouponList from './features/coupons/components/CouponList';
import Reports from './features/reports/components/Reports';
import { PrimeReactProvider } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import PageTransition from './features/design/PageTransition';

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PageTransition>
              <EnhancedLoginPage />
            </PageTransition>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <PageTransition>
                <AdminLayout />
              </PageTransition>
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
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <Router>
          <ConfirmDialog />
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
};

export default App;