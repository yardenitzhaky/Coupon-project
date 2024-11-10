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
  
  // Refs and hooks
  const messages = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const ORIGINAL_AMOUNT = 100; // Fixed amount for demonstration

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

  // Header Component
  const Header = () => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <ShieldCheck className="w-8 h-8" />
          <span className="text-2xl font-bold">CouponGuard</span>
        </motion.div>
      </div>
    </div>
  );

  // Footer Component
  const Footer = () => (
    <div className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">© 2024 CouponGuard. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <motion.a 
            whileHover={{ scale: 1.1 }}
            className="text-gray-400 hover:text-blue-400 cursor-pointer"
          >
            Privacy Policy
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1 }}
            className="text-gray-400 hover:text-blue-400 cursor-pointer"
          >
            Terms of Service
          </motion.a>
        </div>
      </div>
    </div>
  );

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

    setCouponLoading(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(result.message);
      }
    } catch (error) {
      messages.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to validate coupon',
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
      <Header />
  
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl shadow-2xl">
          <TabView className="border-none">
            {/* Coupon Validation Tab */}
            <TabPanel 
              header={
                <div className="flex items-center gap-2">
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
                    Order Total: {formatCurrency(ORIGINAL_AMOUNT)}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Enter your coupon code to get a discount
                  </p>
                </div>
  
                <Messages ref={messages} />

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                      <Tag className="w-4 h-4 text-gray-500" />
                    </span>
                    <InputText
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="w-full"
                  />
                </div>

                  <Button
                    label="Apply"
                    icon="pi pi-check"
                    loading={couponLoading}
                    onClick={validateCoupon}
                  />
                </div>
              </motion.div>
            </TabPanel>
  {/* Admin Login Tab */}
<TabPanel
  header={
    <div className="flex items-center gap-2">
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
      <div className="space-y-2">
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

      <div className="space-y-2">
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
        className="w-full p-button-lg"
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
  className="w-full max-w-lg"
>
  {validationResult && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <CreditCard className="text-gray-500" />
          <span>Original Amount</span>
        </div>
        <span className="text-lg font-semibold">
          {formatCurrency(ORIGINAL_AMOUNT)}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
        <div className="flex items-center gap-2">
          <Tag className="text-green-500" />
          <span>Discount</span>
        </div>
        <span className="text-lg font-semibold text-green-600">
          -{formatCurrency(validationResult.discountAmount)}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
        <div className="flex items-center gap-2">
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
          className="p-button-outlined"
          onClick={() => setShowResult(false)}
        />
      </div>
    </motion.div>
  )}
</Dialog>

<Footer />
</div>
);
};

export default LoginPage;