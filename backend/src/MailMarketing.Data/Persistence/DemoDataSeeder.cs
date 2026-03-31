using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MailMarketing.Data.Persistence;

internal static class DemoDataSeeder
{
    private const string DemoEmailDomain = "demo.mailmarketing.test";
    private static readonly DateTime StoryStartUtc = new(2026, 3, 22, 9, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime StoryEndUtc = new(2026, 3, 31, 15, 30, 0, DateTimeKind.Utc);

    public static async Task SeedAsync(
        AppDbContext dbContext,
        long createdByUserId,
        ILogger? logger = null,
        CancellationToken cancellationToken = default)
    {
        if (await HasExistingDemoDataAsync(dbContext, cancellationToken))
        {
            logger?.LogInformation("Demo data seeding skipped; marker data already exists.");
            return;
        }

        var subscribers = BuildSubscribers();
        dbContext.Subscribers.AddRange(subscribers);
        await dbContext.SaveChangesAsync(cancellationToken);

        var templates = BuildTemplates(createdByUserId);
        dbContext.Templates.AddRange(templates);
        await dbContext.SaveChangesAsync(cancellationToken);

        var activeSubscribers = subscribers.Where(x => x.IsActive).ToArray();
        var inactiveSubscribers = subscribers.Where(x => !x.IsActive).ToArray();

        var batchPlans = BuildBatchPlans(templates);
        var queueEntries = new List<SendJobQueue>();
        var sendItems = new List<SendItem>();

        foreach (var plan in batchPlans)
        {
            var batch = new SendBatch
            {
                TemplateId = plan.Template.Id,
                CreatedByUserId = createdByUserId,
                SubjectSnapshot = plan.SubjectSnapshot,
                Status = plan.Status,
                TotalCount = plan.TotalCount,
                SuccessCount = plan.SuccessCount,
                FailedCount = plan.FailedCount,
                CreatedAtUtc = plan.CreatedAtUtc
            };

            dbContext.SendBatches.Add(batch);
            await dbContext.SaveChangesAsync(cancellationToken);

            var selectedSubscribers = SelectSubscribersForPlan(plan, activeSubscribers, inactiveSubscribers, subscribers);
            var itemIndex = 0;

            foreach (var subscriber in selectedSubscribers.Take(plan.SuccessCount))
            {
                var createdAt = plan.CreatedAtUtc.AddMinutes(itemIndex * 3);
                var triedAt = createdAt.AddMinutes(9);
                var retryCount = plan.SuccessRetryIndices.Contains(itemIndex) ? 1 : 0;
                var item = new SendItem
                {
                    BatchId = batch.Id,
                    SubscriberId = subscriber.Id,
                    Status = SendItemStatus.Success,
                    RetryCount = retryCount,
                    CreatedAtUtc = createdAt,
                    LastTriedAtUtc = triedAt
                };

                dbContext.SendItems.Add(item);
                await dbContext.SaveChangesAsync(cancellationToken);

                sendItems.Add(item);
                queueEntries.Add(new SendJobQueue
                {
                    SendItemId = item.Id,
                    Status = QueueJobStatus.Success,
                    RetryCount = retryCount,
                    AvailableAtUtc = createdAt,
                    ProcessedAtUtc = triedAt,
                    CreatedAtUtc = createdAt
                });

                itemIndex++;
            }

            foreach (var subscriber in selectedSubscribers.Skip(plan.SuccessCount).Take(plan.FailedCount))
            {
                var failIndex = itemIndex - plan.SuccessCount;
                var createdAt = plan.CreatedAtUtc.AddMinutes(itemIndex * 3);
                var triedAt = createdAt.AddMinutes(11);
                var errorMessage = FailureMessages[failIndex % FailureMessages.Length];
                var retryCount = plan.FailedRetryCounts[failIndex % plan.FailedRetryCounts.Count];
                var item = new SendItem
                {
                    BatchId = batch.Id,
                    SubscriberId = subscriber.Id,
                    Status = SendItemStatus.Failed,
                    RetryCount = retryCount,
                    ErrorMessage = errorMessage,
                    CreatedAtUtc = createdAt,
                    LastTriedAtUtc = triedAt
                };

                dbContext.SendItems.Add(item);
                await dbContext.SaveChangesAsync(cancellationToken);

                sendItems.Add(item);
                queueEntries.Add(new SendJobQueue
                {
                    SendItemId = item.Id,
                    Status = QueueJobStatus.Fail,
                    RetryCount = retryCount,
                    ErrorMessage = errorMessage,
                    AvailableAtUtc = createdAt,
                    ProcessedAtUtc = triedAt,
                    CreatedAtUtc = createdAt
                });

                itemIndex++;
            }

            foreach (var unfinished in plan.UnfinishedItems)
            {
                var subscriber = selectedSubscribers[itemIndex];
                var item = new SendItem
                {
                    BatchId = batch.Id,
                    SubscriberId = subscriber.Id,
                    Status = unfinished.ItemStatus,
                    RetryCount = unfinished.RetryCount,
                    ErrorMessage = unfinished.ErrorMessage,
                    CreatedAtUtc = unfinished.CreatedAtUtc,
                    LastTriedAtUtc = unfinished.LastTriedAtUtc
                };

                dbContext.SendItems.Add(item);
                await dbContext.SaveChangesAsync(cancellationToken);

                sendItems.Add(item);
                queueEntries.Add(new SendJobQueue
                {
                    SendItemId = item.Id,
                    Status = unfinished.QueueStatus,
                    RetryCount = unfinished.RetryCount,
                    ErrorMessage = unfinished.ErrorMessage,
                    AvailableAtUtc = unfinished.AvailableAtUtc,
                    ProcessedAtUtc = unfinished.ProcessedAtUtc,
                    CreatedAtUtc = unfinished.CreatedAtUtc
                });

                itemIndex++;
            }
        }

        dbContext.SendJobQueues.AddRange(queueEntries);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger?.LogInformation(
            "Demo data seeded successfully. Subscribers={SubscriberCount}, Templates={TemplateCount}, SendItems={SendItemCount}, QueueEntries={QueueCount}, StoryStartUtc={StoryStartUtc}, StoryEndUtc={StoryEndUtc}",
            subscribers.Count,
            templates.Count,
            sendItems.Count,
            queueEntries.Count,
            StoryStartUtc,
            StoryEndUtc);
    }

    private static async Task<bool> HasExistingDemoDataAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        return await dbContext.Subscribers.AnyAsync(x => x.Email.EndsWith("@" + DemoEmailDomain), cancellationToken)
            || await dbContext.Templates.AnyAsync(x => x.Name.StartsWith("Demo - "), cancellationToken)
            || await dbContext.SendBatches.AnyAsync(x => x.SubjectSnapshot.StartsWith("[Demo]"), cancellationToken);
    }

    private static List<Subscriber> BuildSubscribers()
    {
        string[] firstNames =
        [
            "Aylin", "Mert", "Selin", "Kaan", "Deniz", "Ece", "Bora", "Derya", "Kerem", "Zeynep",
            "Arda", "Lina", "Emre", "Naz", "Can", "Elif", "Baris", "Asli", "Ozan", "Melis"
        ];

        string[] lastNames =
        [
            "Demir", "Yildiz", "Aydin", "Kaya", "Arslan", "Sahin", "Kilic", "Celik", "Aksoy", "Kurt"
        ];

        var subscribers = new List<Subscriber>();
        for (var i = 0; i < 90; i++)
        {
            var firstName = firstNames[i % firstNames.Length];
            var lastName = lastNames[(i / firstNames.Length + i) % lastNames.Length];
            subscribers.Add(new Subscriber
            {
                FullName = $"{firstName} {lastName}",
                Email = $"{NormalizeName(firstName)}.{NormalizeName(lastName)}.{i + 1:D2}@{DemoEmailDomain}",
                IsActive = i % 5 != 0,
                CreatedAtUtc = new DateTime(2026, 2, 6, 10, 0, 0, DateTimeKind.Utc).AddHours(i * 8)
            });
        }

        return subscribers;
    }

    private static List<Template> BuildTemplates(long createdByUserId)
    {
        return
        [
            CreateTemplate("Demo - Nova CRM Product Launch", "Nova CRM ile ekip performansini tek ekranda yonetin", createdByUserId, new DateTime(2026, 3, 20, 10, 0, 0, DateTimeKind.Utc), "Yeni urun lansmani"),
            CreateTemplate("Demo - Spring Discount Push", "Yuzde 20 indirimle bahar kampanyasi basladi", createdByUserId, new DateTime(2026, 3, 21, 9, 30, 0, DateTimeKind.Utc), "Indirim kampanyasi"),
            CreateTemplate("Demo - Weekly Insights Newsletter", "Bu haftanin pazarlama ozetleri ve ekip notlari", createdByUserId, new DateTime(2026, 3, 23, 8, 45, 0, DateTimeKind.Utc), "Haftalik bulten"),
            CreateTemplate("Demo - Win Back Reactivation", "Sizi yeniden aramizda gormek istiyoruz", createdByUserId, new DateTime(2026, 3, 24, 11, 0, 0, DateTimeKind.Utc), "Yeniden kazanma"),
            CreateTemplate("Demo - Platform Notice", "Planli bakim ve yeni yayin takvimi", createdByUserId, new DateTime(2026, 3, 28, 12, 15, 0, DateTimeKind.Utc), "Ozel duyuru"),
            CreateTemplate("Demo - Final Launch Countdown", "Lansmana saatler kaldi: ekip hazirlik ozeti", createdByUserId, new DateTime(2026, 3, 30, 14, 0, 0, DateTimeKind.Utc), "Lansman geri sayim")
        ];
    }

    private static Template CreateTemplate(string name, string subject, long createdByUserId, DateTime createdAtUtc, string heading)
    {
        return new Template
        {
            Name = name,
            Subject = subject,
            HtmlContent = $"""
                <html>
                  <body style="font-family: Arial, sans-serif; color: #1f2937;">
                    <h1>{heading}</h1>
                    <p>Bu icerik demo amacli uretilmistir ve ekran goruntuleri icin anlamli bir kampanya akisina destek olur.</p>
                    <p>Urun, teklif veya duyuru anlatimi gercek kullanici verisi icermez.</p>
                  </body>
                </html>
                """,
            IsActive = true,
            CreatedByUserId = createdByUserId,
            CreatedAtUtc = createdAtUtc
        };
    }

    private static List<BatchPlan> BuildBatchPlans(IReadOnlyList<Template> templates)
    {
        return
        [
            new BatchPlan(templates[0], "[Demo] Nova CRM smoke launch", BatchStatus.Completed, 18, 16, 2, new DateTime(2026, 3, 22, 9, 15, 0, DateTimeKind.Utc), SubscriberSelectionMode.EngagedBroad, 0),
            new BatchPlan(templates[2], "[Demo] Weekly newsletter QA", BatchStatus.Completed, 14, 13, 1, new DateTime(2026, 3, 23, 10, 30, 0, DateTimeKind.Utc), SubscriberSelectionMode.ActiveCore, 12),
            new BatchPlan(templates[1], "[Demo] Spring discount segment test", BatchStatus.CompletedWithErrors, 22, 18, 4, new DateTime(2026, 3, 25, 11, 0, 0, DateTimeKind.Utc), SubscriberSelectionMode.ActiveCore, 24),
            new BatchPlan(templates[3], "[Demo] Re-engagement wave one", BatchStatus.CompletedWithErrors, 16, 11, 5, new DateTime(2026, 3, 26, 13, 20, 0, DateTimeKind.Utc), SubscriberSelectionMode.ColdAudience, 8),
            new BatchPlan(templates[0], "[Demo] Launch value messaging validation", BatchStatus.Completed, 20, 19, 1, new DateTime(2026, 3, 27, 14, 10, 0, DateTimeKind.Utc), SubscriberSelectionMode.EngagedBroad, 33),
            new BatchPlan(templates[2], "[Demo] March newsletter send", BatchStatus.Completed, 24, 23, 1, new DateTime(2026, 3, 29, 9, 40, 0, DateTimeKind.Utc), SubscriberSelectionMode.BroadMix, 45),
            new BatchPlan(templates[4], "[Demo] Platform notice rollout", BatchStatus.CompletedWithErrors, 12, 10, 2, new DateTime(2026, 3, 30, 16, 0, 0, DateTimeKind.Utc), SubscriberSelectionMode.ActiveCore, 57),
            new BatchPlan(
                templates[5],
                "[Demo] Final launch preparation",
                BatchStatus.Running,
                10,
                6,
                1,
                new DateTime(2026, 3, 31, 9, 5, 0, DateTimeKind.Utc),
                SubscriberSelectionMode.EngagedBroad,
                61,
                [
                    new UnfinishedItemPlan(
                        SendItemStatus.Processing,
                        QueueJobStatus.Processing,
                        new DateTime(2026, 3, 31, 9, 58, 0, DateTimeKind.Utc),
                        new DateTime(2026, 3, 31, 10, 9, 0, DateTimeKind.Utc),
                        new DateTime(2026, 3, 31, 10, 12, 0, DateTimeKind.Utc)),
                    new UnfinishedItemPlan(
                        SendItemStatus.Pending,
                        QueueJobStatus.Pending,
                        new DateTime(2026, 3, 31, 10, 5, 0, DateTimeKind.Utc),
                        DateTime.UtcNow.AddMinutes(18),
                        null,
                        1,
                        "Gecici SMTP timeout sonrasi yeniden denenecek."),
                    new UnfinishedItemPlan(
                        SendItemStatus.Pending,
                        QueueJobStatus.Pending,
                        new DateTime(2026, 3, 31, 10, 8, 0, DateTimeKind.Utc),
                        DateTime.UtcNow.AddMinutes(36),
                        null)
                ])
        ];
    }

    private static IReadOnlyList<Subscriber> SelectSubscribersForPlan(
        BatchPlan plan,
        IReadOnlyList<Subscriber> activeSubscribers,
        IReadOnlyList<Subscriber> inactiveSubscribers,
        IReadOnlyList<Subscriber> allSubscribers)
    {
        return plan.SelectionMode switch
        {
            SubscriberSelectionMode.ActiveCore => TakeLoop(activeSubscribers, plan.StartOffset, plan.TotalCount),
            SubscriberSelectionMode.ColdAudience => TakeLoop(inactiveSubscribers, plan.StartOffset % inactiveSubscribers.Count, plan.TotalCount),
            SubscriberSelectionMode.BroadMix => TakeLoop(allSubscribers, plan.StartOffset, plan.TotalCount),
            _ => TakeLoop(activeSubscribers, plan.StartOffset, plan.TotalCount)
        };
    }

    private static IReadOnlyList<Subscriber> TakeLoop(IReadOnlyList<Subscriber> source, int startOffset, int count)
    {
        var result = new List<Subscriber>(count);
        for (var i = 0; i < count; i++)
        {
            result.Add(source[(startOffset + i) % source.Count]);
        }

        return result;
    }

    private static string NormalizeName(string value)
        => value.ToLowerInvariant();

    private static readonly string[] FailureMessages =
    [
        "Mailbox temporarily unavailable.",
        "SMTP timeout while waiting for server response.",
        "Remote server rejected the recipient address.",
        "Connection dropped during delivery attempt."
    ];

    private enum SubscriberSelectionMode
    {
        EngagedBroad,
        ActiveCore,
        ColdAudience,
        BroadMix
    }

    private sealed record BatchPlan(
        Template Template,
        string SubjectSnapshot,
        BatchStatus Status,
        int TotalCount,
        int SuccessCount,
        int FailedCount,
        DateTime CreatedAtUtc,
        SubscriberSelectionMode SelectionMode,
        int StartOffset,
        IReadOnlyList<UnfinishedItemPlan>? UnfinishedItemPlans = null)
    {
        public IReadOnlyList<int> SuccessRetryIndices { get; } = Status == BatchStatus.CompletedWithErrors
            ? [1, 5]
            : [2];

        public IReadOnlyList<int> FailedRetryCounts { get; } = [1, 2, 1];
        public IReadOnlyList<UnfinishedItemPlan> UnfinishedItems { get; } = UnfinishedItemPlans ?? [];
    }

    private sealed record UnfinishedItemPlan(
        SendItemStatus ItemStatus,
        QueueJobStatus QueueStatus,
        DateTime CreatedAtUtc,
        DateTime AvailableAtUtc,
        DateTime? LastTriedAtUtc,
        int RetryCount = 0,
        string? ErrorMessage = null,
        DateTime? ProcessedAtUtc = null);
}
