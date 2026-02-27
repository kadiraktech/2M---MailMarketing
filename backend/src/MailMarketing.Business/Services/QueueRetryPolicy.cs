namespace MailMarketing.Business.Services;

public static class QueueRetryPolicy
{
    public static bool ShouldRetry(bool isTransientError, int retryCount, int maxRetryCount)
        => isTransientError && retryCount <= maxRetryCount;

    public static TimeSpan GetDelay(int retryCount)
        => retryCount switch
        {
            1 => TimeSpan.FromMinutes(1),
            2 => TimeSpan.FromMinutes(5),
            _ => TimeSpan.FromMinutes(15)
        };
}
