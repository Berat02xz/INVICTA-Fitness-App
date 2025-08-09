using FitnessAppBackend.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace FitnessAppBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AIController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [Authorize]
        [HttpPost("UploadMeal")]
        public async Task<IActionResult> UploadMeal([FromBody] UploadMealRequestDTO request)
        {
            var apiKey = Environment.GetEnvironmentVariable("OpenAI__ApiKey");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return StatusCode(500, "OpenAI API key not configured.");
            }

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var requestBody = new
            {
                model = "gpt-5-nano-2025-08-07",
                input = new[]
                {
            new
            {
                role = "user",
                content = new object[]
                {
                    new { type = "input_text", text = "Estimate meal details." },
                    new { type = "input_image", image_url = request.MealImage }
                }
            }
        },
                json_schema = new
                {
                    type = "object",
                    properties = new
                    {
                        isMeal = new { type = "boolean" },
                        ShortMealName = new { type = "string" },
                        CaloriesAmount = new { type = "integer" },
                        Protein = new { type = "integer" },
                        Carbs = new { type = "integer" },
                        Fat = new { type = "integer" },
                        Label = new { type = "string", @enum = new[] { "High Fat", "Balanced Meal", "Macro Rich", "Consider Lighter Option", "Dairy Rich" } }
                    }
                },
                strict = true
            };

            var json = JsonSerializer.Serialize(requestBody);

            var response = await httpClient.PostAsync(
                "https://api.openai.com/v1/responses",
                new StringContent(json, Encoding.UTF8, "application/json")
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, error);
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            using JsonDocument doc = JsonDocument.Parse(responseContent);
            string outputText = doc.RootElement.GetProperty("output_text").GetString();

            var mealAnalysis = JsonSerializer.Deserialize<MealAnalysisDTO>(outputText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return Ok(mealAnalysis);
        }


    }
}
