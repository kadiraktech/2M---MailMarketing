namespace MailMarketing.Business.Models.Reporting;

public sealed class LiveDashboardResponseDto
{
    public DateTime GeneratedAtUtc { get; set; }
    public LiveDashboardQueueDto Queue { get; set; } = new();
    public LiveDashboardSendingDto Sending { get; set; } = new();
    public IReadOnlyList<LiveDashboardRecentActivityDto> RecentActivity { get; set; } = Array.Empty<LiveDashboardRecentActivityDto>();
    public LiveDashboardHealthDto Health { get; set; } = new();
}
