import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import reportService from '../../../services/reportService';

const ReportFilters = ({ onFilter, onExport, loading }) => {
  // Initialize with default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [dateRange, setDateRange] = useState([thirtyDaysAgo, today]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for the dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const userData = await reportService.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const [startDate, endDate] = e.value || [null, null];
    setDateRange([startDate, endDate]);

    if (startDate && endDate) {
      onFilter({
        startDate,
        endDate,
        userId: selectedUser?.value
      });
    }
  };

  // Handle user selection
const handleUserChange = (e) => {
  console.log('Selected user value:', e.value); 
  setSelectedUser(e.value);
  if (dateRange[0] && dateRange[1]) {
      onFilter({
          startDate: dateRange[0],
          endDate: dateRange[1],
          userId: e
      });
  }
};

  // Handle export button click
  const handleExport = () => {
    onExport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userId: selectedUser?.value
    });
  };

  return (
    <Card className="mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-auto">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Select Date Range
          </label>
          <Calendar
            id="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
            selectionMode="range"
            readOnlyInput
            placeholder="Select Date Range"
            showIcon
            className="w-full"
            maxDate={today}
            showTime={false}
          />
        </div>

        {/* <div className="w-full md:w-auto">
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
            Select Admin
          </label>
          <Dropdown
            id="user"
            value={selectedUser}
            onChange={handleUserChange}
            options={users}
            optionLabel="label"
            placeholder="Select User"
            className="w-full"
            loading={loadingUsers}
          />
        </div> */}

        <div className="flex items-end">
          <Button
            label="Export to Excel"
            icon="pi pi-file-excel"
            onClick={handleExport}
            loading={loading}
            disabled={(!dateRange[0] || !dateRange[1])}
            className="w-full md:w-auto p-button-success p-button-rounded p-button-outlined"
            />
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;