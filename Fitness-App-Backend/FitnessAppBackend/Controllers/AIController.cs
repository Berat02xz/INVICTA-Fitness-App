using FitnessAppBackend.Model.DTO;
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
        public AIController(IHttpClientFactory httpClientFactory, ILogger<AIController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [Authorize]
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpPost("UploadMeal")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMeal([FromForm] string UserId, [FromForm] IFormFile MealImage, [FromForm] string TypeOfUpload)
        {
            _logger.LogInformation("UploadMeal called for user {UserId} with type {TypeOfUpload}", UserId, TypeOfUpload);

            if (MealImage == null || MealImage.Length == 0)
            {
                _logger.LogWarning("No file uploaded for user {UserId}", UserId);
                return BadRequest("No file uploaded.");
            }
            if (TypeOfUpload != "Meal" && TypeOfUpload != "Menu" && TypeOfUpload != "Fridge")
            {
                _logger.LogWarning("Invalid TypeOfUpload {TypeOfUpload} for user {UserId}", TypeOfUpload, UserId);
                return BadRequest("Invalid TypeOfUpload. Must be Meal, Menu, or Fridge.");
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

            //Text Prompt based on upload type
            string textDependingOnCategory = TypeOfUpload switch
            {
                "Meal" => "Estimate Meal Details",
                "Menu" => "Analyze this menu image and provide healthiest meals",
                "Fridge" => "Analyze this fridge image and suggest meals i can make.",
                _ => throw new ArgumentException("Invalid TypeOfUpload")
            };

            // Define JSON schema based on TypeOfUpload
            object schema;

            if (TypeOfUpload == "Meal")
            {
                schema = new
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
                        Label = new
                        {
                            type = "string",
                            @enum = new[] { "HighFat", "BalancedMeal", "MacroRich", "ConsiderLighterOption", "DairyRich" }
                        }
                    },
                    required = new[] { "isMeal", "ShortMealName", "CaloriesAmount", "Protein", "Carbs", "Fat", "Label" },
                    additionalProperties = false

                };
            }
            else if (TypeOfUpload == "Menu")
            {
                schema = new
                {
                    type = "object",
                    properties = new
                    {
                        Meals = new
                        {
                            type = "array",
                            maxItems = 3,
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    MenuName = new { type = "string" },
                                    Calories = new { type = "integer" },
                                    Ingredients = new { type = "array", items = new { type = "string" } }
                                },
                                required = new[] { "MenuName", "Calories", "Ingredients" }
                            }
                        }
                    },
                    required = new[] { "Meals" },
                    additionalProperties = false
                };
            }
            else if (TypeOfUpload == "Fridge")
            {
                schema = new
                {
                    type = "object",
                    properties = new
                    {
                        Meals = new
                        {
                            type = "array",
                            maxItems = 5,
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    Meal = new { type = "string" },
                                    Calories = new { type = "integer" },
                                    Ingredients = new { type = "array", items = new { type = "string" } },
                                    TimeToMake = new { type = "string" }
                                },
                                required = new[] { "Meal", "Calories", "Ingredients", "TimeToMake" },
                                additionalProperties = false
                            }
                        }
                    },
                    required = new[] { "Meals" }
                };
            }
            else
            {
                throw new ArgumentException("Invalid TypeOfUpload");
            }


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
                        new { type = "input_text", text = textDependingOnCategory },
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
            } else
            {
              _logger.LogDebug("Output messages count: {Count} for user {UserId}", outputArray.Count, UserId);
            }

            // Find the assistant message (usually last)
            var assistantMessage = outputArray.LastOrDefault(msg => msg["role"]?.ToString() == "assistant");
            if (assistantMessage == null)
            {
                _logger.LogError("No assistant message found in AI response for user {UserId}", UserId);
                return StatusCode(500, "No assistant message found");
            }
            else
            {
             _logger.LogDebug("Found assistant message for user {UserId}", UserId);
            }
                // Get text content
                var textContent = assistantMessage["content"]?.AsArray()?.FirstOrDefault()?["text"]?.ToString();
            if (string.IsNullOrEmpty(textContent))
            {
                _logger.LogError("No text content in assistant message for user {UserId}", UserId);
                return StatusCode(500, "No text in assistant message");
            }
            else
            {
             _logger.LogDebug("Text content length: {Length} for user {UserId}", textContent.Length, UserId);
            }
                // Parse the JSON schema returned by AI
                JsonNode outputJson;
            try
            {
                outputJson = JsonNode.Parse(textContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse AI JSON output for user {UserId}", UserId);
                return StatusCode(500, "Invalid JSON from AI");
            }

            _logger.LogInformation("AI response for user {UserId}: {OutputJson}", UserId, outputJson);
            return Ok(outputJson);


        }
    }
}