using MailMarketing.Api.Options;
using MailMarketing.Business.Interfaces;
using Microsoft.Extensions.Options;

namespace MailMarketing.Api.Background;

public sealed class MailQueueWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<QueueWorkerOptions> options,
    ILogger<MailQueueWorker> logger) : BackgroundService
{
    private readonly QueueWorkerOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "Mail queue worker started. Poll={PollSec}s, Concurrency={Concurrency}, Timeout={TimeoutSec}s, MaxRetry={MaxRetry}",
            _options.PollIntervalSeconds,
            _options.MaxConcurrentJobs,
            _options.EmailTimeoutSeconds,
            _options.MaxRetryCount);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var claimScope = scopeFactory.CreateScope();
                var processor = claimScope.ServiceProvider.GetRequiredService<IQueueProcessorService>();

                var claimedJobIds = await processor.ClaimPendingJobIdsAsync(_options.MaxConcurrentJobs, stoppingToken);
                if (claimedJobIds.Count == 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(_options.PollIntervalSeconds), stoppingToken);
                    continue;
                }

                logger.LogInformation("Claimed {Count} queue job(s): {Ids}", claimedJobIds.Count, string.Join(',', claimedJobIds));

                await Parallel.ForEachAsync(
                    claimedJobIds,
                    new ParallelOptions
                    {
                        MaxDegreeOfParallelism = _options.MaxConcurrentJobs,
                        CancellationToken = stoppingToken
                    },
                    async (jobId, token) =>
                    {
                        try
                        {
                            using var processScope = scopeFactory.CreateScope();
                            var scopedProcessor = processScope.ServiceProvider.GetRequiredService<IQueueProcessorService>();
                            await scopedProcessor.ProcessJobAsync(jobId, _options.EmailTimeoutSeconds, _options.MaxRetryCount, token);
                        }
                        catch (Exception ex) when (!token.IsCancellationRequested)
                        {
                            logger.LogError(ex, "Queue job processing failed for JobId={JobId}", jobId);
                        }
                    });
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Worker loop failed. Retrying after {PollSec}s", _options.PollIntervalSeconds);
                await Task.Delay(TimeSpan.FromSeconds(_options.PollIntervalSeconds), stoppingToken);
            }
        }
    }
}

