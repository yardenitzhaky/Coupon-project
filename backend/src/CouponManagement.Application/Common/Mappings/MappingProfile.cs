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
            CreateMap<User, UserDto>();

            // Coupon to CouponDto mapping
            CreateMap<Coupon, CouponDto>()
                .ForMember(dest => dest.CreatedByUsername, 
                    opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.Username : string.Empty))
                .ForMember(dest => dest.DiscountType,
                    opt => opt.MapFrom(src => src.DiscountType.ToString()));

            // CreateCouponRequest to Coupon mapping
            CreateMap<CreateCouponRequest, Coupon>()
                .ForMember(dest => dest.DiscountType,
                    opt => opt.MapFrom(src => ParseDiscountType(src.DiscountType)));

            // UpdateCouponRequest to Coupon mapping
            CreateMap<UpdateCouponRequest, Coupon>()
                .ForMember(dest => dest.DiscountType,
                    opt => opt.MapFrom(src => ParseDiscountType(src.DiscountType)))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Coupon Report mapping
            CreateMap<Coupon, CouponReportDto>()
                .ForMember(dest => dest.CreatedByUsername, 
                    opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.Username : string.Empty))
                .ForMember(dest => dest.DiscountType, 
                    opt => opt.MapFrom(src => src.DiscountType.ToString()))
                .ForMember(dest => dest.Status, 
                    opt => opt.MapFrom(src => GetCouponStatus(src)));
        }

        private DiscountType ParseDiscountType(string discountType)
        {
            if (Enum.TryParse<DiscountType>(discountType, out var result))
            {
                return result;
            }
            throw new ArgumentException($"Invalid discount type: {discountType}");
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