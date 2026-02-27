using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Template;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MailMarketing.Business.Services;

public sealed class TemplateService(AppDbContext dbContext) : ITemplateService
{
    public Task<List<TemplateListItemDto>> GetAllAsync(string? search, bool? isActive, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Templates.AsNoTracking().Include(x => x.CreatedByUser).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Name.ToLower().Contains(normalized) || x.Subject.ToLower().Contains(normalized));
        }

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        return query.OrderByDescending(x => x.Id)
            .Select(x => new TemplateListItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Subject = x.Subject,
                HtmlContent = x.HtmlContent,
                CreatedByUserId = x.CreatedByUserId,
                CreatedByUserName = x.CreatedByUser != null ? x.CreatedByUser.FullName : "-",
                IsActive = x.IsActive,
                CreatedAtUtc = x.CreatedAtUtc
            }).ToListAsync(cancellationToken);
    }

    public Task<List<TemplateListItemDto>> GetActiveAsync(CancellationToken cancellationToken = default)
        => dbContext.Templates.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.Id)
            .Select(x => new TemplateListItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Subject = x.Subject,
                HtmlContent = x.HtmlContent,
                CreatedByUserId = x.CreatedByUserId,
                CreatedByUserName = x.CreatedByUser != null ? x.CreatedByUser.FullName : "-",
                IsActive = x.IsActive,
                CreatedAtUtc = x.CreatedAtUtc
            }).ToListAsync(cancellationToken);

    public async Task<long> CreateAsync(long userId, UpsertTemplateRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.HtmlContent))
        {
            throw new InvalidOperationException("Şablon içeriği boş olamaz.");
        }

        var template = new Template
        {
            Name = request.Name.Trim(),
            Subject = request.Subject.Trim(),
            HtmlContent = request.HtmlContent,
            CreatedByUserId = userId,
            IsActive = true
        };

        dbContext.Templates.Add(template);
        await dbContext.SaveChangesAsync(cancellationToken);
        return template.Id;
    }

    public async Task SetActiveAsync(long id, bool isActive, CancellationToken cancellationToken = default)
    {
        var template = await dbContext.Templates.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new InvalidOperationException("Şablon bulunamadı.");

        template.IsActive = isActive;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var template = await dbContext.Templates.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new InvalidOperationException("Şablon bulunamadı.");

        var hasSendHistory = await dbContext.SendBatches.AnyAsync(x => x.TemplateId == id, cancellationToken);
        if (hasSendHistory)
        {
            throw new InvalidOperationException("Gönderim geçmişinde kullanılan şablon silinemez.");
        }

        dbContext.Templates.Remove(template);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

