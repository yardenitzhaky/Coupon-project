// src/CouponManagement.Application/Services/IReportService.cs
using CouponManagement.Application.DTOs;
using CouponManagement.Domain.Entities;

namespace CouponManagement.Application.Services
{
    public interface IReportService
    {
        Task<IEnumerable<UserDto>> GetUsersAsync();
        Task<IEnumerable<CouponReportDto>> GetCouponsByUserAsync(int userId);
        Task<IEnumerable<Coupon>> GetCouponsForReportAsync(DateTime? startDate, DateTime? endDate, int? userId);
        Task<IEnumerable<CouponReportDto>> GetCouponsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<byte[]> ExportCouponsToExcelAsync(DateTime? startDate, DateTime? endDate, int? userId);
        Task<IDictionary<string, object>> GetCouponStatisticsAsync(DateTime? startDate, DateTime? endDate, int? userId);
    }
}