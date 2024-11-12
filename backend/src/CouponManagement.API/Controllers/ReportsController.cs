using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CouponManagement.Application.Services;
using CouponManagement.Application.DTOs;
using System.Security.Claims;

namespace CouponManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Ensure only authenticated users can access reports
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        // Constructor to initialize the ReportService and Logger
        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        // Get list of users for reports filtering
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _reportService.GetUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting users list: {ex.Message}");
                return BadRequest(new { message = "Failed to retrieve users" });
            }
        }

        // Get coupons by user ID
        [HttpGet("coupons/by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<CouponReportDto>>> GetCouponsByUser(int userId)
        {
            try
            {
                var coupons = await _reportService.GetCouponsByUserAsync(userId);
                return Ok(coupons);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting coupons for user {userId}: {ex.Message}");
                return BadRequest(new { message = "Failed to retrieve coupons" });
            }
        }

        // Get coupons by date range
        [HttpGet("coupons/by-date")]
        public async Task<ActionResult<IEnumerable<CouponReportDto>>> GetCouponsByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                _logger.LogInformation($"Getting coupons for date range: {startDate} to {endDate}");
                var coupons = await _reportService.GetCouponsByDateRangeAsync(startDate, endDate);
                return Ok(coupons);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting coupons for date range: {ex.Message}");
                return BadRequest(new { message = "Failed to retrieve coupons" });
            }
        }

        // Export coupons to Excel
        [HttpGet("coupons/export")]
        public async Task<IActionResult> ExportCouponsToExcel(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? userId)
        {
            try
            {
                var excelFile = await _reportService.ExportCouponsToExcelAsync(startDate, endDate, userId);
                
                return File(
                    excelFile,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"coupons-report-{DateTime.Now:yyyy-MM-dd}.xlsx"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error exporting coupons to Excel: {ex.Message}");
                return BadRequest(new { message = "Failed to export coupons" });
            }
        }

        // Get coupon statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<IDictionary<string, object>>> GetStatistics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? userId)
        {
            try
            {
                var statistics = await _reportService.GetCouponStatisticsAsync(startDate, endDate, userId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting statistics: {ex.Message}");
                return BadRequest(new { message = "Failed to retrieve statistics" });
            }
        }
    }
}
