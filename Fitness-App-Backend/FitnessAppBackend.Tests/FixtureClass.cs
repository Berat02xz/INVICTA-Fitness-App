public class TestContext
{
    public string Token { get; set; }
    public HttpClient Client { get; }

    public TestContext()
    {
        Client = new HttpClient
        {
            BaseAddress = new Uri("https://a0e8-92-53-30-239.ngrok-free.app/")
        };
    }
}
