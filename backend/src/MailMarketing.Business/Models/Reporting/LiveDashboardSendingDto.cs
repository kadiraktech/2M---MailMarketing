namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardSendingDto
{
    public int ActiveSendOperations { get; set; }
    public int SuccessfulSendCount { get; set; }
    public int FailedSendCount { get; set; }
}
