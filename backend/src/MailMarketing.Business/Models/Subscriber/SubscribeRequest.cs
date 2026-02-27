using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.Subscriber;

public sealed class SubscribeRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? FullName { get; set; }
}

