using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Send;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MailMarketing.Business.Services;

public sealed class SendBatchService(AppDbContext dbContext, ILogger<SendBatchService> logger) : ISendBatchService
{
    public async Task<long> CreateBatchAsync(long createdByUserId, CreateSendBatchRequest request, CancellationToken cancellationToken = default)
    {
        var template = await dbContext.Templates.FirstOrDefaultAsync(x => x.Id == request.TemplateId, cancellationToken)
            ?? throw new InvalidOperationException("Şablon bulunamadı.");
        if (!template.IsActive)
        {
            throw new InvalidOperationException("Pasif şablon ile gönderim yapılamaz.");
        }

        if (!request.UseAllActiveSubscribers && request.SubscriberIds.Count == 0)
        {
            throw new InvalidOperationException("En az bir abone seçmelisiniz.");
        }

        IQueryable<Subscriber> subscriberQuery = dbContext.Subscribers.Where(x => x.IsActive);
        if (!request.UseAllActiveSubscribers && request.SubscriberIds.Count > 0)
        {
            subscriberQuery = subscriberQuery.Where(x => request.SubscriberIds.Contains(x.Id));
        }

        var subscribers = await subscriberQuery.ToListAsync(cancellationToken);
        if (subscribers.Count == 0)
        {
            throw new InvalidOperationException("Gönderim için abone bulunamadı.");
        }

        var batch = new SendBatch
        {
            TemplateId = template.Id,
            CreatedByUserId = createdByUserId,
            SubjectSnapshot = template.Subject,
            Status = BatchStatus.Pending,
            TotalCount = subscribers.Count
        };

        dbContext.SendBatches.Add(batch);
        await dbContext.SaveChangesAsync(cancellationToken);

        var items = subscribers.Select(s => new SendItem
        {
            BatchId = batch.Id,
            SubscriberId = s.Id,
            Status = SendItemStatus.Pending
        }).ToList();

        dbContext.SendItems.AddRange(items);
        await dbContext.SaveChangesAsync(cancellationToken);

        var jobs = items.Select(i => new SendJobQueue
        {
            SendItemId = i.Id,
            Status = QueueJobStatus.Pending,
            RetryCount = 0,
            AvailableAtUtc = DateTime.UtcNow
        }).ToList();

        dbContext.SendJobQueues.AddRange(jobs);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Send batch created. BatchId={BatchId}, CreatedBy={CreatedBy}, RecipientCount={RecipientCount}, TemplateId={TemplateId}",
            batch.Id,
            createdByUserId,
            subscribers.Count,
            template.Id);

        return batch.Id;
    }
}
