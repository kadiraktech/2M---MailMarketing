using MailMarketing.Domain.Enums;

namespace MailMarketing.Domain.Entities;

public sealed class SendItem
{
    public long Id { get; set; }
    public long BatchId { get; set; }
    public long SubscriberId { get; set; }
    public SendItemStatus Status { get; set; } = SendItemStatus.Pending;
    public int RetryCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? LastTriedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public SendBatch? Batch { get; set; }
    public Subscriber? Subscriber { get; set; }
    public ICollection<SendJobQueue> QueueEntries { get; set; } = new List<SendJobQueue>();
}

