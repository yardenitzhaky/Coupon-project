import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

const ReportTable = ({ data, loading }) => {
  // Template for status column
  const statusTemplate = (rowData) => {
    const isExpired = rowData.expiryDate && new Date(rowData.expiryDate) < new Date();
    const isMaxedOut = rowData.maxUsageCount && rowData.currentUsageCount >= rowData.maxUsageCount;
    
    if (!rowData.isActive) {
      return <Tag severity="danger" value="Inactive" />;
    }
    if (isExpired) {
      return <Tag severity="warning" value="Expired" />;
    }
    if (isMaxedOut) {
      return <Tag severity="warning" value="Maxed Out" />;
    }
    return <Tag severity="success" value="Active" />;
  };

  // Template for date columns
  const dateTemplate = (rowData, field) => {
    if (!rowData[field]) return 'N/A';
    return new Date(rowData[field]).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Template for discount value
  const discountTemplate = (rowData) => {
    return rowData.discountType === 'PERCENTAGE' 
      ? `${rowData.discountValue}%`
      : `₪${rowData.discountValue.toFixed(2)}`;
  };

  // Template for usage count
  const usageTemplate = (rowData) => {
    return `${rowData.currentUsageCount}/${rowData.maxUsageCount || '∞'}`;
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
          field="createdBy.username" 
          header="Created By" 
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
        />
      </DataTable>
    </Card>
  );
};

export default ReportTable;