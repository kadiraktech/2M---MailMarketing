using System.Security.Cryptography;
using System.Text;
using MailMarketing.Business.Interfaces;

namespace MailMarketing.Business.Services;

public sealed class AesGcmEncryptionService : IAesEncryptionService
{
    private readonly byte[] _key;

    public AesGcmEncryptionService()
    {
        var env = Environment.GetEnvironmentVariable("APP_AES_KEY");
        if (string.IsNullOrWhiteSpace(env))
        {
            throw new InvalidOperationException("APP_AES_KEY zorunludur.");
        }

        try
        {
            _key = Convert.FromBase64String(env);
            if (_key.Length != 32)
            {
                throw new InvalidOperationException("APP_AES_KEY 32 byte (Base64) olmalıdır.");
            }
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("APP_AES_KEY geçerli Base64 formatında olmalıdır.");
        }
    }

    public string Encrypt(string plainText)
    {
        var nonce = RandomNumberGenerator.GetBytes(12);
        var plaintextBytes = Encoding.UTF8.GetBytes(plainText);
        var cipher = new byte[plaintextBytes.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(_key, 16);
        aes.Encrypt(nonce, plaintextBytes, cipher, tag);

        var all = new byte[nonce.Length + tag.Length + cipher.Length];
        Buffer.BlockCopy(nonce, 0, all, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, all, nonce.Length, tag.Length);
        Buffer.BlockCopy(cipher, 0, all, nonce.Length + tag.Length, cipher.Length);

        return Convert.ToBase64String(all);
    }

    public string Decrypt(string cipherText)
    {
        var all = Convert.FromBase64String(cipherText);
        var nonce = all[..12];
        var tag = all[12..28];
        var cipher = all[28..];
        var plain = new byte[cipher.Length];

        using var aes = new AesGcm(_key, 16);
        aes.Decrypt(nonce, cipher, tag, plain);

        return Encoding.UTF8.GetString(plain);
    }
}

