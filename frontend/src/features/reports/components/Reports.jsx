import React, { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/components/authContext';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportStats from './ReportStats';
import reportService from '../../../services/reportService';
import PageTransition from '../../design/PageTransition';

const Reports = () => {
  // Auth and navigation hooks
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);

  // Date range initialization for reports
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Component state
  const [reportLoading, setReportLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo,
    endDate: today,
    userId: null
  });

  // Debug auth state changes
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);

  // Authentication redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: '/admin/reports' }
      });
    }
  }, [isAuthenticated, loading, navigate]);

  // Initial data load
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadData(filters);
    }
  }, [isAuthenticated, loading]);

  // Data fetching function
  const loadData = async (currentFilters = filters) => {
    if (!isAuthenticated || !currentFilters.startDate || !currentFilters.endDate) return;
    try {
        setReportLoading(true);
        console.log('Current filters being used:', currentFilters); 
        let data;
        
        if (currentFilters.userId && currentFilters.userId.value) { // Check for userId.value
          console.log('Fetching by user ID:', currentFilters.userId.value);
          data = await reportService.getCouponsByUser(currentFilters.userId.value);
      } else {
          console.log('Fetching by date range');
          data = await reportService.getCouponsByDateRange(
              currentFilters.startDate,
              currentFilters.endDate
          );
      }
        
        console.log('Fetched report data:', data); 
        setCoupons(data || []);
    } catch (error) {
        console.error('Failed to load report data:', error);
        showError('Error', 'Failed to load report data');
    } finally {
        setReportLoading(false);
    }
};

  // Filter handler
  const handleFilter = async (newFilters) => {
    if (!newFilters.startDate || !newFilters.endDate) {
      showError('Error', 'Please select both start and end dates');
      return;
    }
    setFilters(newFilters);
    await loadData(newFilters);
  };

  // Export handler
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

  // Toast notification helpers
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


  return (
  <PageTransition>
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
  </PageTransition>
  );
};

export default Reports;