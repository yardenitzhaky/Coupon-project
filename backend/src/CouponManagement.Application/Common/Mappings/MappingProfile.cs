using AutoMapper;
using CouponManagement.Application.DTOs;
using CouponManagement.Domain.Entities;

namespace CouponManagement.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Coupon, CouponDto>()
                .ForMember(dest => dest.CreatedByUsername, 
                    opt => opt.MapFrom(src => src.CreatedBy.Username));
                
            CreateMap<CreateCouponRequest, Coupon>();
            CreateMap<UpdateCouponRequest, Coupon>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}