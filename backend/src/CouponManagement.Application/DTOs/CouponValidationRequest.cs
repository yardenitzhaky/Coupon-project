namespace CouponManagement.Application.DTOs
{
    public class CouponValidationRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderAmount { get; set; }
    }
}