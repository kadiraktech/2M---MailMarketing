using MailMarketing.Business.Models.CampaignRecommendations;
using MailMarketing.Business.Services;
using MailMarketing.Domain.Enums;
using Xunit;

namespace MailMarketing.Business.Tests;

public sealed class RuleBasedCampaignRecommendationProviderTests
{
    private readonly RuleBasedCampaignRecommendationProvider _provider = new();

    [Fact]
    public async Task RecommendAsync_ProductLaunch_ReturnsRuleBasedRecommendations()
    {
        var response = await _provider.RecommendAsync(new CampaignRecommendationRequest
        {
            Goal = CampaignGoal.ProductLaunch
        });

        Assert.Equal(CampaignGoal.ProductLaunch, response.Goal);
        Assert.Equal("RuleBasedCampaignRecommendationProvider", response.Provider);
        Assert.Equal("RuleBased", response.ProviderType);
        Assert.Equal("Rule-based Campaign Recommendation Engine", response.ProviderDisplayName);
        Assert.Equal("DeterministicRules", response.GenerationMode);
        Assert.Equal("ProductGuidance", response.ExplanationStyle);
        Assert.Equal("v1.1", response.RecommendationVersion);
        Assert.Contains("Recommended starting plan:", response.Summary, StringComparison.Ordinal);
        Assert.NotEmpty(response.SubjectSuggestions);
        Assert.NotEmpty(response.AudienceSuggestions);
        Assert.NotEmpty(response.SendTimeSuggestions);
        Assert.NotEmpty(response.Insights);
        Assert.Contains(response.SubjectSuggestions, x => x.Subject.Contains("Introducing", StringComparison.OrdinalIgnoreCase)
            || x.Subject.Contains("Meet", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(response.Insights, x => x.SignalCategory == RecommendationSignalCategory.MessagingQuality);
    }

    [Fact]
    public async Task RecommendAsync_ReEngagement_ReturnsCautionaryInsight()
    {
        var response = await _provider.RecommendAsync(new CampaignRecommendationRequest
        {
            Goal = CampaignGoal.ReEngagement,
            Context = new CampaignRecommendationContextDto
            {
                InactiveSubscriberCount = 1000,
                ActiveSubscriberCount = 100
            }
        });

        Assert.Equal(CampaignGoal.ReEngagement, response.Goal);
        Assert.Contains(response.AudienceSuggestions, x => x.Segment.Contains("Inactive", StringComparison.OrdinalIgnoreCase)
            || x.Segment.Contains("cold", StringComparison.OrdinalIgnoreCase)
            || x.Segment.Contains("lapsed", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(response.Insights, x => x.SignalCategory == RecommendationSignalCategory.Caution);
        Assert.Contains(response.Insights, x => x.Insight.Contains("Lower engagement", StringComparison.OrdinalIgnoreCase)
            || x.Insight.Contains("smaller starting segment", StringComparison.OrdinalIgnoreCase));
    }
}
