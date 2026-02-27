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
        if (await dbContext.AppUsers.AnyAsync(cancellationToken))
        {
            logger?.LogInformation("Database seeding skipped; users already exist.");
            return;
        }

        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "Admin123!";
        var userPassword = Environment.GetEnvironmentVariable("SEED_USER_PASSWORD") ?? "User123!";

        var hasher = new PasswordHasher<AppUser>();

        var admin = new AppUser
        {
            FullName = "Sistem Yonetici",
            Email = "admin@mailmarketing.local",
            Role = UserRole.Admin,
            IsActive = true
        };
        admin.PasswordHash = hasher.HashPassword(admin, adminPassword);

        var user = new AppUser
        {
            FullName = "Standart Kullanici",
            Email = "user@mailmarketing.local",
            Role = UserRole.User,
            IsActive = true
        };
        user.PasswordHash = hasher.HashPassword(user, userPassword);

        dbContext.AppUsers.AddRange(admin, user);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger?.LogInformation("Database seeded with default users. AdminEmail={AdminEmail}, UserEmail={UserEmail}", admin.Email, user.Email);
    }
}
