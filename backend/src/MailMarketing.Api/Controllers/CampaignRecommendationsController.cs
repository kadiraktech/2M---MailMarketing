using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.CampaignRecommendations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MailMarketing.Api.Controllers;

[ApiController]
[Route("api/admin/campaign-recommendations")]
[Authorize]
public sealed class CampaignRecommendationsController(ICampaignRecommendationProvider recommendationProvider) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<CampaignRecommendationResponseDto>> Recommend(
        [FromBody] CampaignRecommendationRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await recommendationProvider.RecommendAsync(request, cancellationToken));
    }
}
