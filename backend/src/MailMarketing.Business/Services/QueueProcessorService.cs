using MailKit;
using MailKit.Net.Smtp;
using MailMarketing.Business.Interfaces;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Net.Sockets;

namespace MailMarketing.Business.Services;

public sealed class QueueProcessorService(
    AppDbContext dbContext,
    IAesEncryptionService aes,
    IEmailSenderService emailSenderService,
    ILogger<QueueProcessorService> logger) : IQueueProcessorService
{
    public async Task<IReadOnlyList<long>> ClaimPendingJobIdsAsync(int batchSize, CancellationToken cancellationToken = default)
    {
        if (batchSize <= 0)
        {
            return Array.Empty<long>();
        }

        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var nowUtc = DateTime.UtcNow;
        var pendingStatus = QueueJobStatus.Pending.ToString();
        var candidates = await dbContext.SendJobQueues
            .FromSqlInterpolated($@"
                SELECT *
                FROM send_job_queue
                WHERE ""Status"" = {pendingStatus}
                  AND ""AvailableAtUtc"" <= {nowUtc}
                ORDER BY ""Id""
                FOR UPDATE SKIP LOCKED
                LIMIT {batchSize}")
            .ToListAsync(cancellationToken);

        var selectedIds = QueueClaimPlanner.SelectPendingJobIds(candidates, nowUtc, batchSize);
        if (selectedIds.Count == 0)
        {
            await tx.CommitAsync(cancellationToken);
            return selectedIds;
        }

        foreach (var job in candidates)
        {
            if (!selectedIds.Contains(job.Id))
            {
                continue;
            }

            job.Status = QueueJobStatus.Processing;
            job.ErrorMessage = null;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return selectedIds;
    }

    public async Task ProcessJobAsync(long jobId, int emailTimeoutSeconds, int maxRetryCount, CancellationToken cancellationToken = default)
    {
        var job = await dbContext.SendJobQueues
            .Include(j => j.SendItem)!
                .ThenInclude(i => i!.Subscriber)
            .Include(j => j.SendItem)!
                .ThenInclude(i => i!.Batch)!
                    .ThenInclude(b => b!.Template)
            .FirstOrDefaultAsync(x => x.Id == jobId, cancellationToken);

        if (job is null || job.SendItem is null || job.SendItem.Subscriber is null || job.SendItem.Batch is null || job.SendItem.Batch.Template is null)
        {
            logger.LogWarning("Queue job skipped due to missing references. JobId={JobId}", jobId);
            return;
        }

        job.SendItem.Status = SendItemStatus.Processing;
        job.SendItem.LastTriedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var smtp = await dbContext.SmtpSettings.FirstOrDefaultAsync(x => x.IsDefault, cancellationToken)
                ?? throw new InvalidOperationException("Varsayılan SMTP ayarı bulunamadı.");

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(emailTimeoutSeconds));

            var smtpPwd = aes.Decrypt(smtp.PasswordEncrypted);
            var smtpResolved = new Domain.Entities.SmtpSetting
            {
                Host = smtp.Host,
                Port = smtp.Port,
                Username = smtp.Username,
                PasswordEncrypted = smtpPwd,
                FromEmail = smtp.FromEmail,
                UseSsl = smtp.UseSsl
            };

            await emailSenderService.SendAsync(
                smtpResolved,
                job.SendItem.Subscriber.Email,
                job.SendItem.Batch.SubjectSnapshot,
                job.SendItem.Batch.Template.HtmlContent,
                timeoutCts.Token);

            job.Status = QueueJobStatus.Success;
            job.SendItem.Status = SendItemStatus.Success;
            job.SendItem.ErrorMessage = null;
            job.ErrorMessage = null;
            job.ProcessedAtUtc = DateTime.UtcNow;

            logger.LogInformation("Queue job succeeded. JobId={JobId}, SendItemId={SendItemId}", job.Id, job.SendItemId);
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            job.RetryCount += 1;
            job.SendItem.RetryCount = job.RetryCount;
            job.ErrorMessage = ex.Message;
            job.SendItem.ErrorMessage = ex.Message;

            var isTransient = IsTransient(ex);
            if (QueueRetryPolicy.ShouldRetry(isTransient, job.RetryCount, maxRetryCount))
            {
                var delay = QueueRetryPolicy.GetDelay(job.RetryCount);
                job.Status = QueueJobStatus.Pending;
                job.AvailableAtUtc = DateTime.UtcNow.Add(delay);
                job.SendItem.Status = SendItemStatus.Pending;
                job.ProcessedAtUtc = null;

                logger.LogWarning(
                    ex,
                    "Queue job failed and scheduled for retry. JobId={JobId}, RetryCount={RetryCount}, Delay={DelayMinutes}dk",
                    job.Id,
                    job.RetryCount,
                    delay.TotalMinutes);
            }
            else
            {
                job.Status = QueueJobStatus.Fail;
                job.SendItem.Status = SendItemStatus.Failed;
                job.ProcessedAtUtc = DateTime.UtcNow;

                logger.LogError(ex, "Queue job failed permanently. JobId={JobId}", job.Id);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await RecalculateBatchAsync(job.SendItem.BatchId, cancellationToken);
    }

    private async Task RecalculateBatchAsync(long batchId, CancellationToken cancellationToken)
    {
        var batchItems = await dbContext.SendItems.Where(x => x.BatchId == batchId).ToListAsync(cancellationToken);
        var batch = await dbContext.SendBatches.FirstAsync(x => x.Id == batchId, cancellationToken);

        batch.SuccessCount = batchItems.Count(x => x.Status == SendItemStatus.Success);
        batch.FailedCount = batchItems.Count(x => x.Status == SendItemStatus.Failed);

        var pendingCount = batchItems.Count(x => x.Status == SendItemStatus.Pending || x.Status == SendItemStatus.Processing);
        batch.Status = pendingCount > 0
            ? BatchStatus.Running
            : batch.FailedCount > 0 ? BatchStatus.CompletedWithErrors : BatchStatus.Completed;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static bool IsTransient(Exception ex)
    {
        var root = ex.GetBaseException();

        if (root is TimeoutException || root is SocketException || root is NpgsqlException || root is IOException)
        {
            return true;
        }

        if (ex is SmtpProtocolException)
        {
            return true;
        }

        if (ex is SmtpCommandException smtpCommandException)
        {
            var code = (int)smtpCommandException.StatusCode;
            return code is >= 400 and < 500;
        }

        if (ex is OperationCanceledException)
        {
            return true;
        }

        return false;
    }
}

