using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public sealed class AdminAuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return Ok(await authService.LoginAsync(request, cancellationToken));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        return Ok(new { id = await authService.RegisterAsync(request, cancellationToken) });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var exists = await authService.VerifyForgotPasswordEmailAsync(request, cancellationToken);
        if (!exists)
        {
            throw new InvalidOperationException("Bu e-posta adresi ile kullanıcı bulunamadı.");
        }

        return Ok(new { message = "E-posta doğrulandı.", email = request.Email.Trim().ToLowerInvariant() });
    }

    [HttpPost("forgot-password/reset")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetForgotPassword([FromBody] ForgotPasswordResetRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        await authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Şifreniz güncellendi." });
    }
}
