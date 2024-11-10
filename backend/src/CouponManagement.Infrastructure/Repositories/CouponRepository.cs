using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CouponManagement.Domain.Entities;
using CouponManagement.Infrastructure.Data;

namespace CouponManagement.Infrastructure.Repositories
{
    public class CouponRepository : ICouponRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CouponRepository> _logger;

        public CouponRepository(
            ApplicationDbContext context,
            ILogger<CouponRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Base CRUD Operations
        public async Task<IEnumerable<Coupon>> GetAllAsync()
        {
            try
            {
                return await _context.Coupons
                    .Include(c => c.CreatedBy)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all coupons");
                throw;
            }
        }

        public async Task<Coupon?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.Coupons
                    .Include(c => c.CreatedBy)
                    .FirstOrDefaultAsync(c => c.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupon with ID: {CouponId}", id);
                throw;
            }
        }

        public async Task<Coupon?> GetByCodeAsync(string code)
        {
            try
            {
                return await _context.Coupons
                    .Include(c => c.CreatedBy)
                    .FirstOrDefaultAsync(c => c.Code == code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupon with code: {CouponCode}", code);
                throw;
            }
        }

        public async Task<Coupon> CreateAsync(Coupon coupon)
        {
            try
            {
                _context.Coupons.Add(coupon);
                await _context.SaveChangesAsync();
                return coupon;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating coupon with code: {CouponCode}", coupon.Code);
                throw;
            }
        }

        public async Task<Coupon> UpdateAsync(Coupon coupon)
        {
            try
            {
                _context.Entry(coupon).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return coupon;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating coupon with ID: {CouponId}", coupon.Id);
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            try
            {
                var coupon = await _context.Coupons.FindAsync(id);
                if (coupon != null)
                {
                    _context.Coupons.Remove(coupon);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting coupon with ID: {CouponId}", id);
                throw;
            }
        }

        public async Task<bool> CodeExistsAsync(string code)
        {
            try
            {
                return await _context.Coupons.AnyAsync(c => c.Code == code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking existence of coupon code: {CouponCode}", code);
                throw;
            }
        }

        public async Task<bool> IsValidForUseAsync(string code)
        {
            try
            {
                var coupon = await GetByCodeAsync(code);
                
                if (coupon == null || !coupon.IsActive)
                    return false;

                if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
                    return false;

                if (coupon.MaxUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaxUsageCount.Value)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while validating coupon code: {CouponCode}", code);
                throw;
            }
        }

        // Report-specific methods
        public async Task<IEnumerable<Coupon>> GetCouponsByUserAsync(int userId)
        {
            try
            {
                return await _context.Coupons
                    .Include(c => c.CreatedBy)
                    .Where(c => c.CreatedById == userId)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupons for user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<Coupon>> GetCouponsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                return await _context.Coupons
                    .Include(c => c.CreatedBy)
                    .Where(c => c.CreatedAt >= startDate && c.CreatedAt <= endDate)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupons for date range: {StartDate} to {EndDate}", 
                    startDate, endDate);
                throw;
            }
        }

        public async Task<IEnumerable<Coupon>> GetCouponsForReportAsync(
            DateTime? startDate,
            DateTime? endDate,
            int? userId)
        {
            try
            {
                var query = _context.Coupons
                    .Include(c => c.CreatedBy)
                    .AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(c => c.CreatedAt >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(c => c.CreatedAt <= endDate.Value);

                if (userId.HasValue)
                    query = query.Where(c => c.CreatedById == userId.Value);

                return await query
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupons for report with filters: StartDate={StartDate}, EndDate={EndDate}, UserId={UserId}",
                    startDate, endDate, userId);
                throw;
            }
        }

        public async Task<IDictionary<string, object>> GetCouponStatisticsAsync(
            DateTime? startDate,
            DateTime? endDate,
            int? userId)
        {
            try
            {
                var query = _context.Coupons.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(c => c.CreatedAt >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(c => c.CreatedAt <= endDate.Value);

                if (userId.HasValue)
                    query = query.Where(c => c.CreatedById == userId.Value);

                var now = DateTime.UtcNow;

                var stats = await query
                    .GroupBy(c => 1)
                    .Select(g => new
                    {
                        TotalCoupons = g.Count(),
                        ActiveCoupons = g.Count(c => c.IsActive),
                        ExpiredCoupons = g.Count(c => c.ExpiryDate.HasValue && c.ExpiryDate < now),
                        TotalUsage = g.Sum(c => c.CurrentUsageCount),
                        TotalValue = g.Sum(c => c.DiscountType == DiscountType.FixedAmount ? c.DiscountValue : 0),
                        AveragePercentageDiscount = g.Where(c => c.DiscountType == DiscountType.Percentage)
                                                   .Average(c => (double?)c.DiscountValue) ?? 0
                    })
                    .FirstOrDefaultAsync();

                return new Dictionary<string, object>
                {
                    { "totalCoupons", stats?.TotalCoupons ?? 0 },
                    { "activeCoupons", stats?.ActiveCoupons ?? 0 },
                    { "expiredCoupons", stats?.ExpiredCoupons ?? 0 },
                    { "totalUsage", stats?.TotalUsage ?? 0 },
                    { "totalDiscountValue", Math.Round(stats?.TotalValue ?? 0, 2) },
                    { "averagePercentageDiscount", Math.Round(stats?.AveragePercentageDiscount ?? 0, 1) }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupon statistics with filters: StartDate={StartDate}, EndDate={EndDate}, UserId={UserId}",
                    startDate, endDate, userId);
                throw;
            }
        }

        // Helper method to increment usage count
        public async Task IncrementUsageCountAsync(int couponId)
        {
            try
            {
                var coupon = await GetByIdAsync(couponId);
                if (coupon != null)
                {
                    coupon.CurrentUsageCount++;
                    await UpdateAsync(coupon);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while incrementing usage count for coupon ID: {CouponId}", couponId);
                throw;
            }
        }
    }
}