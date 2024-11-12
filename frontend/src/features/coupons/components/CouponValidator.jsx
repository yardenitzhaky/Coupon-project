import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { motion, AnimatePresence } from 'framer-motion';
import couponService from '../../../services/couponService'; 

// CouponValidator component handles coupon application and validation logic
const CouponValidator = () => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(100);
  const messages = useRef(null);

  const INITIAL_AMOUNT = 100;
  const API_URL = 'http://localhost:5190/api';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateSavingsPercentage = () => {
    return ((INITIAL_AMOUNT - currentTotal) / INITIAL_AMOUNT) * 100;
  };

    // Function to validate a single coupon
    const validateCoupon = async () => {
      // Input validation
      if (!couponCode.trim()) {
        messages.current?.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please enter a coupon code',
          life: 3000
        });
        return;
      }
  
      // Check for duplicate coupons
      if (appliedCoupons.some(coupon => coupon.code === couponCode)) {
        messages.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'This coupon has already been applied',
          life: 3000
        });
        return;
      }
  
      setLoading(true);
      try {
        // Use couponService instead of direct fetch
        const result = await couponService.validateCoupon(
          couponCode,
          currentTotal,
          appliedCoupons.map(c => c.code)
        );
  
        // Handle successful validation
        if (result.isValid) {
          // Create new coupon object with validation results
          const newCoupon = {
            code: couponCode,
            discountAmount: result.discountAmount,
            discountType: result.discountType,
            discountValue: result.discountValue,
            finalAmount: result.finalAmount
          };
  
          // Update state with new coupon and total
          setAppliedCoupons(prev => [...prev, newCoupon]);
          setCurrentTotal(result.finalAmount);
          setCouponCode('');
  
          // Show success message
          messages.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Coupon applied! Saved ${formatCurrency(result.discountAmount)}`,
            life: 3000
          });
        }
      } catch (error) {
        // Error handling
        console.error('Coupon validation error:', error);
        messages.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to validate coupon',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };
  
    // Function to remove a coupon
    const removeCoupon = async (couponToRemove) => {
      setLoading(true);
      try {
        // Get remaining coupons after removal
        const remainingCoupons = appliedCoupons.filter(
          coupon => coupon.code !== couponToRemove.code
        );
  
        // If no coupons left, reset to initial state
        if (remainingCoupons.length === 0) {
          setAppliedCoupons([]);
          setCurrentTotal(INITIAL_AMOUNT);
        } else {
          // Revalidate remaining coupons using service
          const result = await couponService.validateMultipleCoupons(
            remainingCoupons.map(coupon => coupon.code),
            INITIAL_AMOUNT
          );
  
          // Update state with recalculated values
          if (result.isValid) {
            setAppliedCoupons(
              result.appliedCoupons.map(coupon => ({
                code: coupon.code,
                discountAmount: coupon.discountAmount,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                finalAmount: coupon.finalAmount
              }))
            );
            setCurrentTotal(result.finalAmount);
          }
        }
  
        // Show success message
        messages.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Coupon removed successfully',
          life: 3000
        });
      } catch (error) {
        // Error handling
        console.error('Error removing coupon:', error);
        messages.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to remove coupon',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-xl relative">
        {/* {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <ProgressBar mode="indeterminate" style={{ height: '6px', width: '200px' }} />
          </div>
        )} */}

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Original Amount: {formatCurrency(INITIAL_AMOUNT)}
            </h2>
            <p className="text-gray-600 mt-2">
              Enter coupon codes to get discounts
            </p>
          </div>

          <Messages ref={messages} />

          <div className="p-inputgroup">
            <InputText
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              disabled={loading}
            />
            <Button
              label="Apply"
              icon="pi pi-plus"
              loading={loading}
              onClick={validateCoupon}
            />
          </div>

          <AnimatePresence>
            {appliedCoupons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <h3 className="font-semibold">Applied Coupons:</h3>
                {appliedCoupons.map((coupon) => (
                  <motion.div
                    key={coupon.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Tag value={coupon.code} severity="info" />
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(coupon.discountAmount)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({coupon.discountType === 'Percentage' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)})
                      </span>
                    </div>
                    <Button
                      icon="pi pi-times"
                      rounded
                      text
                      severity="danger"
                      onClick={() => removeCoupon(coupon)}
                      disabled={loading}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Amount:</span>
                <span className="font-semibold">{formatCurrency(INITIAL_AMOUNT)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Savings:</span>
                <span className="text-green-600 font-semibold">
                  -{formatCurrency(INITIAL_AMOUNT - currentTotal)}
                  <span className="text-sm ml-1">
                    ({calculateSavingsPercentage().toFixed(1)}%)
                  </span>
                </span>
              </div>

              <ProgressBar
                value={calculateSavingsPercentage()}
                showValue={false}
                style={{ height: '8px' }}
                className="my-2"
              />

              <Divider className="my-2" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Current Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currentTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CouponValidator;