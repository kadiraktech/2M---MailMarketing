using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Services;

public static class QueueClaimPlanner
{
    public static IReadOnlyList<long> SelectPendingJobIds(IEnumerable<SendJobQueue> jobs, DateTime nowUtc, int batchSize)
    {
        return jobs
            .Where(x => x.Status == QueueJobStatus.Pending && x.AvailableAtUtc <= nowUtc)
            .OrderBy(x => x.Id)
            .Take(batchSize)
            .Select(x => x.Id)
            .ToList();
    }
}
