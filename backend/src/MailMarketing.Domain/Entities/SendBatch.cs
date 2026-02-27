using MailMarketing.Domain.Enums;

namespace MailMarketing.Domain.Entities;

public sealed class SendBatch
{
    public long Id { get; set; }
    public long TemplateId { get; set; }
    public long CreatedByUserId { get; set; }
    public string SubjectSnapshot { get; set; } = string.Empty;
    public BatchStatus Status { get; set; } = BatchStatus.Pending;
    public int TotalCount { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Template? Template { get; set; }
    public AppUser? CreatedByUser { get; set; }
    public ICollection<SendItem> Items { get; set; } = new List<SendItem>();
}
