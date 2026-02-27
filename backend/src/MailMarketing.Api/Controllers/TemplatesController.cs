using MailMarketing.Api.Extensions;
using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Template;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/templates")]
[Authorize]
public sealed class TemplatesController(ITemplateService templateService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken)
        => Ok(await templateService.GetAllAsync(search, isActive, cancellationToken));

    [HttpGet("active")]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
        => Ok(await templateService.GetActiveAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertTemplateRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var userId = User.GetUserId();
        var id = await templateService.CreateAsync(userId, request, cancellationToken);
        return Ok(new { id });
    }

    [HttpPatch("{id:long}/active")]
    public async Task<IActionResult> SetActive([FromRoute] long id, [FromBody] SetTemplateActiveRequest request, CancellationToken cancellationToken)
    {
        await templateService.SetActiveAsync(id, request.IsActive, cancellationToken);
        return Ok(new { message = "Şablon durumu güncellendi." });
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken)
    {
        await templateService.DeleteAsync(id, cancellationToken);
        return Ok(new { message = "Şablon silindi." });
    }
}

