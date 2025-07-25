namespace FitnessAppBackend.Middleware
{
    public static class SwaggerSetup
    {
        public static void UseSwaggerSetup(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
        }
    }
}
