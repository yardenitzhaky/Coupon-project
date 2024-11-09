using System;

namespace CouponManagement.Domain.Entities
{
    public class CouponUsageHistory
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public virtual Coupon Coupon { get; set; } = null!;
        public DateTime UsedAt { get; set; }
        public decimal OrderAmount { get; set; }
        public decimal DiscountAmount { get; set; }
    }
}
