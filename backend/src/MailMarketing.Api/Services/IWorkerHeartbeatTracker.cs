namespace MailMarketing.Api.Services;

public interface IWorkerHeartbeatTracker
{
    void MarkHeartbeat();
    void MarkActivity();
    WorkerHeartbeatSnapshot GetSnapshot();
}
