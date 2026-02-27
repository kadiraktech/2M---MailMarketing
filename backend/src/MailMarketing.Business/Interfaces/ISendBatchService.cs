using MailMarketing.Business.Models.Send;

namespace MailMarketing.Business.Interfaces;

public interface ISendBatchService
{
    Task<long> CreateBatchAsync(long createdByUserId, CreateSendBatchRequest request, CancellationToken cancellationToken = default);
}
