import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { Messages } from 'primereact/messages';
import { useRef } from 'react';
import { useAuth } from '../authContext';
import { classNames } from 'primereact/utils';

const AdminUserForm = () => {
  const navigate = useNavigate();
  const { createUser } = useAuth();
  const messages = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password requirements message
  const passwordHeader = <div className="font-bold">Pick a password</div>;
  const passwordFooter = (
    <div className="p-2">
      <h6>Requirements:</h6>
      <ul className="pl-4">
        <li>At least 8 characters</li>
        <li>At least one lowercase letter</li>
        <li>At least one uppercase letter</li>
        <li>At least one number</li>
      </ul>
    </div>
  );

  // Validate form data
  const validate = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // Password strength requirements
      const hasNumber = /\d/.test(formData.password);
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!hasNumber || !hasUpper || !hasLower) {
        newErrors.password = 'Password must meet all requirements';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      
      // Create the request payload
      const userData = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // Log the request payload
      console.log('Submitting user data:', userData);
      
      const result = await createUser(userData);
      console.log('Registration success:', result);

      messages.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'User created successfully!',
        life: 3000
      });

      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
      });

      // setTimeout(() => {
      //   navigate('/admin/users');
      // }, 2000);

    } catch (error) {
      console.error('Create user error:', error);
      
      // Handle validation errors from the backend
      if (error.response?.data?.errors) {
        const serverErrors = error.response?.data?.errors;
        const newErrors = {};
        
        Object.keys(serverErrors).forEach(key => {
          newErrors[key.charAt(0).toLowerCase() + key.slice(1)] = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
        });
        
        setErrors(newErrors);
      }
      
      messages.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || error.message || 'Failed to create user',
        sticky: true
      });
    } finally {
      setLoading(false);
    }
  };




  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the changed field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Create New User</h2>
        
        <Messages ref={messages} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="font-medium">
              Username
            </label>
            <InputText
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={classNames({ 'p-invalid': errors.username })}
            />
            {errors.username && (
              <small className="text-red-500">{errors.username}</small>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              toggleMask
              disabled={loading}
              className={classNames({ 'p-invalid': errors.password })}
              header={passwordHeader}
              footer={passwordFooter}
              promptLabel="Enter password"
              weakLabel="Too simple"
              mediumLabel="Average complexity"
              strongLabel="Complex password"
            />
            {errors.password && (
              <small className="text-red-500">{errors.password}</small>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              toggleMask
              disabled={loading}
              className={classNames({ 'p-invalid': errors.confirmPassword })}
              feedback={false}
            />
            {errors.confirmPassword && (
              <small className="text-red-500">{errors.confirmPassword}</small>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              label="Create User"
              loading={loading}
              disabled={loading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminUserForm;