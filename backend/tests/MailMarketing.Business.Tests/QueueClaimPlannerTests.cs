using MailMarketing.Business.Services;
using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Xunit;

namespace MailMarketing.Business.Tests;

public sealed class QueueClaimPlannerTests
{
    [Fact]
    public void SelectPendingJobIds_Should_SelectOnlyDuePendingJobsByOrder()
    {
        var now = new DateTime(2026, 2, 27, 10, 0, 0, DateTimeKind.Utc);
        var jobs = new List<SendJobQueue>
        {
            new() { Id = 7, Status = QueueJobStatus.Pending, AvailableAtUtc = now.AddMinutes(1) },
            new() { Id = 3, Status = QueueJobStatus.Pending, AvailableAtUtc = now.AddMinutes(-1) },
            new() { Id = 5, Status = QueueJobStatus.Processing, AvailableAtUtc = now.AddMinutes(-2) },
            new() { Id = 4, Status = QueueJobStatus.Pending, AvailableAtUtc = now.AddMinutes(-3) }
        };

        var selected = QueueClaimPlanner.SelectPendingJobIds(jobs, now, 2);

        Assert.Equal(new long[] { 3, 4 }, selected);
    }
}
