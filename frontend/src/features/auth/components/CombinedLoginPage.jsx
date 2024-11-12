import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';
import { TabView, TabPanel } from 'primereact/tabview';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { Ripple } from 'primereact/ripple';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';
import LoadingSpinner from '../../design/LoadingSpinner';

const ORIGINAL_AMOUNT = 100; // Fixed amount for demonstration


// Import Lucide icons
import { 
  ShieldCheck, 
  Tag, 
  Lock,
  User,
  Mail,
  DollarSign,
  Package,
  CreditCard
} from 'lucide-react';

const LoginPage = () => {
  
  // States for authentication
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authErrors, setAuthErrors] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  
  // States for coupon validation
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(ORIGINAL_AMOUNT);
  
  // Refs and hooks
  const messages = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };



  // Validation functions
  const validateAuth = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;

    setAuthLoading(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/admin/dashboard');
    } catch (error) {
      messages.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message,
        sticky: true
      });
    } finally {
      setAuthLoading(false);
    }
  };

// Handle coupon validation
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

  setCouponLoading(true);
  try {
    const response = await fetch('http://localhost:5190/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: couponCode,
        orderAmount: currentTotal,
        previouslyAppliedCoupons: appliedCoupons.map(c => c.code)
      })
    });

    const result = await response.json();
    console.log('Validation response:', result);

    if (response.ok && result.isValid) {
      // Add to applied coupons
      const newCoupon = {
        code: couponCode,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
        discountType: result.discountType,
        discountValue: result.discountValue
      };

      setAppliedCoupons(prev => [...prev, newCoupon]);
      setCurrentTotal(result.finalAmount);
      setValidationResult(result);
      setShowResult(true);
      setCouponCode('');

      messages.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Coupon applied! Saved ${formatCurrency(result.discountAmount)}`,
        life: 3000
      });
    } else {
      messages.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: result.message || 'Invalid coupon code',
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
    setCouponLoading(false);
  }
};

// Remove coupon function
const removeCoupon = async (couponToRemove) => {
  setCouponLoading(true);
  try {
    const remainingCoupons = appliedCoupons.filter(
      coupon => coupon.code !== couponToRemove.code
    );

    if (remainingCoupons.length === 0) {
      setAppliedCoupons([]);
      setCurrentTotal(ORIGINAL_AMOUNT);
    } else {
      const response = await fetch('http://localhost:5190/api/coupons/validate-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCodes: remainingCoupons.map(coupon => coupon.code),
          orderAmount: ORIGINAL_AMOUNT
        })
      });

      const result = await response.json();

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

    messages.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Coupon removed successfully',
      life: 3000
    });
  } catch (error) {
    console.error('Error removing coupon:', error);
    messages.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to remove coupon',
      life: 3000
    });
  } finally {
    setCouponLoading(false);
  }
};

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {couponLoading && <LoadingSpinner />}  
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
          <TabView className="border-none">
                  {/* Coupon Validation Tab */}
      <TabPanel 
        header={
            <div className="flex items-center gap-2 transition-colors duration-200 hover:text-blue-600">
            <Tag size={18} />
            <span>Check Coupon</span>
          </div>
        }
      >
        <motion.div
          variants={itemVariants}
          className="p-6 space-y-6"
        >
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-blue-500" />
            <h2 className="text-2xl font-bold mt-4">
              Original Amount: {formatCurrency(ORIGINAL_AMOUNT)}
            </h2>
            <p className="text-gray-600 mt-2">
              Enter coupon codes to get discounts
            </p>
          </div>

          <Messages ref={messages} />

          <div className="space-y-4 max-w-md mx-auto">
          <div className="p-inputgroup transition-all duration-200 hover:shadow-md">
              <span className="p-inputgroup-addon">
                <Tag className="w-4 h-4 text-gray-500" />
              </span>
              <InputText
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="w-full"
                onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
              />
              <Button
                label=""
                icon="pi pi-check"
                loading={couponLoading}
                onClick={validateCoupon}
                className="transition-all duration-200 hover:scale-105"
              />
            </div>

           {/* Applied Coupons List */}
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
                        className="flex justify-between items-center p-3 bg-blue-50 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <Tag value={coupon.code} severity="info" />
                          <span className="text-green-600 font-medium">
                            -{formatCurrency(coupon.discountAmount)}
                          </span>
                        </div>
                        
                        <Button
                          icon="pi pi-times"
                          rounded
                          text
                          severity="danger"
                          onClick={() => removeCoupon(coupon)}
                          disabled={couponLoading}
                          className="transition-all duration-200 hover:scale-110"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Current Total Display */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Current Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currentTotal)}
                </span>
              </div>
              {appliedCoupons.length > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Total Savings:</span>
                  <span className="text-green-600">
                    -{formatCurrency(ORIGINAL_AMOUNT - currentTotal)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </TabPanel>
  {/* Admin Login Tab */}
<TabPanel
  header={
    <div className="flex items-center gap-2 transition-colors duration-200 hover:text-blue-600">
    <Lock size={18} />
      <span>Admin Login</span>
    </div>
  }
>
  <motion.div
    variants={itemVariants}
    className="p-6"
  >
    <div className="text-center mb-6">
      <ShieldCheck className="w-16 h-16 mx-auto text-blue-500" />
      <h2 className="text-2xl font-bold mt-4">Welcome Back</h2>
      <p className="text-gray-600">Sign in to access your dashboard</p>
    </div>

    <Messages ref={messages} />

    <form onSubmit={handleLogin} className="space-y-4">
    <div className="space-y-2 transition-all duration-200 hover:shadow-sm">
        <label className="text-gray-700">Username</label>
        <InputText
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={classNames(
            "w-full",
            { "p-invalid": authErrors.username }
          )}
        />
        {authErrors.username && (
          <small className="text-red-500">
            {authErrors.username}
          </small>
        )}
      </div>

      <div className="space-y-2 transition-all duration-200 hover:shadow-sm">
        <label className="text-gray-700">Password</label>
        <Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          feedback={false}
          className="w-full"
          pt={{
            input: { className: 'w-full' }
          }}
        />
        {authErrors.password && (
          <small className="text-red-500">
            {authErrors.password}
          </small>
        )}
      </div>

      <Button
        type="submit"
        label="Login"
        loading={authLoading}
        className="w-full p-button-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
        />
    </form>
  </motion.div>
</TabPanel>
</TabView>
</Card>
</main>

{/* Validation Result Dialog */}
<Dialog
  visible={showResult}
  onHide={() => setShowResult(false)}
  header="Coupon Validation Result"
  className="w-full max-w-lg transition-transform duration-200 hover:scale-[1.01]"
>
  {validationResult && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
<div className="flex justify-between items-center p-3 bg-gray-50 rounded transition-all duration-200 hover:bg-gray-100">
        <div className="flex items-center gap-2">
          <CreditCard className="text-gray-500" />
          <span>Original Amount</span>
        </div>
        <span className="text-lg font-semibold">
          {formatCurrency(ORIGINAL_AMOUNT)}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-gray-50 rounded transition-all duration-200 hover:bg-gray-100">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded transition-all duration-200 hover:bg-green-100">
          <Tag className="text-green-500" />
          <span>Discount</span>
        </div>
        <span className="text-lg font-semibold text-green-600">
          -{formatCurrency(validationResult.discountAmount)}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-gray-50 rounded transition-all duration-200 hover:bg-gray-100">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded transition-all duration-200 hover:bg-blue-100">
          <DollarSign className="text-blue-500" />
          <span>Final Amount</span>
        </div>
        <span className="text-xl font-bold text-blue-600">
          {formatCurrency(validationResult.finalAmount)}
        </span>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          label="Close"
          icon="pi pi-times"
          className="p-button-outlined transition-all duration-200 hover:scale-105"
          onClick={() => setShowResult(false)}
        />
      </div>
    </motion.div>
  )}
</Dialog>
</div>
);
};

export default LoginPage;