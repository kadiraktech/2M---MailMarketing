namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardQueueDto
{
    public int TotalQueuedJobs { get; set; }
    public int ProcessingJobs { get; set; }
    public int RetryPendingJobs { get; set; }
}
