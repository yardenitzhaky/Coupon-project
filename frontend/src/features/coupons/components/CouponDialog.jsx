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
  { label: 'Percentage', value: DISCOUNT_TYPE.PERCENTAGE },
  { label: 'Fixed Amount', value: DISCOUNT_TYPE.FIXED_AMOUNT }
];

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
    setErrors({});
  }, [coupon]);

  const validate = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.discountValue <= 0) newErrors.discountValue = 'Discount value must be greater than 0';
    if (formData.discountType === DISCOUNT_TYPE.PERCENTAGE && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot be greater than 100';
    }
    if (formData.maxUsageCount !== null && formData.maxUsageCount <= 0) {
      newErrors.maxUsageCount = 'Usage count must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...formData,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.hasOwnProperty('checked') ? checked : value
    }));
  };

  const dialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" severity="secondary" onClick={onHide} />
      <Button label="Save" icon="pi pi-check" onClick={handleSubmit} autoFocus />
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