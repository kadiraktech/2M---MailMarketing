using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.Auth;

public sealed class ForgotPasswordRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;
}

