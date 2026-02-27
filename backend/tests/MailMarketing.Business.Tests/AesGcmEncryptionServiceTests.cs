using MailMarketing.Business.Services;
using Xunit;

namespace MailMarketing.Business.Tests;

public sealed class AesGcmEncryptionServiceTests
{
    [Fact]
    public void EncryptDecrypt_ShouldRoundtrip()
    {
        var key = Convert.ToBase64String(new byte[32]);
        Environment.SetEnvironmentVariable("APP_AES_KEY", key);

        var service = new AesGcmEncryptionService();

        const string plainText = "smtp-password-123";
        var cipher = service.Encrypt(plainText);
        var decrypted = service.Decrypt(cipher);

        Assert.NotEqual(plainText, cipher);
        Assert.Equal(plainText, decrypted);
    }
}
