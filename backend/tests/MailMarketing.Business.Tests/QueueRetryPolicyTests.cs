using MailMarketing.Business.Services;
using Xunit;

namespace MailMarketing.Business.Tests;

public sealed class QueueRetryPolicyTests
{
    [Fact]
    public void GetDelay_Should_ReturnExpectedBackoffSteps()
    {
        Assert.Equal(TimeSpan.FromMinutes(1), QueueRetryPolicy.GetDelay(1));
        Assert.Equal(TimeSpan.FromMinutes(5), QueueRetryPolicy.GetDelay(2));
        Assert.Equal(TimeSpan.FromMinutes(15), QueueRetryPolicy.GetDelay(3));
        Assert.Equal(TimeSpan.FromMinutes(15), QueueRetryPolicy.GetDelay(4));
    }

    [Theory]
    [InlineData(true, 1, 3, true)]
    [InlineData(true, 3, 3, true)]
    [InlineData(true, 4, 3, false)]
    [InlineData(false, 1, 3, false)]
    public void ShouldRetry_Should_WorkAsExpected(bool isTransient, int retryCount, int maxRetry, bool expected)
    {
        Assert.Equal(expected, QueueRetryPolicy.ShouldRetry(isTransient, retryCount, maxRetry));
    }
}
