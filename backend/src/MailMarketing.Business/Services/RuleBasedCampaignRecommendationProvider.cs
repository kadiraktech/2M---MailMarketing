using MailMarketing.Business.Interfaces;
using MailMarketing.Business.Models.CampaignRecommendations;
using MailMarketing.Domain.Enums;

namespace MailMarketing.Business.Services;

public sealed class RuleBasedCampaignRecommendationProvider : ICampaignRecommendationProvider
{
    private const string ProviderName = "RuleBasedCampaignRecommendationProvider";
    private const string ProviderType = "RuleBased";
    private const string ProviderDisplayName = "Rule-based Campaign Recommendation Engine";
    private const string GenerationMode = "DeterministicRules";
    private const string ExplanationStyle = "ProductGuidance";
    private const string RecommendationVersion = "v1.1";

    public Task<CampaignRecommendationResponseDto> RecommendAsync(
        CampaignRecommendationRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var response = request.Goal switch
        {
            CampaignGoal.ProductLaunch => BuildProductLaunchResponse(request),
            CampaignGoal.DiscountOffer => BuildDiscountOfferResponse(request),
            CampaignGoal.ReEngagement => BuildReEngagementResponse(request),
            CampaignGoal.Newsletter => BuildNewsletterResponse(request),
            CampaignGoal.SpecialAnnouncement => BuildSpecialAnnouncementResponse(request),
            _ => throw new InvalidOperationException("Campaign goal is not supported.")
        };

        response.Goal = request.Goal;
        response.GeneratedAtUtc = DateTime.UtcNow;
        response.Provider = ProviderName;
        response.ProviderType = ProviderType;
        response.ProviderDisplayName = ProviderDisplayName;
        response.GenerationMode = GenerationMode;
        response.ExplanationStyle = ExplanationStyle;
        response.RecommendationVersion = RecommendationVersion;

        return Task.FromResult(response);
    }

    private static CampaignRecommendationResponseDto BuildProductLaunchResponse(CampaignRecommendationRequest request)
        => new()
        {
            Summary = BuildSummary(
                "Start with a value-first launch message, use a broad but engaged audience, and send in a weekday daytime window.",
                "The safest first version of a product launch is clear, benefit-led, and easy to understand at a glance.",
                request.Context),
            SubjectSuggestions = new[]
            {
                CreateSubject(
                    "Introducing the new release: built to save time from day one",
                    "This keeps the launch concrete and benefit-led, which is usually safer than a clever but vague announcement."),
                CreateSubject(
                    "Now available: a smarter way to run your next campaign",
                    "A launch subject should help the reader understand what changed and why it matters quickly."),
                CreateSubject(
                    "Meet our latest update for faster campaign execution",
                    "This format stays announcement-driven while still highlighting a practical payoff.")
            },
            AudienceSuggestions = new[]
            {
                CreateAudience(
                    "Broad engaged subscribers",
                    "A product launch often needs reach, but starting with engaged subscribers makes the first release signal cleaner and easier to evaluate."),
                CreateAudience(
                    "Recently active subscribers who opened or clicked recent sends",
                    "Recent engagement is a reasonable first-pass proxy for product interest when no deeper audience model exists.")
            },
            SendTimeSuggestions = new[]
            {
                CreateSendTime(
                    "Tuesday to Thursday, 10:00-14:00 local time",
                    "Weekday daytime delivery is a dependable starting point when the goal is awareness plus same-day action."),
                CreateSendTime(
                    "Tuesday morning",
                    "A morning launch send gives the campaign a full workday to be noticed and discussed.")
            },
            Insights = new[]
            {
                CreateInsight(
                    "This goal usually benefits from a concise value-first subject.",
                    "Product launches often lose momentum when the subject is intriguing but unclear about the actual benefit.",
                    RecommendationSignalCategory.MessagingQuality),
                CreateInsight(
                    "Start broad only within engaged segments, then expand if the message lands cleanly.",
                    "That approach keeps the launch visible without using the coldest audience as the first test group.",
                    RecommendationSignalCategory.AudienceFit),
                CreateInsight(
                    "If template direction is still open, choose clarity over visual novelty in the first send.",
                    BuildTemplateInsight(request.Context),
                    RecommendationSignalCategory.DeliveryStrategy)
            }
        };

    private static CampaignRecommendationResponseDto BuildDiscountOfferResponse(CampaignRecommendationRequest request)
        => new()
        {
            Summary = BuildSummary(
                "Lead with offer clarity and measured urgency, start with responsive segments, and avoid burning colder audiences too early.",
                "The best first version of a discount campaign makes the value obvious immediately and expands only after the core offer feels strong.",
                request.Context),
            SubjectSuggestions = new[]
            {
                CreateSubject(
                    "Limited-time offer: save on your next campaign setup",
                    "The offer is visible immediately, which is usually more reliable than hiding the value behind pure urgency."),
                CreateSubject(
                    "Special savings for your next email campaign",
                    "This is direct, promotional, and readable without implying personalization that is not actually computed."),
                CreateSubject(
                    "Last chance to claim this campaign offer",
                    "Urgency can help a discount campaign, but it works best when the offer itself is already clear.")
            },
            AudienceSuggestions = new[]
            {
                CreateAudience(
                    "Recently engaged subscribers",
                    "A discount campaign is safer when it starts with subscribers who already respond to marketing activity."),
                CreateAudience(
                    "Promotion-responsive segments",
                    "If you maintain groups that historically tolerate offer-led messaging, they are the most natural first audience for this goal.")
            },
            SendTimeSuggestions = new[]
            {
                CreateSendTime(
                    "Midweek, late morning to early afternoon",
                    "This gives the offer a practical response window without relying on late-night urgency tactics."),
                CreateSendTime(
                    "Thursday around midday",
                    "A focused daytime send can support urgency while still leaving enough time for action.")
            },
            Insights = new[]
            {
                CreateInsight(
                    "The offer value should be visible in the subject, not only inside the message body.",
                    "If the reader cannot tell what is being offered quickly, urgency language alone is less useful.",
                    RecommendationSignalCategory.MessagingQuality),
                CreateInsight(
                    "Broad cold segments are a riskier starting point for discount campaigns.",
                    "That audience may consume urgency without enough baseline trust or interest to convert well.",
                    RecommendationSignalCategory.Caution),
                CreateInsight(
                    "Treat the first discount send as an audience-quality test before scaling reach.",
                    "A measured rollout protects list quality and helps confirm whether the offer framing is strong enough.",
                    RecommendationSignalCategory.DeliveryStrategy)
            }
        };

    private static CampaignRecommendationResponseDto BuildReEngagementResponse(CampaignRecommendationRequest request)
        => new()
        {
            Summary = BuildSummary(
                "Use a win-back tone, start with smaller or partially lapsed groups, and plan for a weaker baseline response than an engaged campaign.",
                "For re-engagement, the smarter starting move is careful audience selection and a respectful comeback message rather than a broad push.",
                request.Context),
            SubjectSuggestions = new[]
            {
                CreateSubject(
                    "Still interested? We saved something useful for you",
                    "This re-opens the relationship with a softer invitation instead of an overly promotional tone."),
                CreateSubject(
                    "We would love to welcome you back",
                    "A straightforward win-back subject fits the goal better than urgency that the audience may no longer trust."),
                CreateSubject(
                    "Before you miss future updates, here is what changed",
                    "This gives the reader a reason to reconsider the relationship without sounding aggressive.")
            },
            AudienceSuggestions = new[]
            {
                CreateAudience(
                    "Partially lapsed subscribers before the coldest audience",
                    "A smaller re-entry segment is often a safer first move than sending immediately to the entire cold base."),
                CreateAudience(
                    "Inactive or cold subscribers in a controlled starting group",
                    "This goal does target cold audiences, but rollout discipline matters more here than in routine campaigns.")
            },
            SendTimeSuggestions = new[]
            {
                CreateSendTime(
                    "Tuesday or Wednesday, 09:00-11:00 local time",
                    "A quieter weekday morning window keeps the test controlled and easier to interpret."),
                CreateSendTime(
                    "Midweek morning",
                    "This is a practical starting slot for a cautious win-back send.")
            },
            Insights = new[]
            {
                CreateInsight(
                    "Lower engagement is the normal baseline for this goal, so keep expectations conservative.",
                    "Re-engagement guidance should acknowledge that this audience is already less responsive than an active list.",
                    RecommendationSignalCategory.Caution),
                CreateInsight(
                    "A smaller starting segment is usually safer than a full cold-list send.",
                    "That reduces audience fatigue risk while you validate the tone and offer strength.",
                    RecommendationSignalCategory.AudienceFit),
                CreateInsight(
                    "A respectful comeback tone is usually stronger than hype for a win-back campaign.",
                    "Trust rebuilding matters more than short-term promotional intensity in this goal.",
                    RecommendationSignalCategory.MessagingQuality)
            }
        };

    private static CampaignRecommendationResponseDto BuildNewsletterResponse(CampaignRecommendationRequest request)
        => new()
        {
            Summary = BuildSummary(
                "Keep the subject recognizable, maintain a regular cadence, and use broad opt-in reach without forcing promotional urgency.",
                "A newsletter usually works best when the audience can quickly identify the format and trust the consistency of the send.",
                request.Context),
            SubjectSuggestions = new[]
            {
                CreateSubject(
                    "This week’s campaign updates and highlights",
                    "Newsletter subjects are usually strongest when the reader can immediately recognize the format."),
                CreateSubject(
                    "What’s new in this week’s email program",
                    "This keeps the tone informative and repeatable instead of sounding like a one-off promotion."),
                CreateSubject(
                    "Latest updates, ideas, and campaign notes",
                    "A broad newsletter subject should be descriptive enough to build trust over time.")
            },
            AudienceSuggestions = new[]
            {
                CreateAudience(
                    "Broad opt-in subscriber base",
                    "A newsletter is usually intended for the widest relevant subscribed audience rather than a narrowly optimized segment."),
                CreateAudience(
                    "Active subscribers first if list quality still needs validation",
                    "If deliverability or cadence is still being tuned, a more responsive starting slice is a safer operating pattern.")
            },
            SendTimeSuggestions = new[]
            {
                CreateSendTime(
                    "A consistent weekly weekday slot",
                    "For newsletters, recognizability and cadence can matter more than squeezing urgency into each send."),
                CreateSendTime(
                    "Tuesday or Wednesday morning",
                    "A steady midweek slot supports routine reading behavior without overcomplicating timing.")
            },
            Insights = new[]
            {
                CreateInsight(
                    "Consistency is a strategic advantage for this goal.",
                    "The more recognizable the newsletter pattern becomes, the easier it is for subscribers to place and trust it.",
                    RecommendationSignalCategory.Opportunity),
                CreateInsight(
                    "Trust usually matters more than hype for recurring content.",
                    "A newsletter that constantly sounds urgent can weaken its own recognizability.",
                    RecommendationSignalCategory.MessagingQuality),
                CreateInsight(
                    "Cadence discipline is often more valuable here than aggressive timing optimization.",
                    "Regularity makes the campaign easier to repeat, compare, and improve over time.",
                    RecommendationSignalCategory.DeliveryStrategy)
            }
        };

    private static CampaignRecommendationResponseDto BuildSpecialAnnouncementResponse(CampaignRecommendationRequest request)
        => new()
        {
            Summary = BuildSummary(
                "Favor seriousness and clarity, match the audience tightly to message relevance, and move quickly only when the announcement itself is genuinely time-sensitive.",
                "For a special announcement, the safest default is clear, trustworthy communication that respects relevance more than marketing flourish.",
                request.Context),
            SubjectSuggestions = new[]
            {
                CreateSubject(
                    "Important update for our subscribers",
                    "This sets the tone for a serious message without over-promising urgency."),
                CreateSubject(
                    "Please review this campaign update",
                    "A direct subject is often the safest format when trust and clarity matter most."),
                CreateSubject(
                    "New announcement: what you need to know",
                    "This gives the recipient enough context to understand why the email deserves attention.")
            },
            AudienceSuggestions = new[]
            {
                CreateAudience(
                    "All relevant subscribers",
                    "Special announcements can justify broader reach, but relevance should still define the final audience."),
                CreateAudience(
                    "High-relevance subscribers when the message is audience-specific",
                    "If the update affects only part of the list, tighter targeting protects trust and keeps the message credible.")
            },
            SendTimeSuggestions = new[]
            {
                CreateSendTime(
                    "Weekday morning or early afternoon",
                    "Important updates are easier to process when sent during normal attention windows."),
                CreateSendTime(
                    "As soon as message clarity and audience scope are validated",
                    "When the announcement truly matters, readiness and clarity are more important than a perfect optimization window.")
            },
            Insights = new[]
            {
                CreateInsight(
                    "Clarity is usually more important than cleverness for this goal.",
                    "Recipients should understand the significance of the message without decoding the subject line.",
                    RecommendationSignalCategory.MessagingQuality),
                CreateInsight(
                    "Audience relevance directly affects message trust for announcements.",
                    "A broad send can work, but only when the announcement is genuinely relevant to the recipients receiving it.",
                    RecommendationSignalCategory.AudienceFit),
                CreateInsight(
                    "Urgency should follow actual message importance, not just campaign tone.",
                    "Special announcements feel more credible when the timing reflects the message rather than artificial pressure.",
                    RecommendationSignalCategory.Caution)
            }
        };

    private static string BuildSummary(string primaryRecommendation, string rationale, CampaignRecommendationContextDto? context)
    {
        var notes = new List<string>();

        if (context?.RecentFailedSendCount is > 0)
        {
            notes.Add("Review recent delivery friction before broad rollout.");
        }

        if (context?.AvailableTemplateCount == 0)
        {
            notes.Add("Keep the recommendation modular because no template context is available yet.");
        }

        if (context?.ActiveSubscriberCount is not null && context?.InactiveSubscriberCount is not null)
        {
            notes.Add("Audience guidance is framed from the active/inactive split only when that context is supplied.");
        }

        var summary = $"Recommended starting plan: {primaryRecommendation} {rationale}";
        if (notes.Count > 0)
        {
            summary = $"{summary} {string.Join(" ", notes)}";
        }

        return context is null
            ? $"{summary} This is rule-based guidance, not personalized optimization."
            : summary;
    }

    private static string BuildTemplateInsight(CampaignRecommendationContextDto? context)
    {
        if (context?.AvailableTemplateCount is > 0)
        {
            return "Available template context means you can compare a straightforward launch layout against a more feature-led format without changing the recommendation strategy.";
        }

        return "No template-specific context was supplied, so the recommendation stays focused on message structure and rollout logic.";
    }

    private static SubjectRecommendationDto CreateSubject(string subject, string reason)
        => new()
        {
            Subject = subject,
            Reason = reason
        };

    private static AudienceRecommendationDto CreateAudience(string segment, string reason)
        => new()
        {
            Segment = segment,
            Reason = reason
        };

    private static SendTimeRecommendationDto CreateSendTime(string window, string reason)
        => new()
        {
            Window = window,
            Reason = reason
        };

    private static InsightRecommendationDto CreateInsight(
        string insight,
        string reason,
        RecommendationSignalCategory signalCategory)
        => new()
        {
            Insight = insight,
            Reason = reason,
            SignalCategory = signalCategory
        };
}
