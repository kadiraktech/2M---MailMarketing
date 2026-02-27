using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Smtp;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MailMarketing.Business.Services;

public sealed class SmtpSettingsService(AppDbContext dbContext, ILogger<SmtpSettingsService> logger) : ISmtpSettingsService
{
    public Task<SmtpSetting?> GetDefaultAsync(CancellationToken cancellationToken = default)
        => dbContext.SmtpSettings.AsNoTracking().FirstOrDefaultAsync(x => x.IsDefault, cancellationToken);

    public async Task<long> UpsertDefaultAsync(UpsertSmtpSettingRequest request, string encryptedPassword, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.SmtpSettings.FirstOrDefaultAsync(x => x.IsDefault, cancellationToken);
        if (existing is null)
        {
            var setting = new SmtpSetting
            {
                Host = request.Host,
                Port = request.Port,
                Username = request.Username,
                PasswordEncrypted = encryptedPassword,
                FromEmail = request.FromEmail,
                UseSsl = request.UseSsl,
                IsDefault = true
            };

            dbContext.SmtpSettings.Add(setting);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Default SMTP setting created. SmtpSettingId={SmtpSettingId}, Host={Host}", setting.Id, setting.Host);
            return setting.Id;
        }

        existing.Host = request.Host;
        existing.Port = request.Port;
        existing.Username = request.Username;
        existing.PasswordEncrypted = encryptedPassword;
        existing.FromEmail = request.FromEmail;
        existing.UseSsl = request.UseSsl;
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Default SMTP setting updated. SmtpSettingId={SmtpSettingId}, Host={Host}", existing.Id, existing.Host);

        return existing.Id;
    }
}
