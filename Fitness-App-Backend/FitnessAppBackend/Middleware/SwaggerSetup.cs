namespace FitnessAppBackend.Middleware
{
    public static class SwaggerSetup
    {
        public static void UseSwaggerSetup(this WebApplication app)
        {
           app.UseSwagger();
           app.UseSwaggerUI();
        }
    }
}
