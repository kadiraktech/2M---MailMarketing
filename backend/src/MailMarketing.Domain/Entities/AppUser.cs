using MailMarketing.Domain.Enums;

namespace MailMarketing.Domain.Entities;

public sealed class AppUser
{
    public long Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<Template> Templates { get; set; } = new List<Template>();
    public ICollection<SendBatch> Batches { get; set; } = new List<SendBatch>();
}
