using MailMarketing.Api.Extensions;
using MailMarketing.Business.Models.User;
using MailMarketing.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/profile")]
[Authorize]
public sealed class ProfileController(UserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        return Ok(await userService.GetProfileAsync(userId, cancellationToken));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.GetUserId();
        await userService.UpdateProfileAsync(userId, request, cancellationToken);
        return Ok(new { message = "Profil güncellendi." });
    }
}

