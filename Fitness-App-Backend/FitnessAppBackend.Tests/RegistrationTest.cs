using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Buffers.Text;
using System.Text;

public class RegistrationTest : IClassFixture<TestContext>
{
    private readonly TestContext _context;

    public RegistrationTest(TestContext context)
    {
        _context = context;
    }

    [Fact]
    public async Task RegisterUser_ShouldReturnSuccess()
    {
        var newUser = new
        {
            Name = "testuser",
            Email = "testberuser@example.com",
            Password = "TestPassword123!"
        };

        var json = JsonConvert.SerializeObject(newUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _context.Client.PostAsync("/api/User/register", content);
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        var jsonObj = JsonConvert.DeserializeObject<dynamic>(responseContent);
        _context.Token = jsonObj.token;

        Assert.False(string.IsNullOrEmpty(_context.Token));
    }

    [Fact]
    public async Task UploadOnboardingAnswers()
    {
        Assert.False(string.IsNullOrEmpty(_context.Token), "Token not set from registration test.");

        _context.Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _context.Token);

        var tokenPayload = _context.Token.Split('.')[1];
        var jsonBytes = Base64UrlDecode(tokenPayload);
        var jsonString = Encoding.UTF8.GetString(jsonBytes);
        var jsonObj = JObject.Parse(jsonString);
        var userId = jsonObj["sub"]?.ToString();

        var onboardingAnswers = new
        {
            userId = Guid.Parse(userId),
            answers = new[]
            {
                new { question = "What is your fitness goal?", answer = "Build muscle" },
                new { question = "How many days per week do you exercise?", answer = "3" },
                new { question = "Do you have any allergies?", answer = "No" }
            }
        };


        var json = JsonConvert.SerializeObject(onboardingAnswers);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _context.Client.PostAsync("/api/User/UploadOnboarding", content);

        response.EnsureSuccessStatusCode();

        
        var responseContent = await response.Content.ReadAsStringAsync();
        Assert.Equal("Onboarding answers uploaded successfully.", responseContent);

    }



    //Get All Onboarding Answers by UserId
    [Fact]
    public async Task GetOnboardingAnswersByUserId()
    {
        Assert.False(string.IsNullOrEmpty(_context.Token), "Token not set from registration test.");
        _context.Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _context.Token);
        var tokenPayload = _context.Token.Split('.')[1];
        var jsonBytes = Base64UrlDecode(tokenPayload);
        var jsonString = Encoding.UTF8.GetString(jsonBytes);
        var jsonObj = JObject.Parse(jsonString);
        var userId = jsonObj["sub"]?.ToString();
        var response = await _context.Client.GetAsync($"/api/User/GetOnboardingAnswers/{userId}");
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        //print the response content
        Console.WriteLine(responseContent);
        //log so we can see the response content in output 
        var jsonResponse = JObject.Parse(responseContent);
        Console.WriteLine(jsonResponse.ToString(Formatting.Indented));
        Assert.NotEmpty(responseContent);
    }



    private byte[] Base64UrlDecode(string tokenPayload)
    {
        string base64 = tokenPayload.Replace('-', '+').Replace('_', '/');
        switch (base64.Length % 4)
        {
            case 2: base64 += "=="; break;
            case 3: base64 += "="; break;
        }
        return Convert.FromBase64String(base64);
    }
}
