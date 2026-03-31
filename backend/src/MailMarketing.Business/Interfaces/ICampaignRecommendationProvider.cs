using MailMarketing.Business.Models.CampaignRecommendations;

namespace MailMarketing.Business.Interfaces;

public interface ICampaignRecommendationProvider
{
    Task<CampaignRecommendationResponseDto> RecommendAsync(
        CampaignRecommendationRequest request,
        CancellationToken cancellationToken = default);
}
