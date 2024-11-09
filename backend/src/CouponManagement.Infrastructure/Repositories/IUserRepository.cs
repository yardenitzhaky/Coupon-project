// src/CouponManagement.Infrastructure/Repositories/IUserRepository.cs
using System.Threading.Tasks;
using CouponManagement.Domain.Entities;

namespace CouponManagement.Infrastructure.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> UsernameExistsAsync(string username);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
    }
}

