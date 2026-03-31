namespace MailMarketing.Api.Services;

public sealed class WorkerHeartbeatTracker : IWorkerHeartbeatTracker
{
    private readonly object _sync = new();
    private DateTime? _lastHeartbeatUtc;
    private DateTime? _lastActivityUtc;

    public void MarkHeartbeat()
    {
        lock (_sync)
        {
            _lastHeartbeatUtc = DateTime.UtcNow;
        }
    }

    public void MarkActivity()
    {
        lock (_sync)
        {
            var nowUtc = DateTime.UtcNow;
            _lastHeartbeatUtc = nowUtc;
            _lastActivityUtc = nowUtc;
        }
    }

    public WorkerHeartbeatSnapshot GetSnapshot()
    {
        lock (_sync)
        {
            return new WorkerHeartbeatSnapshot
            {
                LastHeartbeatUtc = _lastHeartbeatUtc,
                LastActivityUtc = _lastActivityUtc
            };
        }
    }
}
