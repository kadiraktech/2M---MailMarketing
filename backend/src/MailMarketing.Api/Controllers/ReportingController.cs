using MailMarketing.Api.Options;
using MailMarketing.Api.Services;
using MailMarketing.Business.Models.Reporting;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/reporting")]
[Authorize]
public sealed class ReportingController(
    AppDbContext dbContext,
    IWorkerHeartbeatTracker workerHeartbeatTracker,
    IOptions<QueueWorkerOptions> queueWorkerOptions,
    IConfiguration configuration) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(new
        {
            totalSubscribers = await dbContext.Subscribers.CountAsync(cancellationToken),
            totalTemplates = await dbContext.Templates.CountAsync(cancellationToken),
            totalBatches = await dbContext.SendBatches.CountAsync(cancellationToken),
            totalSendItems = await dbContext.SendItems.CountAsync(cancellationToken),
            totalSuccess = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Success, cancellationToken),
            totalFailed = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Failed, cancellationToken)
        });
    }

    [HttpGet("batch-summary")]
    public async Task<IActionResult> GetBatchSummary(CancellationToken cancellationToken)
    {
        return Ok(new
        {
            pending = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Pending, cancellationToken),
            running = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Running, cancellationToken),
            completed = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Completed, cancellationToken),
            completedWithErrors = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.CompletedWithErrors, cancellationToken)
        });
    }

    [HttpGet("live-dashboard")]
    public async Task<ActionResult<LiveDashboardResponseDto>> GetLiveDashboard(CancellationToken cancellationToken)
    {
        var generatedAtUtc = DateTime.UtcNow;

        var totalQueuedJobs = await dbContext.SendJobQueues.CountAsync(x => x.Status == QueueJobStatus.Pending, cancellationToken);
        var processingJobs = await dbContext.SendJobQueues.CountAsync(x => x.Status == QueueJobStatus.Processing, cancellationToken);
        var retryPendingJobs = await dbContext.SendJobQueues.CountAsync(
            x => x.Status == QueueJobStatus.Pending && x.RetryCount > 0,
            cancellationToken);

        var activeSendOperations = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Running, cancellationToken);
        var successfulSendCount = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Success, cancellationToken);
        var failedSendCount = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Failed, cancellationToken);

        var recentActivity = await dbContext.SendItems
            .AsNoTracking()
            .Include(x => x.Subscriber)
            .Include(x => x.Batch)
            .ThenInclude(x => x!.Template)
            .OrderByDescending(x => x.LastTriedAtUtc ?? x.CreatedAtUtc)
            .ThenByDescending(x => x.Id)
            .Take(15)
            .Select(x => new LiveDashboardRecentActivityDto
            {
                SendItemId = x.Id,
                BatchId = x.BatchId,
                TemplateId = x.Batch != null ? x.Batch.TemplateId : 0,
                TemplateName = x.Batch != null && x.Batch.Template != null ? x.Batch.Template.Name : "-",
                SubscriberEmail = x.Subscriber != null ? x.Subscriber.Email : "-",
                Status = x.Status.ToString(),
                EventTimeUtc = x.LastTriedAtUtc ?? x.CreatedAtUtc,
                RetryCount = x.RetryCount,
                Message = x.ErrorMessage
            })
            .ToListAsync(cancellationToken);

        var response = new LiveDashboardResponseDto
        {
            GeneratedAtUtc = generatedAtUtc,
            Queue = new LiveDashboardQueueDto
            {
                TotalQueuedJobs = totalQueuedJobs,
                ProcessingJobs = processingJobs,
                RetryPendingJobs = retryPendingJobs
            },
            Sending = new LiveDashboardSendingDto
            {
                ActiveSendOperations = activeSendOperations,
                SuccessfulSendCount = successfulSendCount,
                FailedSendCount = failedSendCount
            },
            RecentActivity = recentActivity,
            Health = new LiveDashboardHealthDto
            {
                Api = new LiveDashboardHealthStatusDto
                {
                    Status = "Healthy",
                    Message = "API is serving the live dashboard endpoint."
                },
                Database = await GetDatabaseHealthAsync(cancellationToken),
                RabbitMq = GetRabbitMqHealth(),
                Worker = GetWorkerHealth()
            }
        };

        return Ok(response);
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems(
        [FromQuery] long? templateId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] string? status,
        [FromQuery] string? email,
        CancellationToken cancellationToken)
    {
        var query = dbContext.SendItems
            .AsNoTracking()
            .Include(x => x.Subscriber)
            .Include(x => x.Batch)
            .ThenInclude(x => x!.Template)
            .AsQueryable();

        if (templateId.HasValue)
        {
            query = query.Where(x => x.Batch != null && x.Batch.TemplateId == templateId.Value);
        }

        if (fromUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc >= fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc <= toUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<SendItemStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(x => x.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            query = query.Where(x => x.Subscriber != null && x.Subscriber.Email.Contains(normalizedEmail));
        }

        var items = await query
            .OrderByDescending(x => x.Id)
            .Take(500)
            .Select(x => new SendItemReportDto
            {
                Id = x.Id,
                SubscriberEmail = x.Subscriber != null ? x.Subscriber.Email : "-",
                SendTimeUtc = x.CreatedAtUtc,
                Status = x.Status.ToString(),
                Message = x.ErrorMessage,
                TemplateId = x.Batch != null ? x.Batch.TemplateId : 0,
                TemplateName = x.Batch != null && x.Batch.Template != null ? x.Batch.Template.Name : "-"
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    private async Task<LiveDashboardHealthStatusDto> GetDatabaseHealthAsync(CancellationToken cancellationToken)
    {
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
            return new LiveDashboardHealthStatusDto
            {
                Status = canConnect ? "Healthy" : "Unhealthy",
                Message = canConnect
                    ? "Database connectivity check succeeded."
                    : "Database connectivity check failed."
            };
        }
        catch (Exception ex)
        {
            return new LiveDashboardHealthStatusDto
            {
                Status = "Unhealthy",
                Message = ex.Message
            };
        }
    }

    private LiveDashboardHealthStatusDto GetRabbitMqHealth()
    {
        var rabbitHost = configuration.GetSection("RabbitMQ")["Host"];
        if (string.IsNullOrWhiteSpace(rabbitHost))
        {
            return new LiveDashboardHealthStatusDto
            {
                Status = "NotConfigured",
                Message = "RabbitMQ is not configured."
            };
        }

        return new LiveDashboardHealthStatusDto
        {
            Status = "Unused",
            Message = "RabbitMQ is configured but not integrated in the active application flow."
        };
    }

    private LiveDashboardWorkerHealthDto GetWorkerHealth()
    {
        var snapshot = workerHeartbeatTracker.GetSnapshot();
        if (!snapshot.LastHeartbeatUtc.HasValue)
        {
            return new LiveDashboardWorkerHealthDto
            {
                Status = "Unknown",
                Message = "Worker heartbeat has not been observed yet."
            };
        }

        var staleAfterSeconds = Math.Max(queueWorkerOptions.Value.PollIntervalSeconds * 3, 10);
        var isHealthy = DateTime.UtcNow - snapshot.LastHeartbeatUtc.Value <= TimeSpan.FromSeconds(staleAfterSeconds);

        return new LiveDashboardWorkerHealthDto
        {
            Status = isHealthy ? "Healthy" : "Unhealthy",
            Message = isHealthy
                ? "Worker heartbeat is current."
                : "Worker heartbeat is stale.",
            LastHeartbeatUtc = snapshot.LastHeartbeatUtc,
            LastActivityUtc = snapshot.LastActivityUtc
        };
    }
}
