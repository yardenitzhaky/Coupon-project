using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using AutoMapper;
using Microsoft.Extensions.Logging;
using CouponManagement.Application.DTOs;
using CouponManagement.Infrastructure.Repositories;
using ClosedXML.Excel;
using CouponManagement.Domain.Entities;

namespace CouponManagement.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly ICouponRepository _couponRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ReportService> _logger;

        public ReportService(
            ICouponRepository couponRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<ReportService> logger)
        {
            _couponRepository = couponRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<UserDto>> GetUsersAsync()
        {
            try
            {
                var users = await _userRepository.GetAllUsersAsync();
                return _mapper.Map<IEnumerable<UserDto>>(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting users");
                throw;
            }
        }

        public async Task<IEnumerable<CouponReportDto>> GetCouponsByUserAsync(int userId)
        {
            try
            {
                var coupons = await _couponRepository.GetCouponsByUserAsync(userId);
                return _mapper.Map<IEnumerable<CouponReportDto>>(coupons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupons for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<CouponReportDto>> GetCouponsByDateRangeAsync(
            DateTime startDate,
            DateTime endDate)
        {
            try
            {
                var coupons = await _couponRepository.GetCouponsByDateRangeAsync(startDate, endDate);
                return _mapper.Map<IEnumerable<CouponReportDto>>(coupons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupons for date range");
                throw;
            }
        }

        public async Task<byte[]> ExportCouponsToExcelAsync(
            DateTime? startDate,
            DateTime? endDate,
            int? userId)
        {
            try
            {
                var coupons = await _couponRepository.GetCouponsForReportAsync(startDate, endDate, userId);
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Coupons Report");

                // Add headers
                worksheet.Cell(1, 1).Value = "Code";
                worksheet.Cell(1, 2).Value = "Description";
                worksheet.Cell(1, 3).Value = "Discount Type";
                worksheet.Cell(1, 4).Value = "Discount Value";
                worksheet.Cell(1, 5).Value = "Created By";
                worksheet.Cell(1, 6).Value = "Created At";
                worksheet.Cell(1, 7).Value = "Expiry Date";
                worksheet.Cell(1, 8).Value = "Usage Count";
                worksheet.Cell(1, 9).Value = "Status";

                // Style the header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

                // Add data
                int row = 2;
                foreach (var coupon in coupons)
                {
                    worksheet.Cell(row, 1).Value = coupon.Code;
                    worksheet.Cell(row, 2).Value = coupon.Description;
                    worksheet.Cell(row, 3).Value = coupon.DiscountType.ToString();
                    worksheet.Cell(row, 4).Value = coupon.DiscountValue;
                    worksheet.Cell(row, 5).Value = coupon.CreatedBy?.Username ?? "Unknown";
                    worksheet.Cell(row, 6).Value = coupon.CreatedAt;
                    worksheet.Cell(row, 7).Value = coupon.ExpiryDate;
                    worksheet.Cell(row, 8).Value = $"{coupon.CurrentUsageCount}/{coupon.MaxUsageCount ?? '∞'}";
                    worksheet.Cell(row, 9).Value = GetCouponStatus(coupon);
                    row++;
                }

                // Auto-fit columns
                worksheet.Columns().AdjustToContents();

                // Convert to byte array
                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while exporting coupons to Excel");
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
                return await _couponRepository.GetCouponStatisticsAsync(startDate, endDate, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting coupon statistics");
                throw;
            }
        }

   private string GetCouponStatus(CouponManagement.Domain.Entities.Coupon coupon)
{
    if (!coupon.IsActive)
        return "Inactive";
    if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate < DateTime.UtcNow)
        return "Expired";
    if (coupon.MaxUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaxUsageCount.Value)
        return "MaxedOut";
    return "Active";
}
        public async Task<IEnumerable<Coupon>> GetCouponsForReportAsync(
            DateTime? startDate, 
            DateTime? endDate, 
            int? userId)
        {
            try
            {
                return await _couponRepository.GetCouponsForReportAsync(startDate, endDate, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting coupons for report");
                throw;
            }
        }   
    }
}