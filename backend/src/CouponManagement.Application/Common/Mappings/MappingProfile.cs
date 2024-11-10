// src/CouponManagement.Application/Common/Mappings/MappingProfile.cs
using AutoMapper;
using CouponManagement.Domain.Entities;
using CouponManagement.Application.DTOs;

namespace CouponManagement.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mapping
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            // Coupon mapping
            CreateMap<Coupon, CouponDto>()
                .ForMember(dest => dest.CreatedByUsername, 
                    opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.Username : string.Empty));

            // Coupon Report mapping
            CreateMap<Coupon, CouponReportDto>()
                .ForMember(dest => dest.CreatedByUsername, 
                    opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.Username : string.Empty))
                .ForMember(dest => dest.DiscountType, 
                    opt => opt.MapFrom(src => src.DiscountType.ToString()))
                .ForMember(dest => dest.Status, 
                    opt => opt.MapFrom(src => GetCouponStatus(src)));
        }

        private string GetCouponStatus(Coupon coupon)
        {
            if (!coupon.IsActive)
                return "Inactive";
            if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate < DateTime.UtcNow)
                return "Expired";
            if (coupon.MaxUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaxUsageCount.Value)
                return "MaxedOut";
            return "Active";
        }
    }
}