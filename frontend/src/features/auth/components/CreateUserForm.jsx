import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '../authContext';
import { classNames } from 'primereact/utils';

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const { createUser } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createUser(formData.username, formData.password);
        setFormData({ username: '', password: '', confirmPassword: '' });
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Admin User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="username">Username</label>
          <InputText
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={classNames({ 'p-invalid': errors.username })}
          />
          {errors.username && <small className="text-red-500">{errors.username}</small>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={classNames({ 'p-invalid': errors.password })}
          />
          {errors.password && <small className="text-red-500">{errors.password}</small>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            feedback={false}
            className={classNames({ 'p-invalid': errors.confirmPassword })}
          />
          {errors.confirmPassword && (
            <small className="text-red-500">{errors.confirmPassword}</small>
          )}
        </div>

        {errors.submit && (
          <div className="text-red-500 text-center">{errors.submit}</div>
        )}

        <Button
          type="submit"
          label="Create User"
          className="w-full"
        />
      </form>
    </Card>
  );
};

export default CreateUserForm;