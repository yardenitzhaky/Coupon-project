using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using CouponManagement.Application.DTOs;
using CouponManagement.Domain.Entities;
using CouponManagement.Infrastructure.Repositories;
using Microsoft.Extensions.Logging;

namespace CouponManagement.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IConfiguration configuration,
            IUserRepository userRepository,
            ILogger<AuthService> logger)
        {
            _configuration = configuration;
            _userRepository = userRepository;
            _logger = logger;
        }

public async Task<AuthResponse> Login(string username, string password)
{
    var user = await _userRepository.GetByUsernameAsync(username);
    if (user == null)
    {
        throw new Exception("Invalid username or password");
    }

    _logger.LogInformation($"Found user with ID: {user.Id}");
    _logger.LogInformation($"Stored hash: {user.Password}");
    _logger.LogInformation($"Attempting verification for password: {password}");

    try
    {
        bool verified = BCrypt.Net.BCrypt.Verify(password, user.Password);
        _logger.LogInformation($"Password verification result: {verified}");

        if (!verified)
        {
            throw new Exception("Invalid username or password");
        }
    }
    catch (Exception ex)
    {
        _logger.LogError($"BCrypt verification error: {ex.Message}");
        _logger.LogError($"Exception type: {ex.GetType().Name}");
        _logger.LogError($"Stack trace: {ex.StackTrace}");
        throw new Exception("Invalid username or password");
    }

    var token = GenerateJwtToken(user);

    return new AuthResponse
    {
        Token = token,
        Username = user.Username,
        Role = user.Role.ToString()
    };
}


        public async Task<AuthResponse> Register(RegisterRequest request)
        {
            if (await _userRepository.UsernameExistsAsync(request.Username))
            {
                throw new Exception("Username already exists");
            }

            // Use default BCrypt settings with workFactor 12
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
            
            _logger.LogInformation($"Generated hash for new user: {hashedPassword}");

            var user = new User
            {
                Username = request.Username,
                Password = hashedPassword,
                Role = Enum.Parse<UserRole>(request.Role),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role.ToString()
            };
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(
                _configuration["Jwt:SecretKey"] ?? 
                throw new Exception("JWT Secret key not configured"));
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}