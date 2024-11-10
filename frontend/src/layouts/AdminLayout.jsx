// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from 'primereact/button';
import { useAuth } from '../features/auth/authContext';
import { Footer } from './MainLayout';

const AdminHeader = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Admin Panel</span>
          </div>
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

export const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow h-full fixed">
          <nav className="mt-5 px-2 space-y-2">
            <Button
              icon="pi pi-home"
              label="Dashboard"
              className={`p-button-text w-full justify-start ${
                isActiveRoute('/admin/dashboard') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/dashboard')}
            />
            <Button
              icon="pi pi-ticket"
              label="Coupons"
              className={`p-button-text w-full justify-start ${
                isActiveRoute('/admin/coupons') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/coupons')}
            />
            <Button
              icon="pi pi-chart-bar"
              label="Reports"
              className={`p-button-text w-full justify-start ${
                isActiveRoute('/admin/reports') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/reports')}
            />
            <Button
              icon="pi pi-users"
              label="Create User"
              className={`p-button-text w-full justify-start ${
                isActiveRoute('/admin/create-user') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/create-user')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
