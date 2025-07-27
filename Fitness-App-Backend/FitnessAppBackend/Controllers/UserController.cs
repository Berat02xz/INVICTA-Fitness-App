using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;
using FitnessAppBackend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessAppBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IUserInformationService _userInformationService;

        public UserController(IUserService userService, IJwtTokenService jwtTokenService, IUserInformationService userInformationService)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
            _userInformationService = userInformationService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDTO request)
        {
            var existingUser = await _userService.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest("User with this email already exists.");
            }

            var HashedPassword = _userService.HashPassword(request.Password);

            var NewUser = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = HashedPassword,
                CreatedAt = DateTime.UtcNow,
            };

            await _userService.AddAsync(NewUser);

            var UserId = NewUser.Id;
            var token = _jwtTokenService.GenerateToken(UserId, request.Email, request.Name);

            return Ok(new { token });

        }

        [Authorize]
        [HttpPost("UploadUserInformation")]
        public async Task<IActionResult> UploadUserInformation([FromBody] UserInformationDTO dto)
        {
            if (dto == null || dto.UserId == Guid.Empty)
            {
                return BadRequest("Invalid onboarding answers.");
            }
            var user = await _userService.GetByIdAsync(dto.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            try
            {
                UserInformation userInformation = new UserInformation
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    User = user,
                    Age = int.Parse(dto.Answers["age"]?.ToString() ?? "0"),
                    Unit = dto.Answers["unit"]?.ToString() ?? string.Empty,
                    ActivityLevel = dto.Answers["activity_level"]?.ToString() ?? string.Empty,
                    EquipmentAccess = dto.Answers["equipment_access"]?.ToString() ?? string.Empty,
                    FitnessLevel = dto.Answers["PushUps"]?.ToString() ?? string.Empty,
                    Goal = dto.Answers["fitness_goal"]?.ToString() ?? string.Empty,
                    Height = dto.Answers["height"]?.ToString() ?? string.Empty,
                    Weight = int.Parse(dto.Answers["weight"]?.ToString() ?? "0"),
                    BMI = double.Parse(dto.Answers["bmi"]?.ToString() ?? "0"),
                    BMR = double.Parse(dto.Answers["bmr"]?.ToString() ?? "0"),
                    TDEE = double.Parse(dto.Answers["tdee"]?.ToString() ?? "0"),
                    Gender = dto.Answers["gender"]?.ToString() ?? string.Empty,
                    CaloricIntake = int.Parse(dto.Answers["caloric_intake"]?.ToString() ?? "0"),
                    CaloricDeficit = dto.Answers["calorie_deficit"]?.ToString() ?? string.Empty,
                    AppName = dto.Answers["app_name"]?.ToString() ?? string.Empty,
                };
                await _userInformationService.AddAsync(userInformation);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error uploading user information: {ex.Message}");
            }

            return Ok("Onboarding answers uploaded successfully.");
        }

        [Authorize]
        [HttpGet("GetUserInformation/{userId}")]
        public async Task<IActionResult> GetUserInformation(Guid userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var userInformation = await _userInformationService.GetByUserId(userId);
            return Ok(userInformation);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO request)
        {
            var user = await _userService.GetUserByEmailAsync(request.Email);

            if (user == null || !_userService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = _jwtTokenService.GenerateToken(user.Id, user.Email, user.Name);
            return Ok(new { token });
        }

    }
}
