using Microsoft.AspNetCore.Mvc;
using CouponManagement.Application.DTOs;
using CouponManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;

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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                _logger.LogInformation($"Registration attempt for username: {request.Username}");

                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                        );

                    _logger.LogWarning($"Invalid registration attempt: {System.Text.Json.JsonSerializer.Serialize(errors)}");
                    return BadRequest(new { message = "Validation failed", errors });
                }

                // Log the received request
                _logger.LogInformation($"Received registration request: {System.Text.Json.JsonSerializer.Serialize(request)}");

                var result = await _authService.Register(request);
                
                _logger.LogInformation($"Registration successful for username: {request.Username}");
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Registration failed for username: {request.Username}. Error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
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
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login failed for username: {request.Username}. Error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}