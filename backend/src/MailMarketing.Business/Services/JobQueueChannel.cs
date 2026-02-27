using System.Threading.Channels;
using MailMarketing.Business.Interfaces;

namespace MailMarketing.Business.Services;

public sealed class JobQueueChannel : IJobQueueChannel
{
    private readonly Channel<long> _channel = Channel.CreateUnbounded<long>();

    public ValueTask WriteAsync(long jobId, CancellationToken cancellationToken = default)
        => _channel.Writer.WriteAsync(jobId, cancellationToken);

    public IAsyncEnumerable<long> ReadAllAsync(CancellationToken cancellationToken = default)
        => _channel.Reader.ReadAllAsync(cancellationToken);
}

