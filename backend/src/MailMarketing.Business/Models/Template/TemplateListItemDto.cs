namespace MailMarketing.Business.Models.Template;

public sealed class TemplateListItemDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public long CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
