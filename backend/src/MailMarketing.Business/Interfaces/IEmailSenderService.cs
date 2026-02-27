using MailMarketing.Domain.Entities;

namespace MailMarketing.Business.Interfaces;

public interface IEmailSenderService
{
    Task SendAsync(SmtpSetting smtpSetting, string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}

