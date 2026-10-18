using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.RateLimiting;
using Chiraq.Api.Data;
using Chiraq.Api.Security;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Chiraq.Api.Tests;

public sealed class TerritoryApiTests
{
    [Fact]
    public async Task NewAdaMemberCanCaptureCarpetMuseumWithOneEasyTask()
    {
        const string adminToken = "territory-api-test-admin-token-2026";
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["JWT_SECRET"] = "test-jwt-secret-with-at-least-32-characters",
            ["QR_HMAC_SECRET"] = "test-qr-secret-with-at-least-32-characters",
            ["DEMO_MODE"] = "true",
            ["ADMIN_TOKEN"] = adminToken,
        }).Build();

        await using var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        await using (var seedDb = new AppDbContext(dbOptions))
            await DbSeeder.InitializeAsync(seedDb, configuration);

        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Configuration.AddInMemoryCollection(configuration.AsEnumerable().ToDictionary(x => x.Key, x => x.Value));
        builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connection));
        builder.Services.AddSingleton<Tokens>();
        builder.Services.AddRateLimiter(options =>
        {
            options.AddPolicy("auth", _ => TestRateLimit());
            options.AddPolicy("complete", _ => TestRateLimit());
            options.AddPolicy("checkin", _ => TestRateLimit());
        });

        await using var app = builder.Build();
        app.UseRateLimiter();
        app.MapChiraqApi();
        await app.StartAsync();
        try
        {
            var addresses = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!;
            using var client = new HttpClient { BaseAddress = new Uri(addresses.Addresses.Single()) };

            using var beforeResponse = await client.GetAsync("/api/places/carpet-museum");
            beforeResponse.EnsureSuccessStatusCode();
            using var beforeJson = JsonDocument.Parse(await beforeResponse.Content.ReadAsStringAsync());
            Assert.Equal("adnsu", beforeJson.RootElement.GetProperty("territory").GetProperty("university_id").GetString());
            Assert.Equal(5, beforeJson.RootElement.GetProperty("territory").GetProperty("gap").GetInt32());

            using var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
            {
                name = "Aylin Əliyeva",
                email = "territory-flip-test@example.test",
                password = "test-password-2026",
                universityId = "ada",
                avatarId = "nizami",
                visitedMuseumLast12Months = false,
            });
            registerResponse.EnsureSuccessStatusCode();
            using var registerJson = JsonDocument.Parse(await registerResponse.Content.ReadAsStringAsync());
            var accessToken = registerJson.RootElement.GetProperty("token").GetString()!;
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var qrResponse = await client.GetAsync("/api/demo/qr/carpet-museum-visit");
            qrResponse.EnsureSuccessStatusCode();
            using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
            var qrPayload = qrJson.RootElement.GetProperty("qr_payload").GetString();
            using var completeResponse = await client.PostAsJsonAsync("/api/tasks/carpet-museum-visit/complete", new { qrToken = qrPayload });
            completeResponse.EnsureSuccessStatusCode();
            using var completeJson = JsonDocument.Parse(await completeResponse.Content.ReadAsStringAsync());
            Assert.Equal("Xalça Muzeyini ADNSU-dan fəth etdin!", completeJson.RootElement.GetProperty("territory_change").GetProperty("message").GetString());

            using var afterResponse = await client.GetAsync("/api/places/carpet-museum");
            afterResponse.EnsureSuccessStatusCode();
            using var afterJson = JsonDocument.Parse(await afterResponse.Content.ReadAsStringAsync());
            Assert.Equal("ada", afterJson.RootElement.GetProperty("territory").GetProperty("university_id").GetString());
            Assert.Equal(20, afterJson.RootElement.GetProperty("territory").GetProperty("score").GetInt32());

            client.DefaultRequestHeaders.Add("X-Admin-Token", adminToken);
            using var metricsResponse = await client.GetAsync("/api/admin/metrics");
            metricsResponse.EnsureSuccessStatusCode();
            using var metricsJson = JsonDocument.Parse(await metricsResponse.Content.ReadAsStringAsync());
            var metrics = metricsJson.RootElement;
            Assert.Equal(1, metrics.GetProperty("new_users").GetInt32());
            Assert.Equal(1, metrics.GetProperty("users_with_museum_completion").GetInt32());
            Assert.Equal(1, metrics.GetProperty("first_time_museum_visitors").GetInt32());
            Assert.Equal(1, metrics.GetProperty("visits_per_place").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
            Assert.Equal(1, metrics.GetProperty("visits_per_university").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
        }
        finally
        {
            await app.StopAsync();
        }
    }

    private static RateLimitPartition<string> TestRateLimit() => RateLimitPartition.GetFixedWindowLimiter(
        "test", _ => new FixedWindowRateLimiterOptions { PermitLimit = 100, Window = TimeSpan.FromMinutes(1) });
}
