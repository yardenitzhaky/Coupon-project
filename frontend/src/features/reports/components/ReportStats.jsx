import React from 'react';
import { Card } from 'primereact/card';

const ReportStats = ({ data }) => {
  // Calculate statistics from coupon data
  const calculateStats = () => {
    // Return default values if no data
    if (!data || data.length === 0) {
      return {
        totalCoupons: 0,
        activeCoupons: 0,
        expiredCoupons: 0,
        totalUsage: 0,
        averageDiscount: 0
      };
    }

    const now = new Date();

    // Reduce data to calculate statistics
    const stats = data.reduce((acc, coupon) => {
      // Track active coupons
      if (coupon.isActive) {
        acc.activeCoupons++;
      }

      // Track expired coupons
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        acc.expiredCoupons++;
      }

      // Sum usage counts
      acc.totalUsage += coupon.currentUsageCount;

      // Calculate percentage discounts average
      if (coupon.discountType === 'PERCENTAGE') {
        acc.totalDiscountPercentage += coupon.discountValue;
        acc.percentageCount++;
      }

      return acc;
    }, {
      activeCoupons: 0,
      expiredCoupons: 0,
      totalUsage: 0,
      totalDiscountPercentage: 0,
      percentageCount: 0
    });

    // Return final calculated stats
    return {
      totalCoupons: data.length,
      activeCoupons: stats.activeCoupons,
      expiredCoupons: stats.expiredCoupons,
      totalUsage: stats.totalUsage,
      averageDiscount: stats.percentageCount > 0
        ? (stats.totalDiscountPercentage / stats.percentageCount).toFixed(1)
        : 0
    };
  };

  // Get calculated statistics
  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
      {/* Total Coupons Card */}
      <Card className="text-center">
        <div className="text-xl font-bold text-blue-600">{stats.totalCoupons}</div>
        <div className="text-sm text-gray-600">Total Coupons</div>
      </Card>

      {/* Active Coupons Card */}
      <Card className="text-center">
        <div className="text-xl font-bold text-green-600">{stats.activeCoupons}</div>
        <div className="text-sm text-gray-600">Active Coupons</div>
      </Card>

      {/* Expired Coupons Card */}
      <Card className="text-center">
        <div className="text-xl font-bold text-yellow-600">{stats.expiredCoupons}</div>
        <div className="text-sm text-gray-600">Expired Coupons</div>
      </Card>

      {/* Total Usage Card */}
      <Card className="text-center">
        <div className="text-xl font-bold text-purple-600">{stats.totalUsage}</div>
        <div className="text-sm text-gray-600">Total Usage</div>
      </Card>

      {/* Average Discount Card */}
      <Card className="text-center">
        <div className="text-xl font-bold text-indigo-600">{stats.averageDiscount}%</div>
        <div className="text-sm text-gray-600">Avg. Discount</div>
      </Card>
    </div>
  );
};

export default ReportStats;