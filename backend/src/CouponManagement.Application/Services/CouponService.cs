using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CouponManagement.Application.DTOs;
using CouponManagement.Application.Common.Exceptions;
using CouponManagement.Domain.Entities;
using CouponManagement.Infrastructure.Repositories;

namespace CouponManagement.Application.Services
{
    public class CouponService : ICouponService 
    {
        private readonly ICouponRepository _couponRepository;
        private readonly IMapper _mapper;

        public CouponService(ICouponRepository couponRepository, IMapper mapper)
        {
            _couponRepository = couponRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CouponDto>> GetAllCouponsAsync()
        {
            var coupons = await _couponRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<CouponDto>>(coupons);
        }

        public async Task<CouponDto> GetCouponByIdAsync(int id)
        {
            var coupon = await _couponRepository.GetByIdAsync(id);
            if (coupon == null)
                throw new NotFoundException(nameof(Coupon), id);

            return _mapper.Map<CouponDto>(coupon);
        }

        public async Task<CouponDto> CreateCouponAsync(CreateCouponRequest request, int userId)
        {
            if (await _couponRepository.CodeExistsAsync(request.Code))
                throw new InvalidOperationException("Coupon code already exists");

            var coupon = _mapper.Map<Coupon>(request);
            coupon.CreatedById = userId;
            coupon.CreatedAt = DateTime.UtcNow;

            var createdCoupon = await _couponRepository.CreateAsync(coupon);
            return _mapper.Map<CouponDto>(createdCoupon);
        }

        public async Task<CouponDto> UpdateCouponAsync(int id, UpdateCouponRequest request)
        {
            var existingCoupon = await _couponRepository.GetByIdAsync(id);
            if (existingCoupon == null)
                throw new NotFoundException(nameof(Coupon), id);

            _mapper.Map(request, existingCoupon);
            var updatedCoupon = await _couponRepository.UpdateAsync(existingCoupon);
            return _mapper.Map<CouponDto>(updatedCoupon);
        }

        public async Task DeleteCouponAsync(int id)
        {
            var coupon = await _couponRepository.GetByIdAsync(id);
            if (coupon == null)
                throw new NotFoundException(nameof(Coupon), id);

            await _couponRepository.DeleteAsync(id);
        }

        public async Task<CouponValidationResult> ValidateCouponAsync(string code, decimal orderAmount)
        {
            var coupon = await _couponRepository.GetByCodeAsync(code);
            if (coupon == null)
                return new CouponValidationResult { IsValid = false, Message = "Coupon not found" };

            if (!await _couponRepository.IsValidForUseAsync(code))
                return new CouponValidationResult { IsValid = false, Message = "Coupon is not valid" };

            var discountAmount = coupon.DiscountType == DiscountType.Percentage
                ? orderAmount * (coupon.DiscountValue / 100)
                : coupon.DiscountValue;

            return new CouponValidationResult
            {
                IsValid = true,
                DiscountAmount = discountAmount,
                FinalAmount = orderAmount - discountAmount
            };
        }
    }
}