using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.Subscriber;
using MailMarketing.Data.Persistence;
using MailMarketing.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MailMarketing.Business.Services;

public sealed class SubscriberService(AppDbContext dbContext) : ISubscriberService
{
    public Task<List<Subscriber>> GetAllAsync(string? email, DateTime? createdFromUtc, DateTime? createdToUtc, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Subscribers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalized = email.Trim().ToLowerInvariant();
            query = query.Where(x => x.Email.Contains(normalized));
        }

        if (createdFromUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc >= createdFromUtc.Value);
        }

        if (createdToUtc.HasValue)
        {
            query = query.Where(x => x.CreatedAtUtc <= createdToUtc.Value);
        }

        return query.OrderByDescending(x => x.Id).ToListAsync(cancellationToken);
    }

    public async Task<long> SubscribeAsync(SubscribeRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await dbContext.Subscribers.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (existing is not null && existing.IsActive)
        {
            throw new InvalidOperationException("Bu e-posta zaten abonelik listesinde.");
        }

        if (existing is not null)
        {
            existing.IsActive = true;
            existing.FullName = request.FullName;
            await dbContext.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var sub = new Subscriber
        {
            Email = email,
            FullName = request.FullName,
            IsActive = true
        };

        dbContext.Subscribers.Add(sub);
        await dbContext.SaveChangesAsync(cancellationToken);
        return sub.Id;
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var subscriber = await dbContext.Subscribers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new InvalidOperationException("Abone bulunamadı.");

        var hasSendHistory = await dbContext.SendItems.AnyAsync(x => x.SubscriberId == id, cancellationToken);
        if (hasSendHistory)
        {
            throw new InvalidOperationException("Gönderim geçmişi olan abone silinemez.");
        }

        dbContext.Subscribers.Remove(subscriber);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
