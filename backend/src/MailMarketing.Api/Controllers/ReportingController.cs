using MailMarketing.Business.Models.Reporting;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/reporting")]
[Authorize]
public sealed class ReportingController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(new
        {
            totalSubscribers = await dbContext.Subscribers.CountAsync(cancellationToken),
            totalTemplates = await dbContext.Templates.CountAsync(cancellationToken),
            totalBatches = await dbContext.SendBatches.CountAsync(cancellationToken),
            totalSendItems = await dbContext.SendItems.CountAsync(cancellationToken),
            totalSuccess = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Success, cancellationToken),
            totalFailed = await dbContext.SendItems.CountAsync(x => x.Status == SendItemStatus.Failed, cancellationToken)
        });
    }

    [HttpGet("batch-summary")]
    public async Task<IActionResult> GetBatchSummary(CancellationToken cancellationToken)
    {
        return Ok(new
        {
            pending = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Pending, cancellationToken),
            running = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Running, cancellationToken),
            completed = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.Completed, cancellationToken),
            completedWithErrors = await dbContext.SendBatches.CountAsync(x => x.Status == BatchStatus.CompletedWithErrors, cancellationToken)
        });
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems(
        [FromQuery] long? templateId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] string? status,
        [FromQuery] string? email,
        CancellationToken cancellationToken)
    {
        var query = dbContext.SendItems
            .AsNoTracking()
            .Include(x => x.Subscriber)
            .Include(x => x.Batch)
            .ThenInclude(x => x!.Template)
            .AsQueryable();

        if (templateId.HasValue)
        {
            query = query.Where(x => x.Batch != null && x.Batch.TemplateId == templateId.Value);
        }

        if (fromUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc >= fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc <= toUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<SendItemStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(x => x.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            query = query.Where(x => x.Subscriber != null && x.Subscriber.Email.Contains(normalizedEmail));
        }

        var items = await query
            .OrderByDescending(x => x.Id)
            .Take(500)
            .Select(x => new SendItemReportDto
            {
                Id = x.Id,
                SubscriberEmail = x.Subscriber != null ? x.Subscriber.Email : "-",
                SendTimeUtc = x.CreatedAtUtc,
                Status = x.Status.ToString(),
                Message = x.ErrorMessage,
                TemplateId = x.Batch != null ? x.Batch.TemplateId : 0,
                TemplateName = x.Batch != null && x.Batch.Template != null ? x.Batch.Template.Name : "-"
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }
}

