// src/layouts/MainLayout.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router-dom';


const PublicHeader = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-8 h-8" />
        <span className="text-2xl font-bold">CouponGuard</span>
      </div>
    </div>
  </div>
);

export const Footer = () => (
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

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};