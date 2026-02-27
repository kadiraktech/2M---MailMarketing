using MailMarketing.Business.Models.Subscriber;
using MailMarketing.Domain.Entities;

namespace MailMarketing.Business.Interfaces;

public interface ISubscriberService
{
    Task<List<Subscriber>> GetAllAsync(string? email, DateTime? createdFromUtc, DateTime? createdToUtc, CancellationToken cancellationToken = default);
    Task<long> SubscribeAsync(SubscribeRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(long id, CancellationToken cancellationToken = default);
}
