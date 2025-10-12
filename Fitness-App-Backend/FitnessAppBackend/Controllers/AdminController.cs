using Microsoft.AspNetCore.Mvc;

namespace FitnessAppBackend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private static readonly string Passcode = "admininvicta";

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request?.Passcode != Passcode)
                return Unauthorized(new { error = "Invalid passcode" });

            return Ok(new { success = true });
        }

        public class LoginRequest { public string? Passcode { get; set; } }
    }
}
