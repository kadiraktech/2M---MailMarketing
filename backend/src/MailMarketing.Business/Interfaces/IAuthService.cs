using MailMarketing.Business.Models.Auth;

namespace MailMarketing.Business.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<long> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<bool> VerifyForgotPasswordEmailAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ForgotPasswordResetRequest request, CancellationToken cancellationToken = default);
}
