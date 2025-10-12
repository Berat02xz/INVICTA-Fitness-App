using FitnessAppBackend.Service;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace FitnessAppBackend.Controllers
{
    [ApiController]
    [Route("api/logs")]
    public class LogsController : ControllerBase
    {
        private const string Passcode = "admininvicta";

        [HttpPost]
        public IActionResult GetLogs([FromBody] LogsRequest request)
        {
            if (string.IsNullOrEmpty(request?.Passcode) || request.Passcode != Passcode)
                return Unauthorized(new { error = "Invalid passcode" });

            var logs = LogService.GetAll().ToList();
            
            // Return with standard JSON serialization (no reference preservation)
            return new JsonResult(logs, new JsonSerializerOptions
            {
                WriteIndented = false
            });
        }
    }

    public class LogsRequest
    {
        public string Passcode { get; set; } = string.Empty;
    }
}
