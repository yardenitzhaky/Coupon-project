// src/CouponManagement.Application/Services/IAuthService.cs
using CouponManagement.Application.DTOs;

namespace CouponManagement.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> Login(string username, string password);
        Task<AuthResponse> Register(RegisterRequest request);
    }
}