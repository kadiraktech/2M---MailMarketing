using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Subscriber;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/subscribe")]
public sealed class SubscribeController(ISubscriberService subscriberService) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var id = await subscriberService.SubscribeAsync(request, cancellationToken);
        return Ok(new { id, message = "Abonelik kaydedildi." });
    }
}
