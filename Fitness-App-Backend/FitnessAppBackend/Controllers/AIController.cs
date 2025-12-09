using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;
using FitnessAppBackend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace FitnessAppBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<AIController> _logger;
        private readonly IConsumedMealService _mealService;
        public AIController(IHttpClientFactory httpClientFactory, ILogger<AIController> logger, IConsumedMealService mealService)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _mealService = mealService;
        }

        [Authorize]
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpPost("UploadMeal")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMeal([FromForm] string UserId, [FromForm] IFormFile MealImage)
        {
            _logger.LogInformation("UploadMeal called for user {UserId}", UserId);

            if (MealImage == null || MealImage.Length == 0)
            {
                _logger.LogWarning("No file uploaded for user {UserId}", UserId);
                return BadRequest("No file uploaded.");
            }

            var apiKey = Environment.GetEnvironmentVariable("OpenAI__ApiKey");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogError("OpenAI API key not configured for user {UserId}", UserId);
                return StatusCode(500, "OpenAI API key not configured.");
            }
            else
            {
                _logger.LogDebug("OpenAI API key: {ApiKey}", apiKey);
            }
            
            // Convert file to Base64 for OpenAI
            string imageBase64;
            using (var ms = new MemoryStream())
            {
                await MealImage.CopyToAsync(ms);
                imageBase64 = Convert.ToBase64String(ms.ToArray());
            }

            // Define meal schema
            var schema = new
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
                    HealthScoreOutOf10 = new { type = "integer", minimum = 1, maximum = 10 },
                    MealQuality = new
                    {
                        type = "string",
                        @enum = new[] { "Macro Rich", "Balanced Meal", "High Fat", "Consider Lighter Option", "Dairy Rich" }
                    },
                    OneEmoji = new { type = "string" }
                },
                required = new[] { "isMeal", "ShortMealName", "CaloriesAmount", "Protein", "Carbs", "Fat", "MealQuality", "HealthScoreOutOf10", "OneEmoji" },
                additionalProperties = false
            };



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
                            new { type = "input_text", text = "Estimate Meal Details and return JSON" },
                            new { type = "input_image", image_url = $"data:image/jpeg;base64,{imageBase64}" }
                        }
                    }
                },
                text = new
                {
                    format = new
                    {
                        type = "json_schema",
                        name = "meal_schema",
                        schema = schema,
                        strict = true
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await httpClient.PostAsync(
                "https://api.openai.com/v1/responses",
                new StringContent(json, Encoding.UTF8, "application/json")
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("OpenAI API error for user {UserId}: {Error}", UserId, error);
                return StatusCode((int)response.StatusCode, error);
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            JsonNode docNode = JsonNode.Parse(responseContent);

            // 'output' is an array of messages
            var outputArray = docNode["output"]?.AsArray();
            if (outputArray == null || outputArray.Count == 0)
            {
                _logger.LogError("No output messages from AI for user {UserId}", UserId);
                return StatusCode(500, "No output from AI");
            }

            var assistantMessage = outputArray.LastOrDefault(msg => msg["role"]?.ToString() == "assistant");
            if (assistantMessage == null)
            {
                _logger.LogError("No assistant message found in AI response for user {UserId}", UserId);
                return StatusCode(500, "No assistant message found");
            }

            var contentArray = assistantMessage["content"]?.AsArray();
            if (contentArray == null || contentArray.Count == 0)
            {
                _logger.LogError("No content in assistant message for user {UserId}", UserId);
                return StatusCode(500, "No content in assistant message");
            }

            var textContent = contentArray
            .FirstOrDefault(c => c?["type"]?.ToString() == "output_text")?["text"]?.ToString();

            if (string.IsNullOrEmpty(textContent))
            {
                _logger.LogError("No usable text in assistant message for user {UserId}", UserId);
                return StatusCode(500, "No usable AI response");
            }

            // Save meal to database
            try
            {
                var mealResponse = JsonSerializer.Deserialize<MealResponse>(textContent);
                if (mealResponse == null)
                {
                    _logger.LogError("Deserialized mealResponse is null");
                    return StatusCode(500, "Failed to deserialize meal response");
                }
                
                var meal = new ConsumedMeal
                {
                    UserId = Guid.Parse(UserId),
                    Name = mealResponse.ShortMealName,
                    Calories = mealResponse.CaloriesAmount,
                    Protein = mealResponse.Protein,
                    Carbohydrates = mealResponse.Carbs,
                    Fats = mealResponse.Fat,
                    MealQuality = mealResponse.MealQuality,
                    HealthScoreOutOf10 = mealResponse.HealthScoreOutOf10,
                    CreatedAt = DateTime.UtcNow,
                    OneEmoji = mealResponse.OneEmoji
                };

                await _mealService.AddAsync(meal);
                
                _logger.LogInformation("Meal saved successfully for user {UserId}", UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deserialize and save meal for user {UserId}", UserId);
                return StatusCode(500, "Failed to save meal data");
            }

            // Return the raw JSON response from AI to display on frontend
            try
            {
                //return the validated JSON
                _logger.LogInformation("Returning raw JSON: {Json}", textContent);
                var jsonDocument = JsonDocument.Parse(textContent);
                return Content(textContent, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse AI JSON output for user {UserId}", UserId);
                return StatusCode(500, "Invalid JSON from AI");
            }
        }


        [Authorize]
        [HttpPost("AskChat")]
        public async Task<IActionResult> AskChat([FromBody] ChatRequest chatRequest)
        {
            Console.WriteLine($"AskChat called with question: {chatRequest.Question}");

            if (string.IsNullOrWhiteSpace(chatRequest.Question))
            {
                Console.WriteLine("Empty question received in AskChat");
                return BadRequest("Question cannot be empty.");
            }

            var apiKey = Environment.GetEnvironmentVariable("OpenAI__ApiKey");

            var requestBody = new
            {
                model = "gpt-5-nano-2025-08-07",
                input = new[]
            {
                new
                {
                    role = "system",
                    content = new object[]
                    {
                        new { type = "input_text", text =
                            "You are a concise fitness assistant. All responses must be valid HTML. " +
                            "RULES: " +
                            "1. Output ONLY HTML elements. No Markdown or plain text outside HTML tags. " +
                            "2. You may use: <p>, <b>, <i>, <ul>, <li>, <span>, <table>, <tr>, <td>, and emojis. " +
                            "3. For tables, always use <table><tr><td>… structure. " +
                            "4. When mentioning any food item, wrap ONLY the food name in <food>…</food>. " +
                            "5. When mentioning any exercise or workout name, wrap ONLY the exercise name in <exercise>…</exercise>. " +
                            "6. Keep responses short, simple, and helpful." }
                    }
                },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "input_text", text = chatRequest.Question }
                    }
                }
            }
            };


            var json = JsonSerializer.Serialize(requestBody);

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await httpClient.PostAsync(
                "https://api.openai.com/v1/responses",
                new StringContent(json, Encoding.UTF8, "application/json")
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"OpenAI API error in AskChat: {error}");
                return StatusCode((int)response.StatusCode, error);
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            JsonNode docNode = JsonNode.Parse(responseContent);

            var outputArray = docNode["output"]?.AsArray();
            var assistantMessage = outputArray.LastOrDefault(msg => msg["role"]?.ToString() == "assistant");
            var contentArray = assistantMessage["content"]?.AsArray();
            var textContent = contentArray
                .FirstOrDefault(c => c?["type"]?.ToString() == "output_text")?["text"]?.ToString();

            return Ok(new { Answer = textContent ?? "No response received." });
        }

    }
}