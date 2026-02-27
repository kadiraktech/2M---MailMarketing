namespace MailMarketing.Business.Models.Reporting;

public sealed class SendItemReportDto
{
    public long Id { get; set; }
    public string SubscriberEmail { get; set; } = string.Empty;
    public DateTime SendTimeUtc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public long TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
}
