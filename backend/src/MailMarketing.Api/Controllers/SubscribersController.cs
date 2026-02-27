using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Subscriber;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/subscribers")]
[Authorize]
public sealed class SubscribersController(ISubscriberService subscriberService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? email, [FromQuery] DateTime? createdFromUtc, [FromQuery] DateTime? createdToUtc, CancellationToken cancellationToken)
        => Ok(await subscriberService.GetAllAsync(email, createdFromUtc, createdToUtc, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SubscribeRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var id = await subscriberService.SubscribeAsync(request, cancellationToken);
        return Ok(new { id });
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken)
    {
        await subscriberService.DeleteAsync(id, cancellationToken);
        return Ok(new { message = "Abone silindi." });
    }
}

