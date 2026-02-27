using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Auth;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MailMarketing.Business.Services;

public sealed class AuthService(
    AppDbContext dbContext,
    IJwtTokenService jwtTokenService,
    PasswordHasher<AppUser> passwordHasher,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Email == email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Kullanıcı bulunamadı.");

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Kullanıcı pasif durumda.");
        }

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Şifre hatalı.");
        }

        logger.LogInformation("User login successful. UserId={UserId}, Email={Email}", user.Id, user.Email);

        return new AuthResponse
        {
            Token = jwtTokenService.CreateToken(user),
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString()
        };
    }

    public async Task<long> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        ValidatePasswordPolicy(request.Password);

        if (await dbContext.AppUsers.AnyAsync(x => x.Email == email, cancellationToken))
        {
            throw new InvalidOperationException("Bu e-posta zaten kayıtlı.");
        }

        var user = new AppUser
        {
            FullName = request.FullName,
            Email = email,
            Role = request.Role,
            IsActive = true,
            PasswordHash = string.Empty
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        dbContext.AppUsers.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User registration successful. UserId={UserId}, Email={Email}, Role={Role}", user.Id, user.Email, user.Role);

        return user.Id;
    }

    public async Task<bool> VerifyForgotPasswordEmailAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        return await dbContext.AppUsers.AnyAsync(x => x.Email == email, cancellationToken);
    }

    public async Task ResetPasswordAsync(ForgotPasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new InvalidOperationException("Yeni şifre ve tekrarı eşleşmiyor.");
        }

        ValidatePasswordPolicy(request.NewPassword);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.AppUsers.FirstOrDefaultAsync(x => x.Email == email, cancellationToken)
            ?? throw new InvalidOperationException("Kullanıcı bulunamadı.");

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
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
