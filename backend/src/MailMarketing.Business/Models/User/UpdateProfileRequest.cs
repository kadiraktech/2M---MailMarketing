using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.User;

public sealed class UpdateProfileRequest
{
    [Required(ErrorMessage = "Ad Soyad zorunludur.")]
    [MaxLength(200, ErrorMessage = "Ad Soyad en fazla 200 karakter olabilir.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;

    [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string? NewPassword { get; set; }

    public string? ConfirmNewPassword { get; set; }
}
