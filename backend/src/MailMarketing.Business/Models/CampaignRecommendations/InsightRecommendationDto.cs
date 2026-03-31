using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Models.CampaignRecommendations;

public sealed class InsightRecommendationDto
{
    public string Insight { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public RecommendationSignalCategory? SignalCategory { get; set; }
}
