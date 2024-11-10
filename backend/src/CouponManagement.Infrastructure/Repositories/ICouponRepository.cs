using System.Collections.Generic;
using System.Threading.Tasks;
using CouponManagement.Domain.Entities;

namespace CouponManagement.Infrastructure.Repositories
{
public interface ICouponRepository
    {
        Task<IEnumerable<Coupon>> GetAllAsync();
        Task<Coupon?> GetByIdAsync(int id);
        Task<Coupon?> GetByCodeAsync(string code);
        Task<Coupon> CreateAsync(Coupon coupon);
        Task<Coupon> UpdateAsync(Coupon coupon);
        Task DeleteAsync(int id);
        Task<bool> CodeExistsAsync(string code);
        Task<bool> IsValidForUseAsync(string code);
        
        // Report-specific methods
        Task<IEnumerable<Coupon>> GetCouponsByUserAsync(int userId);
        Task<IEnumerable<Coupon>> GetCouponsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Coupon>> GetCouponsForReportAsync(DateTime? startDate, DateTime? endDate, int? userId);
        Task<IDictionary<string, object>> GetCouponStatisticsAsync(DateTime? startDate, DateTime? endDate, int? userId);
    }
}
