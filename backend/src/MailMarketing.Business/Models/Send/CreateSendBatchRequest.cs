using System.ComponentModel.DataAnnotations;

namespace MailMarketing.Business.Models.Send;

public sealed class CreateSendBatchRequest : IValidatableObject
{
    [Range(1, long.MaxValue, ErrorMessage = "TemplateId zorunludur.")]
    public long TemplateId { get; set; }

    public List<long> SubscriberIds { get; set; } = new();

    public bool UseAllActiveSubscribers { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!UseAllActiveSubscribers && SubscriberIds.Count == 0)
        {
            yield return new ValidationResult("En az bir abone seçmelisiniz.", new[] { nameof(SubscriberIds) });
        }
    }
}
