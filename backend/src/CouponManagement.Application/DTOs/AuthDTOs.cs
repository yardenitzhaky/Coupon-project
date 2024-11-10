// src/CouponManagement.Application/DTOs/AuthDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace CouponManagement.Application.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
        {
            [Required]
            [StringLength(50, MinimumLength = 3)]
            public string Username { get; set; } = string.Empty;
            
            [Required]
            [StringLength(100, MinimumLength = 8)]
            public string Password { get; set; } = string.Empty;

            [Required]
            [Compare("Password")]
            public string ConfirmPassword { get; set; } = string.Empty;
            
        }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}