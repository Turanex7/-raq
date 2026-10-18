using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.RateLimiting;
using Chiraq.Api.Data;
using Chiraq.Api.Security;
using Microsoft.Data.Sqlite;
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
    private const string AdminToken = "territory-api-test-admin-token-2026";

    [Fact]
    public async Task NewAdaMemberCapturesCarpetMuseumWithOneEasyTaskWithoutFirstVisitBonus()
    {
        await using var api = await TestApi.StartAsync();
        var client = api.Client;

        using var beforeResponse = await client.GetAsync("/api/places/carpet-museum");
        beforeResponse.EnsureSuccessStatusCode();
        using var beforeJson = JsonDocument.Parse(await beforeResponse.Content.ReadAsStringAsync());
        var before = beforeJson.RootElement.GetProperty("territory");
        Assert.Equal("adnsu", before.GetProperty("university_id").GetString());
        Assert.Equal(8, before.GetProperty("score").GetInt32());

        var accessToken = await RegisterAsync(client, "Aylin Əliyeva", "territory-flip-test@example.test", "ada", true);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var qrResponse = await client.GetAsync("/api/demo/qr/carpet-museum-visit");
        qrResponse.EnsureSuccessStatusCode();
        using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
        var qrPayload = qrJson.RootElement.GetProperty("qr_payload").GetString();
        using var completeResponse = await client.PostAsJsonAsync("/api/tasks/carpet-museum-visit/complete", new { qrToken = qrPayload });
        completeResponse.EnsureSuccessStatusCode();
        using var completeJson = JsonDocument.Parse(await completeResponse.Content.ReadAsStringAsync());
        var result = completeJson.RootElement;
        Assert.Equal(10, result.GetProperty("xp_awarded").GetInt32());
        Assert.Equal(0, result.GetProperty("breakdown").GetProperty("first_visit").GetInt32());
        Assert.Equal("Xalça Muzeyini ADNSU-dan fəth etdin!", result.GetProperty("territory_change").GetProperty("message").GetString());

        using var afterResponse = await client.GetAsync("/api/places/carpet-museum");
        afterResponse.EnsureSuccessStatusCode();
        using var afterJson = JsonDocument.Parse(await afterResponse.Content.ReadAsStringAsync());
        Assert.Equal("ada", afterJson.RootElement.GetProperty("territory").GetProperty("university_id").GetString());
        Assert.Equal(10, afterJson.RootElement.GetProperty("territory").GetProperty("score").GetInt32());

        using var meResponse = await client.GetAsync("/api/me");
        meResponse.EnsureSuccessStatusCode();
        using var meJson = JsonDocument.Parse(await meResponse.Content.ReadAsStringAsync());
        Assert.Equal(10, meJson.RootElement.GetProperty("lifetimeXp").GetInt32());
        Assert.Equal(10, meJson.RootElement.GetProperty("weeklyXp").GetInt32());

        client.DefaultRequestHeaders.Add("X-Admin-Token", AdminToken);
        using var metricsResponse = await client.GetAsync("/api/admin/metrics");
        metricsResponse.EnsureSuccessStatusCode();
        using var metricsJson = JsonDocument.Parse(await metricsResponse.Content.ReadAsStringAsync());
        var metrics = metricsJson.RootElement;
        Assert.Equal(1, metrics.GetProperty("new_users").GetInt32());
        Assert.Equal(1, metrics.GetProperty("users_with_museum_completion").GetInt32());
        Assert.Equal(0, metrics.GetProperty("first_time_museum_visitors").GetInt32());
        Assert.Equal(1, metrics.GetProperty("visits_per_place").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
        Assert.Equal(1, metrics.GetProperty("visits_per_university").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
    }

    [Fact]
    public async Task FirstMuseumVisitBonusIsReturnedAsItsOwnBreakdownLine()
    {
        await using var api = await TestApi.StartAsync();
        var accessToken = await RegisterAsync(api.Client, "Nigar Əliyeva", "first-visit-test@example.test", "bdu", false);
        api.Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var qrResponse = await api.Client.GetAsync("/api/demo/qr/national-history-visit");
        qrResponse.EnsureSuccessStatusCode();
        using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
        using var completeResponse = await api.Client.PostAsJsonAsync("/api/tasks/national-history-visit/complete", new { qrToken = qrJson.RootElement.GetProperty("qr_payload").GetString() });
        completeResponse.EnsureSuccessStatusCode();
        using var completeJson = JsonDocument.Parse(await completeResponse.Content.ReadAsStringAsync());
        Assert.Equal(20, completeJson.RootElement.GetProperty("breakdown").GetProperty("first_visit").GetInt32());
        Assert.Equal(30, completeJson.RootElement.GetProperty("xp_awarded").GetInt32());

        api.Client.DefaultRequestHeaders.Add("X-Admin-Token", AdminToken);
        using var metricsResponse = await api.Client.GetAsync("/api/admin/metrics");
        metricsResponse.EnsureSuccessStatusCode();
        using var metricsJson = JsonDocument.Parse(await metricsResponse.Content.ReadAsStringAsync());
        var metrics = metricsJson.RootElement;
        Assert.Equal(1, metrics.GetProperty("new_users").GetInt32());
        Assert.Equal(1, metrics.GetProperty("users_with_museum_completion").GetInt32());
        Assert.Equal(1, metrics.GetProperty("first_time_museum_visitors").GetInt32());
        Assert.Equal(1, metrics.GetProperty("visits_per_place").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
        Assert.Equal(1, metrics.GetProperty("visits_per_university").EnumerateArray().Count(row => row.GetProperty("visits").GetInt32() > 0));
    }

    [Fact]
    public async Task RareFlameIsCosmeticAndCollectionLabelsItAsRare()
    {
        await using var api = await TestApi.StartAsync(rareFlameChancePercent: 100);
        var client = api.Client;
        var accessToken = await RegisterAsync(client, "Lalə Məmmədova", "rare-flame-test@example.test", "ada", true);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var qrResponse = await client.GetAsync("/api/demo/qr/carpet-museum-visit");
        qrResponse.EnsureSuccessStatusCode();
        using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
        using var completeResponse = await client.PostAsJsonAsync("/api/tasks/carpet-museum-visit/complete", new { qrToken = qrJson.RootElement.GetProperty("qr_payload").GetString() });
        completeResponse.EnsureSuccessStatusCode();
        using var completeJson = JsonDocument.Parse(await completeResponse.Content.ReadAsStringAsync());
        var result = completeJson.RootElement;
        Assert.Equal(10, result.GetProperty("xp_awarded").GetInt32());
        Assert.Equal(10, result.GetProperty("new_total").GetInt32());
        var rareDrop = result.GetProperty("rare_flame_drop");
        Assert.Equal("Çıraq alovu", rareDrop.GetProperty("name").GetString());
        Assert.Equal("nadir", rareDrop.GetProperty("rarity").GetString());

        using var collectionResponse = await client.GetAsync("/api/me/collection");
        collectionResponse.EnsureSuccessStatusCode();
        using var collectionJson = JsonDocument.Parse(await collectionResponse.Content.ReadAsStringAsync());
        var card = collectionJson.RootElement.GetProperty("rows").EnumerateArray()
            .Single(x => x.GetProperty("rare_flame").GetBoolean() && x.GetProperty("earned").GetBoolean());
        Assert.Equal("nadir", card.GetProperty("rarity").GetString());
        Assert.Equal("Çıraq alovu", card.GetProperty("name").GetString());
    }

    [Fact]
    public async Task SecondMuseumConversionExcludesDemoUsersAndCountsDistinctMuseums()
    {
        await using var api = await TestApi.StartAsync();
        var client = api.Client;
        client.DefaultRequestHeaders.Add("X-Admin-Token", AdminToken);

        using var emptyResponse = await client.GetAsync("/api/admin/metrics");
        emptyResponse.EnsureSuccessStatusCode();
        using var emptyJson = JsonDocument.Parse(await emptyResponse.Content.ReadAsStringAsync());
        var emptyConversion = emptyJson.RootElement.GetProperty("second_museum_conversion");
        Assert.Equal(0, emptyConversion.GetProperty("eligible_users").GetInt32());
        Assert.Equal(0, emptyConversion.GetProperty("converted_users").GetInt32());
        Assert.Equal(JsonValueKind.Null, emptyConversion.GetProperty("percent").ValueKind);

        var accessToken = await RegisterAsync(client, "Murad Əliyev", "second-museum-test@example.test", "bdu", true);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        await CompleteQrTaskAsync(client, "carpet-museum-visit");
        using (var sameMuseumTaskResponse = await client.PostAsJsonAsync("/api/tasks/carpet-museum-vote/complete", new { answer = "Memarlıq" }))
            sameMuseumTaskResponse.EnsureSuccessStatusCode();
        using (var firstPlaceResponse = await client.GetAsync("/api/admin/metrics"))
        {
            firstPlaceResponse.EnsureSuccessStatusCode();
            using var firstPlaceJson = JsonDocument.Parse(await firstPlaceResponse.Content.ReadAsStringAsync());
            var conversion = firstPlaceJson.RootElement.GetProperty("second_museum_conversion");
            Assert.Equal(1, conversion.GetProperty("eligible_users").GetInt32());
            Assert.Equal(0, conversion.GetProperty("converted_users").GetInt32());
            Assert.Equal(0, conversion.GetProperty("percent").GetDouble());
        }

        await CompleteQrTaskAsync(client, "national-history-visit");
        using var convertedResponse = await client.GetAsync("/api/admin/metrics");
        convertedResponse.EnsureSuccessStatusCode();
        using var convertedJson = JsonDocument.Parse(await convertedResponse.Content.ReadAsStringAsync());
        var converted = convertedJson.RootElement.GetProperty("second_museum_conversion");
        Assert.Equal(1, converted.GetProperty("eligible_users").GetInt32());
        Assert.Equal(1, converted.GetProperty("converted_users").GetInt32());
        Assert.Equal(100, converted.GetProperty("percent").GetDouble());
    }

    private static async Task CompleteQrTaskAsync(HttpClient client, string taskId)
    {
        using var qrResponse = await client.GetAsync($"/api/demo/qr/{taskId}");
        qrResponse.EnsureSuccessStatusCode();
        using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
        using var completeResponse = await client.PostAsJsonAsync($"/api/tasks/{taskId}/complete", new { qrToken = qrJson.RootElement.GetProperty("qr_payload").GetString() });
        completeResponse.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task TerritoryChangeFiresWhenAUniversityBreaksAnEarlierTieAndOnlyOnce()
    {
        await using var api = await TestApi.StartAsync();
        var accessToken = await RegisterAsync(api.Client, "Aylin Əliyeva", "territory-tie-test@example.test", "ada", true);
        api.Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var userId = DecodeUserId(accessToken);

        await using (var db = api.CreateDb())
        {
            var season = await db.Seasons.SingleAsync();
            var place = await db.Places.SingleAsync(x => x.Slug == "carpet-museum");
            db.XpEvents.Add(new XpEvent
            {
                UserId = userId,
                SeasonId = season.Id,
                PlaceId = place.Id,
                TaskId = "carpet-museum-visit",
                Kind = "base",
                Amount = 8,
                CreatedAtUtc = DateTimeOffset.UtcNow,
            });
            await db.SaveChangesAsync();
        }

        using var tiedResponse = await api.Client.GetAsync("/api/places/carpet-museum");
        tiedResponse.EnsureSuccessStatusCode();
        using var tiedJson = JsonDocument.Parse(await tiedResponse.Content.ReadAsStringAsync());
        var tiedTerritory = tiedJson.RootElement.GetProperty("territory");
        Assert.Equal("adnsu", tiedTerritory.GetProperty("university_id").GetString());
        Assert.False(tiedTerritory.GetProperty("tied").GetBoolean());
        Assert.Equal(0, tiedTerritory.GetProperty("gap").GetInt32());

        using var qrResponse = await api.Client.GetAsync("/api/demo/qr/carpet-museum-visit");
        qrResponse.EnsureSuccessStatusCode();
        using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
        using var captureResponse = await api.Client.PostAsJsonAsync("/api/tasks/carpet-museum-visit/complete", new { qrToken = qrJson.RootElement.GetProperty("qr_payload").GetString() });
        captureResponse.EnsureSuccessStatusCode();
        using var captureJson = JsonDocument.Parse(await captureResponse.Content.ReadAsStringAsync());
        Assert.Equal("Xalça Muzeyini ADNSU-dan fəth etdin!", captureJson.RootElement.GetProperty("territory_change").GetProperty("message").GetString());

        using var anotherTaskResponse = await api.Client.PostAsJsonAsync("/api/tasks/carpet-museum-vote/complete", new { answer = "Memarlıq" });
        anotherTaskResponse.EnsureSuccessStatusCode();
        using var anotherTaskJson = JsonDocument.Parse(await anotherTaskResponse.Content.ReadAsStringAsync());
        Assert.Equal(JsonValueKind.Null, anotherTaskJson.RootElement.GetProperty("territory_change").ValueKind);
    }

    [Fact]
    public async Task ThreeFlameAwardsXpOnlyAfterThreeRolesAnswerAndIncludesServerGroupBonus()
    {
        await using var api = await TestApi.StartAsync();
        var client = api.Client;
        var names = new[] { "Nigar Əliyeva", "Aysel Məmmədova", "Rəşad Məmmədov" };
        var tokens = new string[3];

        tokens[0] = await RegisterAsync(client, names[0], "three-flame-1@example.test", "ada", true);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens[0]);
        using var createGroup = await client.PostAsJsonAsync("/api/groups", new { name = "Üçlü alov testi" });
        createGroup.EnsureSuccessStatusCode();
        using var groupJson = JsonDocument.Parse(await createGroup.Content.ReadAsStringAsync());
        var inviteCode = groupJson.RootElement.GetProperty("inviteCode").GetString();

        for (var index = 1; index < 3; index++)
        {
            tokens[index] = await RegisterAsync(client, names[index], $"three-flame-{index + 1}@example.test", "ada", true);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens[index]);
            using var joinGroup = await client.PostAsJsonAsync("/api/groups/join", new { inviteCode });
            joinGroup.EnsureSuccessStatusCode();
        }

        var expectedRoles = new[] { "Kəşfiyyatçı", "Tarixçi", "Müşahidəçi" };
        string? sessionId = null;
        for (var index = 0; index < 3; index++)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens[index]);
            using var qrResponse = await client.GetAsync("/api/demo/qr/carpet-museum-coop");
            qrResponse.EnsureSuccessStatusCode();
            using var qrJson = JsonDocument.Parse(await qrResponse.Content.ReadAsStringAsync());
            using var joinResponse = await client.PostAsJsonAsync("/api/coop/carpet-museum-coop/join", new { qrToken = qrJson.RootElement.GetProperty("qr_payload").GetString() });
            joinResponse.EnsureSuccessStatusCode();
            using var joinJson = JsonDocument.Parse(await joinResponse.Content.ReadAsStringAsync());
            Assert.Equal(expectedRoles[index], joinJson.RootElement.GetProperty("my_role").GetString());
            Assert.True(joinJson.RootElement.GetProperty("role_question").GetProperty("needsReview").GetBoolean());
            sessionId ??= joinJson.RootElement.GetProperty("session_id").GetString();
        }

        var answers = new[] { "Naxışlı detal", "Ümumi fikir", "Mavi rəng" };
        for (var index = 0; index < 2; index++)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens[index]);
            using var response = await client.PostAsJsonAsync($"/api/coop/{sessionId}/answer", new { answer = answers[index] });
            response.EnsureSuccessStatusCode();
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.False(json.RootElement.GetProperty("completed").GetBoolean());
            Assert.Equal(0, json.RootElement.GetProperty("xp_awarded").GetInt32());
        }

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens[2]);
        using var finalResponse = await client.PostAsJsonAsync($"/api/coop/{sessionId}/answer", new { answer = answers[2] });
        finalResponse.EnsureSuccessStatusCode();
        using var finalJson = JsonDocument.Parse(await finalResponse.Content.ReadAsStringAsync());
        Assert.True(finalJson.RootElement.GetProperty("completed").GetBoolean());
        Assert.Equal(24, finalJson.RootElement.GetProperty("xp_awarded").GetInt32());
        Assert.Equal(4, finalJson.RootElement.GetProperty("breakdown").GetProperty("group_bonus").GetInt32());

        foreach (var token in tokens)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            using var meResponse = await client.GetAsync("/api/me");
            meResponse.EnsureSuccessStatusCode();
            using var meJson = JsonDocument.Parse(await meResponse.Content.ReadAsStringAsync());
            Assert.Equal(24, meJson.RootElement.GetProperty("lifetimeXp").GetInt32());
        }
    }

    private static async Task<string> RegisterAsync(HttpClient client, string name, string email, string universityId, bool visitedMuseumLast12Months)
    {
        using var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            name,
            email,
            password = "test-password-2026",
            universityId,
            avatarId = "nizami",
            visitedMuseumLast12Months,
        });
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("token").GetString()!;
    }

    private static string DecodeUserId(string token)
    {
        var payload = token.Split('.')[1];
        payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
        using var json = JsonDocument.Parse(Convert.FromBase64String(payload.Replace('-', '+').Replace('_', '/')));
        return json.RootElement.GetProperty("sub").GetString()!;
    }

    private static RateLimitPartition<string> TestRateLimit() => RateLimitPartition.GetFixedWindowLimiter(
        "test", _ => new FixedWindowRateLimiterOptions { PermitLimit = 100, Window = TimeSpan.FromMinutes(1) });

    private sealed class TestApi(SqliteConnection connection, DbContextOptions<AppDbContext> dbOptions, WebApplication app, HttpClient client) : IAsyncDisposable
    {
        public HttpClient Client { get; } = client;
        public AppDbContext CreateDb() => new(dbOptions);

        public static async Task<TestApi> StartAsync(int rareFlameChancePercent = 0)
        {
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_SECRET"] = "test-jwt-secret-with-at-least-32-characters",
                ["QR_HMAC_SECRET"] = "test-qr-secret-with-at-least-32-characters",
                ["DEMO_MODE"] = "true",
                ["ADMIN_TOKEN"] = AdminToken,
                ["GAME_STORY:RareFlameChancePercent"] = rareFlameChancePercent.ToString(System.Globalization.CultureInfo.InvariantCulture),
            }).Build();

            var connection = new SqliteConnection("Data Source=:memory:");
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

            var app = builder.Build();
            app.UseRateLimiter();
            app.MapChiraqApi();
            await app.StartAsync();
            var addresses = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!;
            return new TestApi(connection, dbOptions, app, new HttpClient { BaseAddress = new Uri(addresses.Addresses.Single()) });
        }

        public async ValueTask DisposeAsync()
        {
            Client.Dispose();
            await app.StopAsync();
            await app.DisposeAsync();
            await connection.DisposeAsync();
        }
    }
}
