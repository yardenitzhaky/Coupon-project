import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';
import { TabView, TabPanel } from 'primereact/tabview';

const CombinedLoginPage = () => {
  // Auth related states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authErrors, setAuthErrors] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  
  // Coupon related states
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  
  // Shared states and hooks
  const messages = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Constants
  const ORIGINAL_AMOUNT = 100; // ₪100 fixed amount as specified

  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Validate login form
  const validateAuth = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;

    setAuthLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (error) {
      messages.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message,
        sticky: true
      });
      setAuthErrors({ submit: error.message });
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
      setCouponLoading(false);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl p-0">
        <TabView>
          {/* Customer Coupon Tab */}
          <TabPanel header="Check Coupon" leftIcon="pi pi-tag mr-2">
            <div className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Order Total: {formatCurrency(ORIGINAL_AMOUNT)}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your coupon code to get a discount
                </p>
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
                    loading={couponLoading}
                    onClick={validateCoupon}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Admin Login Tab */}
          <TabPanel header="Admin Login" leftIcon="pi pi-user mr-2">
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
              <Messages ref={messages} />
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="username">Username</label>
                  <InputText
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={classNames({ 'p-invalid': authErrors.username })}
                    disabled={authLoading}
                  />
                  {authErrors.username && (
                    <small className="text-red-500">{authErrors.username}</small>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Password</label>
                  <Password
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    feedback={false}
                    toggleMask
                    className={classNames({ 'p-invalid': authErrors.password })}
                    disabled={authLoading}
                  />
                  {authErrors.password && (
                    <small className="text-red-500">{authErrors.password}</small>
                  )}
                </div>

                {authErrors.submit && (
                  <div className="text-red-500 text-center">{authErrors.submit}</div>
                )}

                <Button
                  type="submit"
                  label="Login"
                  className="w-full"
                  loading={authLoading}
                  disabled={authLoading}
                />
              </form>
            </div>
          </TabPanel>
        </TabView>

        {/* Coupon Validation Result Dialog */}
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
      </Card>
    </div>
  );
};

export default CombinedLoginPage;