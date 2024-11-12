namespace CouponManagement.Application.DTOs
{
    public class CouponValidationResult
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public bool AllowMultipleDiscounts { get; set; }
        public string? AppliedCode { get; set; }
    }

    public class MultiCouponValidationResult
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
        public List<AppliedCouponInfo> AppliedCoupons { get; set; } = new();
        public decimal TotalDiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
    }

    public class AppliedCouponInfo
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal FinalAmount { get; set; }
    }
}