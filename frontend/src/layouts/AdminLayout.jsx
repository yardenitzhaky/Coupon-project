// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from 'primereact/button';
import { useAuth } from '../features/auth/components/authContext';
import { Footer } from './MainLayout';
import PageTransition from '../features/design/PageTransition';

// Header component for admin panel
const AdminHeader = () => {
  // Get auth context and navigation
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Handle logout action
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and title */}
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Admin Panel</span>
          </div>
          
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <Button
              icon="pi pi-sign-out"
              onClick={handleLogout}
              className="p-button-text"
              tooltip="Logout"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main admin layout component
export const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is active
  const isActiveRoute = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow h-full fixed">
          <nav className="mt-2 px-10 space-y-15">
            {/* Navigation buttons */}
            <Button
              icon="pi pi-ticket"
              label="Coupons"
              className={`p-button-text w-full justify-start py-4 px-6 text-lg ${
                isActiveRoute('/admin/coupons') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/admin/coupons')}
            />
            <Button
              icon="pi pi-chart-bar"
              label="Reports"
              className={`p-button-text w-full justify-start py-4 px-6 text-lg ${
                isActiveRoute('/admin/reports') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/admin/reports')}
            />
            <Button
              icon="pi pi-users"
              label="Create User"
              className={`p-button-text w-full justify-start py-4 px-6 text-lg ${
                isActiveRoute('/admin/create-user') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => navigate('/admin/create-user')}
            />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="ml-64 flex-1 p-8 bg-gray-50">
        <PageTransition>
          <Outlet />
        </PageTransition>  
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;