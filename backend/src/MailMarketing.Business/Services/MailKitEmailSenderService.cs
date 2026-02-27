using MailKit.Net.Smtp;
using MailKit.Security;
using MailMarketing.Business.Interfaces;
using MailMarketing.Domain.Entities;
using MimeKit;

namespace MailMarketing.Business.Services;

public sealed class MailKitEmailSenderService : IEmailSenderService
{
    public async Task SendAsync(SmtpSetting smtpSetting, string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(smtpSetting.FromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        var secureSocket = smtpSetting.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;

        await client.ConnectAsync(smtpSetting.Host, smtpSetting.Port, secureSocket, cancellationToken);
        await client.AuthenticateAsync(smtpSetting.Username, smtpSetting.PasswordEncrypted, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}

