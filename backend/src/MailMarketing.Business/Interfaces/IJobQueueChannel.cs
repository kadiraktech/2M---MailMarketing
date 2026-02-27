namespace MailMarketing.Business.Interfaces;

public interface IJobQueueChannel
{
    ValueTask WriteAsync(long jobId, CancellationToken cancellationToken = default);
    IAsyncEnumerable<long> ReadAllAsync(CancellationToken cancellationToken = default);
}

