namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardHealthDto
{
    public LiveDashboardHealthStatusDto Api { get; set; } = new();
    public LiveDashboardHealthStatusDto Database { get; set; } = new();
    public LiveDashboardHealthStatusDto RabbitMq { get; set; } = new();
    public LiveDashboardWorkerHealthDto Worker { get; set; } = new();
}
