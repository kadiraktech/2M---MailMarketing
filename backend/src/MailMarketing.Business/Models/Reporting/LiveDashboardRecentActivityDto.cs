namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardRecentActivityDto
{
    public long SendItemId { get; set; }
    public long BatchId { get; set; }
    public long TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string SubscriberEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EventTimeUtc { get; set; }
    public int RetryCount { get; set; }
    public string? Message { get; set; }
}
