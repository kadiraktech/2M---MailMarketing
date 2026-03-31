using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Models.CampaignRecommendations;

public sealed class CampaignRecommendationResponseDto
{
    public CampaignGoal Goal { get; set; }
    public DateTime GeneratedAtUtc { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderType { get; set; } = string.Empty;
    public string ProviderDisplayName { get; set; } = string.Empty;
    public string GenerationMode { get; set; } = string.Empty;
    public string ExplanationStyle { get; set; } = string.Empty;
    public string RecommendationVersion { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public IReadOnlyList<SubjectRecommendationDto> SubjectSuggestions { get; set; } = Array.Empty<SubjectRecommendationDto>();
    public IReadOnlyList<AudienceRecommendationDto> AudienceSuggestions { get; set; } = Array.Empty<AudienceRecommendationDto>();
    public IReadOnlyList<SendTimeRecommendationDto> SendTimeSuggestions { get; set; } = Array.Empty<SendTimeRecommendationDto>();
    public IReadOnlyList<InsightRecommendationDto> Insights { get; set; } = Array.Empty<InsightRecommendationDto>();
}
