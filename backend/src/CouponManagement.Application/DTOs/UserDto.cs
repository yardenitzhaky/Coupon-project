// src/CouponManagement.Application/DTOs/UserDto.cs
namespace CouponManagement.Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}