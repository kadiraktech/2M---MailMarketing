using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.Smtp;

public sealed class SmtpTestRequest
{
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string? ToEmail { get; set; }
}
