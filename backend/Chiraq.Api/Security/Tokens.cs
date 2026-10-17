using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Chiraq.Api.Security;

public sealed class Tokens(IConfiguration configuration)
{
    private readonly byte[] _jwtSecret = Secret(configuration["JWT_SECRET"]);
    private readonly byte[] _qrSecret = Secret(configuration["QR_HMAC_SECRET"]);

    private static byte[] Secret(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return RandomNumberGenerator.GetBytes(32);
        if (Encoding.UTF8.GetByteCount(value) < 32) throw new InvalidOperationException("JWT_SECRET and QR_HMAC_SECRET must contain at least 32 characters.");
        return Encoding.UTF8.GetBytes(value);
    }

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 210_000, HashAlgorithmName.SHA256, 32);
        return $"pbkdf2-sha256${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPassword(string password, string value)
    {
        var parts = value.Split('$');
        if (parts.Length != 3 || parts[0] != "pbkdf2-sha256") return false;
        try
        {
            var expected = Convert.FromBase64String(parts[2]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(parts[1]), 210_000, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
    }

    public string Issue(string userId, DateTimeOffset now) => SignJwt(new { sub = userId, exp = now.AddDays(7).ToUnixTimeSeconds() });

    public string? Validate(string? token, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;
        var chunks = token.Split('.');
        if (chunks.Length != 3) return null;
        var signed = $"{chunks[0]}.{chunks[1]}";
        var expected = Convert.ToBase64String(HMACSHA256.HashData(_jwtSecret, Encoding.UTF8.GetBytes(signed))).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        if (!CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(expected), Encoding.ASCII.GetBytes(chunks[2]))) return null;
        try
        {
            var json = JsonDocument.Parse(Encoding.UTF8.GetString(Base64UrlDecode(chunks[1]))).RootElement;
            if (json.GetProperty("exp").GetInt64() <= now.ToUnixTimeSeconds()) return null;
            return json.GetProperty("sub").GetString();
        }
        catch (JsonException) { return null; }
        catch (KeyNotFoundException) { return null; }
        catch (InvalidOperationException) { return null; }
    }

    public string QrToken(string placeSlug, string code, int version)
    {
        var data = $"/q/{placeSlug}/{code}/{version}";
        var signature = Convert.ToBase64String(HMACSHA256.HashData(_qrSecret, Encoding.UTF8.GetBytes(data))).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        return $"{data}.{signature}";
    }

    public bool VerifyQr(string token, string placeSlug, string code, int version) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(QrToken(placeSlug, code, version)), Encoding.UTF8.GetBytes(token));

    private string SignJwt<T>(T claims)
    {
        var header = Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
        var payload = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(claims));
        var message = $"{header}.{payload}";
        var signature = Base64UrlEncode(HMACSHA256.HashData(_jwtSecret, Encoding.UTF8.GetBytes(message)));
        return $"{message}.{signature}";
    }

    private static string Base64UrlEncode(byte[] value) => Convert.ToBase64String(value).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    private static byte[] Base64UrlDecode(string value) => Convert.FromBase64String(value.Replace('-', '+').Replace('_', '/') + new string('=', (4 - value.Length % 4) % 4));
}
