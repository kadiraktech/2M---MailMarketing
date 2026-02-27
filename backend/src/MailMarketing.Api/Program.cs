using System.Text;
using MailMarketing.Api.Background;
using MailMarketing.Api.Extensions;
using MailMarketing.Api.Options;
using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Auth;
using MailMarketing.Business.Services;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Npgsql;
using System.Net.Sockets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection(CorsOptions.SectionName));
builder.Services.Configure<QueueWorkerOptions>(builder.Configuration.GetSection(QueueWorkerOptions.SectionName));

var connStr = builder.Configuration.GetConnectionString("Default")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=mailmarketing;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connStr));

builder.Services.AddSingleton<IAesEncryptionService, AesGcmEncryptionService>();
builder.Services.AddScoped<IEmailSenderService, MailKitEmailSenderService>();
builder.Services.AddScoped<IQueueProcessorService, QueueProcessorService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<PasswordHasher<AppUser>>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISubscriberService, SubscriberService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<ISendBatchService, SendBatchService>();
builder.Services.AddScoped<ISmtpSettingsService, SmtpSettingsService>();
builder.Services.AddScoped<UserService>();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
{
    throw new InvalidOperationException("Jwt:SecretKey zorunludur.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
            NameClaimType = System.Security.Claims.ClaimTypes.Name,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    var cors = builder.Configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>() ?? new CorsOptions();
    options.AddPolicy("DefaultCors", policy =>
    {
        if (cors.AllowedOrigins.Length > 0)
        {
            policy.WithOrigins(cors.AllowedOrigins).AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    });
});

builder.Services.AddHostedService<MailQueueWorker>();
builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

        return new BadRequestObjectResult(new
        {
            message = "Validation failed.",
            traceId = context.HttpContext.TraceIdentifier,
            errors
        });
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "MailMarketing API", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {token}",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    options.AddSecurityDefinition("Bearer", securityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            securityScheme,
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

_ = app.Services.GetRequiredService<IAesEncryptionService>();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    const int maxMigrationAttempts = 8;
    for (var attempt = 1; attempt <= maxMigrationAttempts; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            await DbSeeder.SeedAsync(db, logger);
            break;
        }
        catch (Exception ex) when (attempt < maxMigrationAttempts && IsTransientDatabaseStartup(ex))
        {
            logger.LogWarning(
                ex,
                "Database not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in 3s...",
                attempt,
                maxMigrationAttempts);
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static bool IsTransientDatabaseStartup(Exception ex)
{
    if (ex is NpgsqlException || ex is SocketException)
    {
        return true;
    }

    return ex.InnerException is not null && IsTransientDatabaseStartup(ex.InnerException);
}
