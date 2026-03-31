namespace MailMarketing.Business.Models.CampaignRecommendations;

public sealed class CampaignRecommendationContextDto
{
    public int? AvailableTemplateCount { get; set; }
    public int? TotalSubscriberCount { get; set; }
    public int? ActiveSubscriberCount { get; set; }
    public int? InactiveSubscriberCount { get; set; }
    public int? RecentSuccessfulSendCount { get; set; }
    public int? RecentFailedSendCount { get; set; }
}
