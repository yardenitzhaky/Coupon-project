import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from '../../features/auth/authContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <Button
                icon="pi pi-sign-out"
                label="Logout"
                severity="secondary"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow h-[calc(100vh-64px)] fixed">
          <nav className="mt-5 px-2">
            <Button
              icon="pi pi-home"
              label="Dashboard"
              className={`p-button-text w-full justify-start mb-2 ${
                isActiveRoute('/admin/dashboard') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/dashboard')}
            />
            <Button
              icon="pi pi-ticket"
              label="Coupons"
              className={`p-button-text w-full justify-start mb-2 ${
                isActiveRoute('/admin/coupons') ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => navigate('/admin/coupons')}
            />
            <Button
              icon="pi pi-chart-bar"
              label="Reports"
              className={`p-button-text w-full justify-start mb-2 ${
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
        <main className="ml-64 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;