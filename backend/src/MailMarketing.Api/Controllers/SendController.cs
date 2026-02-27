using MailMarketing.Api.Extensions;
using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Send;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/send")]
[Authorize]
public sealed class SendController(ISendBatchService sendBatchService) : ControllerBase
{
    [HttpPost("batch")]
    public async Task<IActionResult> CreateBatch([FromBody] CreateSendBatchRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var userId = User.GetUserId();
        var batchId = await sendBatchService.CreateBatchAsync(userId, request, cancellationToken);
        return Ok(new { batchId });
    }
}
