namespace MailMarketing.Domain.Entities;

public sealed class SmtpSetting
{
    public long Id { get; set; }
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordEncrypted { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
    public bool IsDefault { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
