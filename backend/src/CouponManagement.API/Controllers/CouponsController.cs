using Microsoft.AspNetCore.Mvc;
using CouponManagement.Application.DTOs;
using CouponManagement.Application.Services;

namespace CouponManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;
        private readonly ILogger<CouponsController> _logger;

        // Constructor to initialize the CouponService and Logger
        public CouponsController(ICouponService couponService, ILogger<CouponsController> logger)
        {
            _couponService = couponService;
            _logger = logger;
        }

        // Endpoint to get all coupons
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CouponDto>>> GetCoupons()
        {
            var coupons = await _couponService.GetAllCouponsAsync();
            return Ok(coupons);
        }

        // Endpoint to get a specific coupon by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<CouponDto>> GetCoupon(int id)
        {
            var coupon = await _couponService.GetCouponByIdAsync(id);
            if (coupon == null)
            {
                return NotFound();
            }
            return Ok(coupon);
        }

        // Endpoint to create a new coupon
        [HttpPost]
        public async Task<ActionResult<CouponDto>> CreateCoupon(CreateCouponRequest request)
        {
            try
            {
                // TODO: Get actual user ID from auth context
                var userId = 1; // Temporary default user ID
                var coupon = await _couponService.CreateCouponAsync(request, userId);
                return CreatedAtAction(nameof(GetCoupon), new { id = coupon.Id }, coupon);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint to update an existing coupon
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoupon(int id, UpdateCouponRequest request)
        {
            try
            {
                var coupon = await _couponService.UpdateCouponAsync(id, request);
                return Ok(coupon);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint to delete a coupon by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            try
            {
                await _couponService.DeleteCouponAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint to validate a single coupon
        [HttpPost("validate")]
        public async Task<ActionResult<CouponValidationResult>> ValidateCoupon(
            [FromBody] CouponValidationRequest request)
        {
            try
            {
                var result = await _couponService.ValidateCouponAsync(
                    request.Code,
                    request.OrderAmount,
                    request.PreviouslyAppliedCoupons);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating coupon {Code}", request.Code);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint to validate multiple coupons
        [HttpPost("validate-multiple")]
        public async Task<ActionResult<MultiCouponValidationResult>> ValidateMultipleCoupons(
            [FromBody] MultiCouponValidationRequest request)
        {
            try
            {
                var result = await _couponService.ValidateMultipleCouponsAsync(
                    request.CouponCodes,
                    request.OrderAmount);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating multiple coupons");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint to check if multiple coupons can be combined
        [HttpPost("can-combine")]
        public async Task<ActionResult<bool>> CanCombineCoupons([FromBody] List<string> couponCodes)
        {
            try
            {
                var result = await _couponService.CanCouponsBeUsedTogetherAsync(couponCodes);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking coupon compatibility");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // DTO for validating a single coupon
    public class ValidateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderAmount { get; set; }
    }
}
