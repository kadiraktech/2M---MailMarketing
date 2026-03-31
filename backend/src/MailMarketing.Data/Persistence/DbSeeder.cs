using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MailMarketing.Data.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext dbContext,
        ILogger? logger = null,
        CancellationToken cancellationToken = default)
    {
        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "Admin123!";
        var userPassword = Environment.GetEnvironmentVariable("SEED_USER_PASSWORD") ?? "User123!";
        var hasher = new PasswordHasher<AppUser>();
        var admin = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Email == "admin@mailmarketing.local", cancellationToken);
        if (admin is null)
        {
            admin = new AppUser
            {
                FullName = "Sistem Yonetici",
                Email = "admin@mailmarketing.local",
                Role = UserRole.Admin,
                IsActive = true
            };
            admin.PasswordHash = hasher.HashPassword(admin, adminPassword);
            dbContext.AppUsers.Add(admin);
        }

        var user = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Email == "user@mailmarketing.local", cancellationToken);
        if (user is null)
        {
            user = new AppUser
            {
                FullName = "Standart Kullanici",
                Email = "user@mailmarketing.local",
                Role = UserRole.User,
                IsActive = true
            };
            user.PasswordHash = hasher.HashPassword(user, userPassword);
            dbContext.AppUsers.Add(user);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger?.LogInformation("Database seeded with default users. AdminEmail={AdminEmail}, UserEmail={UserEmail}", admin.Email, user.Email);

        var demoSeedEnabled = Environment.GetEnvironmentVariable("DEMO_SEED_ENABLED");
        if (!string.Equals(demoSeedEnabled, "false", StringComparison.OrdinalIgnoreCase))
        {
            await DemoDataSeeder.SeedAsync(dbContext, admin.Id, logger, cancellationToken);
        }
    }
}
