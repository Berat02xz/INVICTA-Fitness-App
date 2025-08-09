using FitnessAppBackend.Data;
using FitnessAppBackend.Repository;
using FitnessAppBackend.Repository.Implementations;
using FitnessAppBackend.Service;
using FitnessAppBackend.Service.Implementations;
using FitnessAppBackend.Middleware;
using Microsoft.EntityFrameworkCore;
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.MaxDepth = 64;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "FitnessAppBackend API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
builder.Configuration.AddEnvironmentVariables();

// Configure PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Cors
builder.Services.AddCorsPolicy();

builder.Services.AddAuthorization();

// Add custom services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IUserInformationService, UserInformationService>();
builder.Services.AddScoped<IUserInformationRepository, UserInformationRepository>();
builder.Services.AddScoped<IConsumedMealService, ConsumedMealService>();
builder.Services.AddScoped<IConsumedMealRepository, ConsumedMealRepository>();

var app = builder.Build();

// Middleware pipeline
app.UseSwaggerSetup();
app.UseHttpsRedirection();
app.UseCorsPolicy();
app.UseJwtAuthentication();

app.MapControllers();
app.Run();
