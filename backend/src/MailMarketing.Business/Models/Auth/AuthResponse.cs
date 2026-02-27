namespace MailMarketing.Business.Models.Auth;

public sealed class AuthResponse
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string Role { get; set; }
}

