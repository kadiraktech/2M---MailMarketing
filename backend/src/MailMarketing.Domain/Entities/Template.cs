namespace MailMarketing.Domain.Entities;

public sealed class Template
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public long CreatedByUserId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser? CreatedByUser { get; set; }
    public ICollection<SendBatch> SendBatches { get; set; } = new List<SendBatch>();
}
