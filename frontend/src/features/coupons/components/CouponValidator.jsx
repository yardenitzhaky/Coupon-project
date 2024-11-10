import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';
import { useRef } from 'react';
import { Divider } from 'primereact/divider';

const CouponValidator = () => {
  // State for coupon code input
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const messages = useRef(null);

  // Constants
  const ORIGINAL_AMOUNT = 100; // ₪100 fixed amount as specified

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      messages.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a coupon code',
        life: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5190/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: ORIGINAL_AMOUNT
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setValidationResult(result);
        setShowResult(true);
      } else {
        messages.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.message || 'Failed to validate coupon',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      messages.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to validate coupon',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Total: {formatCurrency(ORIGINAL_AMOUNT)}</h2>
          <p className="text-sm text-gray-600 mt-2">Enter your coupon code to get a discount</p>
        </div>

        <Messages ref={messages} />

        <div className="flex flex-col gap-4">
          <div className="p-inputgroup">
            <InputText
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="p-inputtext-lg"
            />
            <Button
              label="Apply"
              loading={loading}
              onClick={validateCoupon}
              className="w-32"
            />
          </div>

          <Divider align="center">
            <span className="text-gray-500">or</span>
          </Divider>

          <Button
            label="Continue to Login"
            severity="secondary"
            outlined
            className="w-full"
            onClick={() => window.location.href = '/login'}
          />
        </div>
      </Card>

      <Dialog
        visible={showResult}
        onHide={() => setShowResult(false)}
        header="Coupon Validation Result"
        style={{ width: '90%', maxWidth: '500px' }}
      >
        {validationResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-semibold">Original Amount:</span>
              <span>{formatCurrency(ORIGINAL_AMOUNT)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-semibold">Discount Amount:</span>
              <span className="text-green-600">
                -{formatCurrency(validationResult.discountAmount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-semibold">Final Amount:</span>
              <span className="text-blue-600 text-xl">
                {formatCurrency(validationResult.finalAmount)}
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                label="Close"
                icon="pi pi-times"
                onClick={() => setShowResult(false)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default CouponValidator;