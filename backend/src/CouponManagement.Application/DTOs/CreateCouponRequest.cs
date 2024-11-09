using System;

namespace CouponManagement.Application.DTOs
{
    public class CreateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool AllowMultipleDiscounts { get; set; }
        public int? MaxUsageCount { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
