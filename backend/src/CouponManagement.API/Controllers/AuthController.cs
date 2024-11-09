using Microsoft.AspNetCore.Mvc;
using CouponManagement.Application.DTOs;
using CouponManagement.Application.Services;

namespace CouponManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation($"Login attempt for username: {request.Username}");
                
                var result = await _authService.Login(request.Username, request.Password);
                
                _logger.LogInformation($"Login successful for username: {request.Username}");
                return Ok(new
                {
                    token = result.Token,
                    username = result.Username,
                    role = result.Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login failed for username: {request.Username}. Error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _authService.Register(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}