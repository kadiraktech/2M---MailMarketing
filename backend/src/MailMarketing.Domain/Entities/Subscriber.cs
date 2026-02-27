namespace MailMarketing.Domain.Entities;

public sealed class Subscriber
{
    public long Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<SendItem> SendItems { get; set; } = new List<SendItem>();
}
