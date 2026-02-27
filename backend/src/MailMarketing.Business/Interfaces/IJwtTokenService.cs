using MailMarketing.Domain.Entities;

namespace MailMarketing.Business.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(AppUser user);
}

