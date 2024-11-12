import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import couponService from '../../../services/couponService';
import CouponDialog from './CouponDialog';
import PageTransition from '../../design/PageTransition';

// CouponList component handles the display and management of coupons
const CouponList = () => {
  const [coupons, setCoupons] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [dialogVisible, setDialogVisible] = useState(false); 
  const [selectedCoupon, setSelectedCoupon] = useState(null); 

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString();
  };

  // Format discount value based on discount type (percentage or fixed amount)
  const formatDiscountValue = (coupon) => {
    return coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}%` 
      : `₪${coupon.discountValue}`; 
  };

  // Template for rendering coupon status with appropriate tags
  const statusTemplate = (rowData) => {
    const isExpired = rowData.expiryDate && new Date(rowData.expiryDate) < new Date();
    const isMaxedOut = rowData.maxUsageCount && rowData.currentUsageCount >= rowData.maxUsageCount;
    
    // Return appropriate status tag based on conditions
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

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          onClick={() => openEditDialog(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    );
  };

  const openEditDialog = (coupon) => {
    setSelectedCoupon(coupon);
    setDialogVisible(true);
  };

  // Show confirmation dialog before deleting a coupon
  const confirmDelete = (coupon) => {
    confirmDialog({
      message: 'Are you sure you want to delete this coupon?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(coupon.id),
    });
  };

  // Handle the actual deletion of a coupon
  const handleDelete = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      // Update local state by filtering out the deleted coupon
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const hideCouponDialog = () => {
    setDialogVisible(false);
    setSelectedCoupon(null);
  };

  // Handle saving of coupon data (both create and update)
  const onSave = async (couponData) => {
    try {
      if (selectedCoupon) {
        // Update existing coupon
        const updated = await couponService.updateCoupon(selectedCoupon.id, couponData);
        setCoupons(coupons.map(c => c.id === updated.id ? updated : c));
      } else {
        // Create new coupon
        const created = await couponService.createCoupon(couponData);
        setCoupons([...coupons, created]);
      }
      hideCouponDialog();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    }
  };

  return (
    <PageTransition>
    <div className="card p-4 mb-16">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Button 
          label="Create Coupon" 
          icon="pi pi-plus" 
          onClick={() => setDialogVisible(true)}
        />
      </div>

      <DataTable 
        value={coupons} 
        loading={loading}
        paginator 
        rows={10} 
        stripedRows
      >
        <Column field="code" header="Code" sortable />
        <Column field="description" header="Description" />
        <Column 
          header="Discount" 
          body={formatDiscountValue} 
          sortable 
          sortField="discountValue"
        />
        <Column 
          field="expiryDate" 
          header="Expiry Date" 
          body={(rowData) => rowData.expiryDate ? formatDate(rowData.expiryDate) : 'No expiry'} 
          sortable
        />
        <Column 
          field="maxUsageCount" 
          header="Usage" 
          body={(rowData) => `${rowData.currentUsageCount}/${rowData.maxUsageCount || '∞'}`}
        />
        <Column 
          field="allowMultipleDiscounts" 
          header="Multiple Discounts" 
          body={(rowData) => rowData.allowMultipleDiscounts ? 'Yes' : 'No'}
        />
        <Column header="Status" body={statusTemplate} />
        <Column header="Actions" body={actionTemplate} />
      </DataTable>

      <CouponDialog 
        visible={dialogVisible}
        onHide={hideCouponDialog}
        onSave={onSave}
        coupon={selectedCoupon}
      />
    </div>
    </PageTransition>
  );
};

export default CouponList;