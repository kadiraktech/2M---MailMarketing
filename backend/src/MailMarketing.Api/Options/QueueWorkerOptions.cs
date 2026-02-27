namespace MailMarketing.Api.Options;

public sealed class QueueWorkerOptions
{
    public const string SectionName = "QueueWorker";

    public int PollIntervalSeconds { get; set; } = 3;
    public int MaxConcurrentJobs { get; set; } = 5;
    public int EmailTimeoutSeconds { get; set; } = 30;
    public int MaxRetryCount { get; set; } = 3;
}
