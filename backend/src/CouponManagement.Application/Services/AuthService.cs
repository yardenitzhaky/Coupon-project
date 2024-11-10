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

            if (!VerifyPassword(password, user.Password))
            {
                throw new Exception("Invalid username or password");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                Username = user.Username,
            };
        }

        public async Task<AuthResponse> Register(RegisterRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting registration process for username: {request.Username}");

                await ValidateRegistrationRequest(request);

                // Check if username exists
                if (await _userRepository.UsernameExistsAsync(request.Username))
                {
                    _logger.LogWarning($"Registration failed: Username already exists: {request.Username}");
                    throw new Exception("Username already exists");
                }

                // Hash password
                var hashedPassword = HashPassword(request.Password);
                _logger.LogInformation($"Password hashed successfully for user: {request.Username}");

                // Create user entity
                var user = new User
                {
                    Username = request.Username,
                    Password = hashedPassword,
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = null,
                    IsActive = true
                };

                // Save to database
                await _userRepository.CreateAsync(user);
                _logger.LogInformation($"User created successfully: {user.Username}");

                // Generate token
                var token = GenerateJwtToken(user);

                return new AuthResponse
                {
                    Token = token,
                    Username = user.Username,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Registration error for username {request.Username}: {ex.Message}");
                throw;
            }
        }

        private async Task ValidateRegistrationRequest(RegisterRequest request)
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                throw new Exception("All fields are required");
            }

            // Check username length
            if (request.Username.Length < 3 || request.Username.Length > 50)
            {
                throw new Exception("Username must be between 3 and 50 characters");
            }

            // Check password length
            if (request.Password.Length < 8 || request.Password.Length > 100)
            {
                throw new Exception("Password must be between 8 and 100 characters");
            }

            // Verify password confirmation
            if (request.Password != request.ConfirmPassword)
            {
                throw new Exception("Passwords do not match");
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                bool verified = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
                _logger.LogInformation($"Password verification result: {verified}");
                return verified;
            }
            catch (Exception ex)
            {
                _logger.LogError($"BCrypt verification error: {ex.Message}");
                _logger.LogError($"Exception type: {ex.GetType().Name}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                throw new Exception("Invalid username or password");
            }
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, 12);
        }

        private string GenerateJwtToken(User user)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError($"Token generation error for user {user.Username}: {ex.Message}");
                throw new Exception("Error generating authentication token");
            }
        }
    }
}