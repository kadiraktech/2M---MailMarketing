using System.Security.Claims;
using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public sealed class SettingsController(
    ISmtpSettingsService smtpSettingsService,
    IAesEncryptionService aesEncryptionService,
    IEmailSenderService emailSenderService) : ControllerBase
{
    [HttpGet("smtp")]
    public async Task<IActionResult> GetSmtp(CancellationToken cancellationToken)
    {
        var smtp = await smtpSettingsService.GetDefaultAsync(cancellationToken);
        if (smtp is null) return Ok(null);

        return Ok(new
        {
            id = smtp.Id,
            host = smtp.Host,
            port = smtp.Port,
            username = smtp.Username,
            fromEmail = smtp.FromEmail,
            useSsl = smtp.UseSsl
        });
    }

    [HttpPost("smtp")]
    public async Task<IActionResult> UpsertSmtp([FromBody] UpsertSmtpSettingRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var encrypted = aesEncryptionService.Encrypt(request.Password);
        var id = await smtpSettingsService.UpsertDefaultAsync(request, encrypted, cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("smtp/test")]
    [HttpPost("/api/settings/smtp/test")]
    public async Task<IActionResult> TestSmtp([FromBody] SmtpTestRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var smtp = await smtpSettingsService.GetDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("Önce SMTP ayarlarını kaydetmelisiniz.");

        var toEmail = request.ToEmail?.Trim();
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            toEmail = User.FindFirstValue(ClaimTypes.Email);
        }

        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new InvalidOperationException("Test e-postası için hedef adres bulunamadı.");
        }

        var smtpResolved = new Domain.Entities.SmtpSetting
        {
            Host = smtp.Host,
            Port = smtp.Port,
            Username = smtp.Username,
            PasswordEncrypted = aesEncryptionService.Decrypt(smtp.PasswordEncrypted),
            FromEmail = smtp.FromEmail,
            UseSsl = smtp.UseSsl
        };

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(10));

        await emailSenderService.SendAsync(
            smtpResolved,
            toEmail,
            "MailMarketing SMTP Test",
            "<p>SMTP bağlantınız başarıyla çalışıyor.</p>",
            timeoutCts.Token);

        return Ok(new { message = $"Test e-postası gönderildi: {toEmail}" });
    }
}

