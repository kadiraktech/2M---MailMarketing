using MailMarketing.Business.Models.Smtp;
using MailMarketing.Domain.Entities;

namespace MailMarketing.Business.Interfaces;

public interface ISmtpSettingsService
{
    Task<SmtpSetting?> GetDefaultAsync(CancellationToken cancellationToken = default);
    Task<long> UpsertDefaultAsync(UpsertSmtpSettingRequest request, string encryptedPassword, CancellationToken cancellationToken = default);
}
