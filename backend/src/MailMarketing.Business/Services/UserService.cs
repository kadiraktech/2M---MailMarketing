using MailMarketing.Business.Models.User;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MailMarketing.Business.Services;

public sealed class UserService(AppDbContext dbContext, PasswordHasher<AppUser> passwordHasher)
{
    public Task<List<UserSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => dbContext.AppUsers.AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Select(x => new UserSummaryDto
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email,
                Role = x.Role.ToString(),
                IsActive = x.IsActive,
                CreatedAtUtc = x.CreatedAtUtc
            }).ToListAsync(cancellationToken);

    public async Task<object> GetProfileAsync(long userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.AppUsers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException("Kullanıcı bulunamadı.");

        return new
        {
            id = user.Id,
            email = user.Email,
            fullName = user.FullName,
            role = user.Role.ToString(),
            isActive = user.IsActive,
            createdAtUtc = user.CreatedAtUtc
        };
    }

    public async Task UpdateProfileAsync(long userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(request.NewPassword) && request.NewPassword != request.ConfirmNewPassword)
        {
            throw new InvalidOperationException("Yeni şifre ve tekrarı eşleşmiyor.");
        }

        var user = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException("Kullanıcı bulunamadı.");

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var duplicateEmail = await dbContext.AppUsers.AnyAsync(x => x.Id != userId && x.Email == normalizedEmail, cancellationToken);
        if (duplicateEmail)
        {
            throw new InvalidOperationException("Bu e-posta başka bir kullanıcıda kayıtlı.");
        }

        user.FullName = request.FullName.Trim();
        user.Email = normalizedEmail;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            ValidatePasswordPolicy(request.NewPassword);
            user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task SetActiveAsync(long id, bool isActive, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new InvalidOperationException("Kullanıcı bulunamadı.");

        user.IsActive = isActive;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static void ValidatePasswordPolicy(string password)
    {
        var hasUpper = password.Any(char.IsUpper);
        var hasLower = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);

        if (password.Length < 8 || !hasUpper || !hasLower || !hasDigit)
        {
            throw new InvalidOperationException("Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir.");
        }
    }
}

