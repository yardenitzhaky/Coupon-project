using System.Collections.Generic;
using System.Threading.Tasks;
using CouponManagement.Application.DTOs;

namespace CouponManagement.Application.Services
{
    public interface ICouponService
    {
        Task<IEnumerable<CouponDto>> GetAllCouponsAsync();
        Task<CouponDto> GetCouponByIdAsync(int id);
        Task<CouponDto> CreateCouponAsync(CreateCouponRequest request, int userId);
        Task<CouponDto> UpdateCouponAsync(int id, UpdateCouponRequest request);
        Task DeleteCouponAsync(int id);
        Task<CouponValidationResult> ValidateCouponAsync(string code, decimal orderAmount);
    }
}