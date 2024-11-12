using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CouponManagement.Domain.Entities
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DiscountType DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedBy { get; set; } = null!;
        
        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ExpiryDate { get; set; }
        public bool AllowMultipleDiscounts { get; set; }
        public int? MaxUsageCount { get; set; }
        public int CurrentUsageCount { get; set; }
        public bool IsActive { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum DiscountType
    {
        Percentage,
        FixedAmount
    }
}