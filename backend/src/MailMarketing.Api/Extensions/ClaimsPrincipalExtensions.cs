using System.Security.Claims;

namespace MailMarketing.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static long GetUserId(this ClaimsPrincipal principal)
    {
        var raw = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Kullanıcı bilgisi bulunamadı.");

        if (!long.TryParse(raw, out var userId))
        {
            throw new InvalidOperationException("Geçersiz kullanıcı kimliği.");
        }

        return userId;
    }
}

