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
    }
}