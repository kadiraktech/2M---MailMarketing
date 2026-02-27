using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.Template;

public sealed class UpsertTemplateRequest
{
    [Required(ErrorMessage = "Şablon adı zorunludur.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Konu zorunludur.")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "İçerik zorunludur.")]
    public string HtmlContent { get; set; } = string.Empty;
}

