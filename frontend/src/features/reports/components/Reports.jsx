// src/features/reports/components/Reports.jsx
import React, { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/authContext';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportStats from './ReportStats';
import reportService from '../../../services/reportService';

const Reports = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [reportLoading, setReportLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo,
    endDate: today,
    userId: null
  });

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { 
        replace: true,
        state: { from: '/admin/reports' }
      });
    }
  }, [isAuthenticated, loading, navigate]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadData(filters);
    }
  }, [isAuthenticated, loading]);

  const loadData = async (currentFilters = filters) => {
    if (!isAuthenticated || !currentFilters.startDate || !currentFilters.endDate) return;

    try {
      setReportLoading(true);
    

      const data = currentFilters.userId
        ? await reportService.getCouponsByUser(currentFilters.userId)
        : await reportService.getCouponsByDateRange(
            currentFilters.startDate,
            currentFilters.endDate
          );

      setCoupons(data || []);
    } catch (error) {
      console.error('Failed to load report data:', error);
      showError('Error', 'Failed to load report data');
      if (error.response?.status === 401) {
        navigate('/login', { 
          replace: true,
          state: { from: '/admin/reports' }
        });
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleFilter = async (newFilters) => {
    if (!newFilters.startDate || !newFilters.endDate) {
      showError('Error', 'Please select both start and end dates');
      return;
    }
    setFilters(newFilters);
    await loadData(newFilters);
  };

  const handleExport = async (exportFilters) => {
    if (!exportFilters.startDate || !exportFilters.endDate) {
      showError('Error', 'Please select both start and end dates');
      return;
    }
    
    try {
      setReportLoading(true);
      await reportService.exportCoupons(exportFilters);
      showSuccess('Success', 'Report has been exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Error', 'Failed to export report');
    } finally {
      setReportLoading(false);
    }
  };

  const showSuccess = (summary, detail) => {
    toast.current?.show({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000
    });
  };

  const showError = (summary, detail) => {
    toast.current?.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 5000
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Reports</h1>
        <p className="text-gray-600">
          View and analyze coupon usage statistics and trends
        </p>
      </div>

      <ReportFilters
        onFilter={handleFilter}
        onExport={handleExport}
        loading={reportLoading}
      />

      <ReportStats data={coupons} />

      <ReportTable
        data={coupons}
        loading={reportLoading}
      />
    </div>
  );
};

export default Reports;