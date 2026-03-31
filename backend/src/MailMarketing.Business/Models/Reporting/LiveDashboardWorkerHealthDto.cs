namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardWorkerHealthDto : LiveDashboardHealthStatusDto
{
    public DateTime? LastHeartbeatUtc { get; set; }
    public DateTime? LastActivityUtc { get; set; }
}
