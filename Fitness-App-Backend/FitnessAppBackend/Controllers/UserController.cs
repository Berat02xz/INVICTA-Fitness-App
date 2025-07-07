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
        private readonly IOnboardingAnswersService _onboardingAnswersService;

        public UserController(IUserService userService, IJwtTokenService jwtTokenService, IOnboardingAnswersService onboardingAnswersService)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
            _onboardingAnswersService = onboardingAnswersService;
        }

        [HttpGet("all")]
        //[Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllLazy();
            return Ok(users);
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
        [HttpPost("UploadOnboarding")]
        public async Task<IActionResult> UploadOnboardingAnswers([FromBody] OnboardingDTO onboardingAnswers)
        {
            if (onboardingAnswers == null || onboardingAnswers.UserId == Guid.Empty)
            {
                return BadRequest("Invalid onboarding answers.");
            }
            var user = await _userService.GetByIdAsync(onboardingAnswers.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var answerEntities = onboardingAnswers.Answers.Select(answerDto => new OnboardingAnswers
            {
                Id = Guid.NewGuid(),
                UserId = onboardingAnswers.UserId,
                User = user,
                Question = answerDto.Question,
                Answer = answerDto.Answer ?? string.Empty
            }).ToList();

            await _onboardingAnswersService.AddRangeAsync(answerEntities);
            return Ok("Onboarding answers uploaded successfully.");
        }

        [Authorize]
        [HttpGet("GetOnboardingAnswers/{userId}")]
        public async Task<IActionResult> GetOnboardingAnswers(Guid userId)
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var answers = await _onboardingAnswersService.GetOnboardingAnswersByUserIdAsync(userId);
            return Ok(answers);
        }


        //Test purposes
        //Get All Onboarding
        [HttpGet("GetAllOnboardingAnswers")]
        public async Task<IActionResult> GetAllOnboardingAnswers()
        {
            var answers = await _onboardingAnswersService.GetAllAsync();
            return Ok(answers);

        }
    }
}
