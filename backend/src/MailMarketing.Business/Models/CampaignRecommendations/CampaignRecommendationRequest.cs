using System.ComponentModel.DataAnnotations;
using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Models.CampaignRecommendations;

public sealed class CampaignRecommendationRequest
{
    [Required(ErrorMessage = "Campaign goal is required.")]
    [EnumDataType(typeof(CampaignGoal), ErrorMessage = "Campaign goal is invalid.")]
    public CampaignGoal Goal { get; set; }

    public CampaignRecommendationContextDto? Context { get; set; }
}
