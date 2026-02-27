using MailMarketing.Business.Models.Template;

namespace MailMarketing.Business.Interfaces;

public interface ITemplateService
{
    Task<List<TemplateListItemDto>> GetAllAsync(string? search, bool? isActive, CancellationToken cancellationToken = default);
    Task<List<TemplateListItemDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<long> CreateAsync(long userId, UpsertTemplateRequest request, CancellationToken cancellationToken = default);
    Task SetActiveAsync(long id, bool isActive, CancellationToken cancellationToken = default);
    Task DeleteAsync(long id, CancellationToken cancellationToken = default);
}

