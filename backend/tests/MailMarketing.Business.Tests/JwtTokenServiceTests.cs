using MailMarketing.Business.Models.Auth;
using MailMarketing.Business.Services;
using MailMarketing.Domain.Entities;
using MailMarketing.Domain.Enums;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using Xunit;

namespace MailMarketing.Business.Tests;

public sealed class JwtTokenServiceTests
{
    [Fact]
    public void CreateToken_ShouldContainIdentityClaims()
    {
        var options = Options.Create(new JwtOptions
        {
            Issuer = "issuer",
            Audience = "audience",
            SecretKey = "super_secret_key_that_is_long_enough_123456",
            ExpireMinutes = 30
        });

        var service = new JwtTokenService(options);
        var user = new AppUser
        {
            Id = 7,
            FullName = "Test User",
            Email = "test@example.com",
            PasswordHash = "hash",
            Role = UserRole.Admin
        };

        var token = service.CreateToken(user);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "7");
        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier && c.Value == "7");
        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "Admin");
    }
}
