namespace MailMarketing.Api.Services;

public sealed class WorkerHeartbeatSnapshot
{
    public DateTime? LastHeartbeatUtc { get; init; }
    public DateTime? LastActivityUtc { get; init; }
}
