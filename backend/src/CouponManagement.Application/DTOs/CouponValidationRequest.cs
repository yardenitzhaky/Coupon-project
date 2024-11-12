namespace CouponManagement.Application.DTOs
{
    public class CouponValidationRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderAmount { get; set; }
        public List<string>? PreviouslyAppliedCoupons { get; set; }
    }

    public class MultiCouponValidationRequest
    {
        public List<string> CouponCodes { get; set; } = new();
        public decimal OrderAmount { get; set; }
    }
}