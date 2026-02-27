namespace MailMarketing.Business.Interfaces;

public interface IQueueProcessorService
{
    Task<IReadOnlyList<long>> ClaimPendingJobIdsAsync(int batchSize, CancellationToken cancellationToken = default);
    Task ProcessJobAsync(long jobId, int emailTimeoutSeconds, int maxRetryCount, CancellationToken cancellationToken = default);
}

