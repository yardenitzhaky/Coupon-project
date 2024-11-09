import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { classNames } from 'primereact/utils';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await login(username, password);
        navigate('/admin/dashboard');
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={classNames({ 'p-invalid': errors.username })}
            />
            {errors.username && <small className="text-red-500">{errors.username}</small>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className={classNames({ 'p-invalid': errors.password })}
            />
            {errors.password && <small className="text-red-500">{errors.password}</small>}
          </div>

          {errors.submit && (
            <div className="text-red-500 text-center">{errors.submit}</div>
          )}

          <Button
            type="submit"
            label="Login"
            className="w-full"
          />
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;