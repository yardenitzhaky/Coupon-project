import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { DISCOUNT_TYPE } from '../types';

const discountTypes = [
  { label: 'Percentage', value: 'Percentage' },
  { label: 'Fixed Amount', value: 'FixedAmount' }
];

// CouponDialog component for creating/editing coupons
const CouponDialog = ({ visible, onHide, onSave, coupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: DISCOUNT_TYPE.PERCENTAGE,
    discountValue: 0,
    expiryDate: null,
    maxUsageCount: null,
    allowMultipleDiscounts: false,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Effect to handle initialization and reset of form data
  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 0,
        expiryDate: null,
        maxUsageCount: null,
        allowMultipleDiscounts: false,
        isActive: true
      });
    }
    // Clear any existing errors
    setErrors({});
  }, [coupon]);

  // Validate form data before submission
  const validate = () => {
    const newErrors = {};
    // Check required fields
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.discountValue <= 0) newErrors.discountValue = 'Discount value must be greater than 0';
    // Ensure percentage discount is not over 100%
    if (formData.discountType === DISCOUNT_TYPE.PERCENTAGE && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot be greater than 100';
    }
    // Validate usage count if specified
    if (formData.maxUsageCount !== null && formData.maxUsageCount <= 0) {
      newErrors.maxUsageCount = 'Usage count must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        // Convert Date object to ISO string for API
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null
      };

      if (coupon) {
        // If editing, only send updatable fields
        const updateData = {
          description: submitData.description,
          discountType: submitData.discountType,
          discountValue: submitData.discountValue,
          expiryDate: submitData.expiryDate,
          allowMultipleDiscounts: submitData.allowMultipleDiscounts,
          maxUsageCount: submitData.maxUsageCount,
          isActive: submitData.isActive
        };
        //ADD SUCCESS FOR UPDATE/ADD MESSAGE
        onSave(updateData);
      } else {
        // If creating new coupon, send all data
        onSave(submitData);
      }
    }
  };

  // Handle input change events
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      // Handle checkbox inputs differently than regular inputs
      [name]: e.target.hasOwnProperty('checked') ? checked : value
    }));
  };

  // Dialog footer with action buttons
  const dialogFooter = (
    <div className="flex justify-end gap-3">
      <Button
        label="Cancel"
        icon="pi pi-times"
        severity="secondary"
        onClick={onHide}
        className="p-button-outlined transition-all duration-200 hover:scale-105 hover:shadow-md"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSubmit}
        className="p-button-primary transition-all duration-200 hover:scale-105 hover:shadow-md hover:brightness-110"
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={coupon ? 'Edit Coupon' : 'Create Coupon'}
      footer={dialogFooter}
      modal
      className="p-fluid"
      style={{ width: '450px' }}
    >
      <div className="grid p-fluid">
        <div className="col-12 mb-2">
          <label htmlFor="code">Code*</label>
          <InputText
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={errors.code ? 'p-invalid' : ''}
          />
          {errors.code && <small className="p-error">{errors.code}</small>}
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="description">Description*</label>
          <InputTextarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={errors.description ? 'p-invalid' : ''}
          />
          {errors.description && <small className="p-error">{errors.description}</small>}
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="discountType">Discount Type*</label>
          <Dropdown
            id="discountType"
            name="discountType"
            value={formData.discountType}
            options={discountTypes}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="discountValue">Discount Value*</label>
          <InputNumber
            id="discountValue"
            name="discountValue"
            value={formData.discountValue}
            onValueChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.value }))}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            min={0}
            max={formData.discountType === DISCOUNT_TYPE.PERCENTAGE ? 100 : 999999}
            className={errors.discountValue ? 'p-invalid' : ''}
          />
          {errors.discountValue && <small className="p-error">{errors.discountValue}</small>}
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="expiryDate">Expiry Date</label>
          <Calendar
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            showTime
            showIcon
          />
        </div>

        <div className="col-12 mb-2">
          <label htmlFor="maxUsageCount">Maximum Usage Count</label>
          <InputNumber
            id="maxUsageCount"
            name="maxUsageCount"
            value={formData.maxUsageCount}
            onValueChange={(e) => setFormData(prev => ({ ...prev, maxUsageCount: e.value }))}
            min={0}
            className={errors.maxUsageCount ? 'p-invalid' : ''}
          />
          {errors.maxUsageCount && <small className="p-error">{errors.maxUsageCount}</small>}
        </div>

        <div className="col-12 mb-2 flex align-items-center">
          <Checkbox
            id="allowMultipleDiscounts"
            name="allowMultipleDiscounts"
            checked={formData.allowMultipleDiscounts}
            onChange={handleChange}
            className="custom-checkbox"
          />
          <label htmlFor="allowMultipleDiscounts" className="ml-2">Allow Multiple Discounts</label>
        </div>

        <div className="col-12 mb-2 flex align-items-center">
          <Checkbox
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="custom-checkbox"

          />
          <label htmlFor="isActive" className="ml-2">Active</label>
        </div>
      </div>
    </Dialog>
  );
};

export default CouponDialog;