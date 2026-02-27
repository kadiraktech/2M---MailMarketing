namespace MailMarketing.Business.Models.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "MailMarketing";
    public string Audience { get; set; } = "MailMarketingClient";
    public string SecretKey { get; set; } = string.Empty;
    public int ExpireMinutes { get; set; } = 120;
}

