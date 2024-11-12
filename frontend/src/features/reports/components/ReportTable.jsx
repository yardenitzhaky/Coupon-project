import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

const ReportTable = ({ data, loading }) => {
  // Debug log to check incoming data structure
  console.log('Report Table Data:', data);

  // Template for status column with enhanced status detection
  const statusTemplate = (rowData) => {
    // Handle null/undefined rowData
    if (!rowData) return null;

    const now = new Date();
    const expiry = rowData.expiryDate ? new Date(rowData.expiryDate) : null;
    const isExpired = expiry && expiry < now;
    const isMaxedOut = rowData.maxUsageCount && rowData.currentUsageCount >= rowData.maxUsageCount;

    // Check inactive status first
    if (!rowData.isActive) {
      return <Tag severity="danger" value="Inactive" />;
    }
    // Then check maxed out status
    if (isMaxedOut) {
      return <Tag severity="warning" value="Maxed Out" />;
    }
    // Then check expiry
    if (isExpired) {
      return <Tag severity="warning" value="Expired" />;
    }
    // If none of the above, coupon is active
    return <Tag severity="success" value="Active" />;
  };

  // Template for date columns with enhanced error handling
  const dateTemplate = (rowData, field) => {
    if (!rowData || !rowData[field]) return 'N/A';
    try {
      return new Date(rowData[field]).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error(`Error formatting date for field ${field}:`, error);
      return 'Invalid Date';
    }
  };

  // Template for discount value with type checking
  const discountTemplate = (rowData) => {
    if (!rowData) return null;
    return rowData.discountType === 'Percentage'
      ? `${rowData.discountValue}%`
      : `₪${rowData.discountValue.toFixed(2)}`;
  };

  // Template for usage count with enhanced formatting
  const usageTemplate = (rowData) => {
    if (!rowData) return null;
    const maxUsage = rowData.maxUsageCount || '∞';
    return `${rowData.currentUsageCount}/${maxUsage}`;
  };

  // Template for created by with fallback
  const createdByTemplate = (rowData) => {
    // Using createdByUsername instead of nested createdBy.username
    return rowData.createdByUsername || 'Unknown';
  };

  return (
    <Card>
      <DataTable
        value={data}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No coupons found"
        responsiveLayout="scroll"
        className="p-datatable-sm"
        sortMode="multiple"
        removableSort
        showGridlines
        stripedRows
      >
        <Column
          field="code"
          header="Code"
          sortable
          filter
          filterPlaceholder="Search by code"
        />
        <Column
          field="description"
          header="Description"
          filter
          filterPlaceholder="Search by description"
        />
        <Column
          field="discountValue"
          header="Discount"
          body={discountTemplate}
          sortable
        />
        <Column
          field="createdByUsername"
          header="Created By"
          body={createdByTemplate}
          sortable
          filter
          filterPlaceholder="Search by creator"
        />
        <Column
          field="createdAt"
          header="Created At"
          body={(row) => dateTemplate(row, 'createdAt')}
          sortable
        />
        <Column
          field="expiryDate"
          header="Expiry Date"
          body={(row) => dateTemplate(row, 'expiryDate')}
          sortable
        />
        <Column
          field="currentUsageCount"
          header="Usage"
          body={usageTemplate}
          sortable
        />
        <Column
          field="status"
          header="Status"
          body={statusTemplate}
          sortable
          filter
          filterField="isActive"
          showFilterMenu={false}
        />
      </DataTable>
    </Card>
  );
};

export default ReportTable;