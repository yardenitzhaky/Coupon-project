import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CouponList from '../components/CouponList';

const CouponsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CouponList />} />
    </Routes>
  );
};

export default CouponsRoutes;