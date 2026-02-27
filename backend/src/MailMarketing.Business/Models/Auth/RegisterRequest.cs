using System.ComponentModel.DataAnnotations;
using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Models.Auth;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "Ad Soyad zorunludur.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.User;
}

