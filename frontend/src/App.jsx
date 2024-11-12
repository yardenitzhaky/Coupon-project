import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './features/auth/components/authContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { MainLayout } from './layouts/MainLayout';
import CreateUserForm from './features/auth/components/CreateUserForm';
import CouponList from './features/coupons/components/CouponList';
import Reports from './features/reports/components/Reports';
import { PrimeReactProvider } from 'primereact/api';
import { ConfirmDialog } from 'primereact/confirmdialog';
import PageTransition from './features/design/PageTransition';
import { Outlet } from 'react-router-dom';
import CombinedLoginPage from './features/auth/components/CombinedLoginPage';

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation(); 

  return (
    <AnimatePresence mode="wait"> {/* AnimatePresence for route transitions */}
      <Routes location={location} key={location.pathname}>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route
            path="/login"
            element={
              <PageTransition> {/* Page transition animation */}
                <CombinedLoginPage /> {/* Login page component */}
              </PageTransition>
            }
          />
        </Route>

        {/* Protected Admin Routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute> {/* Protect these routes */}
              <AdminLayout>
                  <Outlet /> {/* Nested routes will be rendered here */}
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route path="create-user" element={<CreateUserForm />} /> {/* Create user form */}
          <Route path="coupons" element={<CouponList />} /> {/* List of coupons */}
          <Route path="reports" element={<Reports />} /> {/* Reports page */}
          {/* Redirect to coupons by default because deleted the dashboard route */}
          <Route index element={<Navigate to="/admin/coupons" replace />} />
          <Route path="dashboard" element={<Navigate to="/admin/coupons" replace />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <PrimeReactProvider> {/* PrimeReact context provider */}
      <AuthProvider> {/* Authentication context provider */}
        <Router> {/* Router for handling routes */}
          <ConfirmDialog /> {/* Global confirm dialog */}
          <AnimatedRoutes /> {/* Routes with animations */}
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
};

export default App;
