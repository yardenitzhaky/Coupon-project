using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CouponManagement.Application.DTOs;
using CouponManagement.Application.Common.Exceptions;
using CouponManagement.Domain.Entities;
using CouponManagement.Infrastructure.Repositories;
using Microsoft.Extensions.Logging;

namespace CouponManagement.Application.Services
{
   public class CouponService : ICouponService
{
    private readonly ICouponRepository _couponRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CouponService> _logger;

    public CouponService(
        ICouponRepository couponRepository,
        IMapper mapper,
        ILogger<CouponService> logger)
    {
        _couponRepository = couponRepository;
        _mapper = mapper;
        _logger = logger;
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

     public async Task<CouponValidationResult> ValidateCouponAsync(
        string code, 
        decimal orderAmount, 
        List<string>? previouslyAppliedCoupons = null)
    {
        try
        {
            var coupon = await _couponRepository.GetByCodeAsync(code);
            if (coupon == null)
            {
                return new CouponValidationResult 
                { 
                    IsValid = false, 
                    Message = "Coupon not found" 
                };
            }

            // Check if coupon is valid for use
            if (!await _couponRepository.IsValidForUseAsync(code))
            {
                return new CouponValidationResult 
                { 
                    IsValid = false, 
                    Message = "Coupon is not valid for use" 
                };
            }

            // Check if multiple discounts are allowed
            if (previouslyAppliedCoupons?.Any() == true && !coupon.AllowMultipleDiscounts)
            {
                return new CouponValidationResult 
                { 
                    IsValid = false, 
                    Message = "This coupon cannot be combined with other coupons" 
                };
            }

            // Calculate discount
            var discountAmount = CalculateDiscountAmount(coupon, orderAmount);

            return new CouponValidationResult
            {
                IsValid = true,
                DiscountAmount = discountAmount,
                FinalAmount = orderAmount - discountAmount,
                AppliedCode = code,
                AllowMultipleDiscounts = coupon.AllowMultipleDiscounts
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating coupon {Code}", code);
            throw;
        }
    }

        public async Task<MultiCouponValidationResult> ValidateMultipleCouponsAsync(
        List<string> couponCodes, 
        decimal orderAmount)
    {
        try
        {
            var result = new MultiCouponValidationResult
            {
                IsValid = true,
                AppliedCoupons = new List<AppliedCouponInfo>(),
                FinalAmount = orderAmount
            };

            // Validate that coupons can be used together
            if (!await CanCouponsBeUsedTogetherAsync(couponCodes))
            {
                return new MultiCouponValidationResult
                {
                    IsValid = false,
                    Message = "Some of these coupons cannot be combined"
                };
            }

            // Apply coupons sequentially
            var currentAmount = orderAmount;
            var appliedCodes = new List<string>();

            foreach (var code in couponCodes)
            {
                var validationResult = await ValidateCouponAsync(code, currentAmount, appliedCodes);
                
                if (!validationResult.IsValid)
                {
                    return new MultiCouponValidationResult
                    {
                        IsValid = false,
                        Message = $"Coupon {code}: {validationResult.Message}"
                    };
                }

                var coupon = await _couponRepository.GetByCodeAsync(code) ?? throw new NotFoundException(nameof(Coupon), code);
                result.AppliedCoupons.Add(new AppliedCouponInfo
                {
                    Code = code,
                    DiscountAmount = validationResult.DiscountAmount ?? 0,
                    DiscountType = coupon.DiscountType.ToString(),
                    DiscountValue = coupon.DiscountValue
                });

                currentAmount = validationResult.FinalAmount ?? currentAmount;
                appliedCodes.Add(code);
            }

            result.FinalAmount = currentAmount;
            result.TotalDiscountAmount = orderAmount - currentAmount;

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating multiple coupons");
            throw;
        }
    }

    public async Task<bool> CanCouponsBeUsedTogetherAsync(List<string> couponCodes)
    {
        try
        {
            var coupons = new List<Coupon>();
            foreach (var code in couponCodes)
            {
                var coupon = await _couponRepository.GetByCodeAsync(code);
                if (coupon == null) return false;
                coupons.Add(coupon);
            }

            // Check if any coupon doesn't allow multiple discounts
            if (coupons.Any(c => !c.AllowMultipleDiscounts && couponCodes.Count > 1))
            {
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if coupons can be used together");
            throw;
        }
    }

    private decimal CalculateDiscountAmount(Coupon coupon, decimal orderAmount)
    {
        return coupon.DiscountType switch
        {
            DiscountType.Percentage => orderAmount * (coupon.DiscountValue / 100),
            DiscountType.FixedAmount => Math.Min(coupon.DiscountValue, orderAmount),
            _ => throw new ArgumentException($"Unknown discount type: {coupon.DiscountType}")
        };
    }
    }
}