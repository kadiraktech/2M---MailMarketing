using MailMarketing.Domain.Enums;

namespace MailMarketing.Domain.Entities;

public sealed class SendJobQueue
{
    public long Id { get; set; }
    public long SendItemId { get; set; }
    public QueueJobStatus Status { get; set; } = QueueJobStatus.Pending;
    public int RetryCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime AvailableAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public SendItem? SendItem { get; set; }
}

