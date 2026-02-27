using MailMarketing.Business.Models.User;
using MailMarketing.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public sealed class UsersController(UserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
        => Ok(await userService.GetAllAsync(cancellationToken));

    [HttpPatch("{id:long}/active")]
    public async Task<IActionResult> SetActive([FromRoute] long id, [FromBody] SetUserActiveRequest request, CancellationToken cancellationToken)
    {
        await userService.SetActiveAsync(id, request.IsActive, cancellationToken);
        return Ok(new { message = "Kullanıcı durumu güncellendi." });
    }
}

