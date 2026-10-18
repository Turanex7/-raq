using Chiraq.Api;
using Chiraq.Api.Data;
using Chiraq.Api.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Chiraq.Api.Tests;

public sealed class GameRulesTests
{
    [Fact]
    public void SeasonBoundaryStartsMondayAtMidnightInBaku()
    {
        var monday = DateTimeOffset.Parse("2026-10-19T00:00:00+04:00");
        var season = GameRules.CurrentSeason(monday);
        Assert.Equal(DateTimeOffset.Parse("2026-10-18T20:00:00Z"), season.StartUtc);
        Assert.Equal(TimeSpan.FromDays(7), season.EndUtc - season.StartUtc);
    }

    [Fact]
    public void SeasonOnSaturdayStillUsesThatWeeksMondayBoundary()
    {
        var saturday = DateTimeOffset.Parse("2026-10-17T17:30:00+04:00");
        var season = GameRules.CurrentSeason(saturday);
        Assert.Equal(DateTimeOffset.Parse("2026-10-11T20:00:00Z"), season.StartUtc);
    }

    [Fact]
    public void PreviousWeekMultiplierIsCappedAndAppliesOnlyToPassedBaseXp()
    {
        Assert.Equal(44, GameRules.BaseXp(40, 1));
        Assert.Equal(42, GameRules.BaseXp(40, 2));
        Assert.Equal(11, GameRules.BaseXp(10, 1));
    }

    [Fact]
    public void WrongQuizAnswerReceivesPartialXpWithoutPenalty()
    {
        Assert.Equal(8, GameRules.QuizXp(20, false));
        Assert.Equal(20, GameRules.QuizXp(20, true));
    }

    [Fact]
    public void UniversityScoreUsesActiveTopMembersAndMinimum()
    {
        var full = GameRules.UniversityFairScore([500, 400, 300, 0]);
        Assert.Equal(3, full.Participants);
        Assert.Equal(400, full.Score);
        Assert.True(full.Eligible);

        var small = GameRules.UniversityFairScore([20, 10, 0]);
        Assert.Equal(2, small.Participants);
        Assert.Equal(15, small.Score);
        Assert.False(small.Eligible);
    }

    [Fact]
    public void CheckinRequiresBothDistanceAndReportedAccuracyWithinRadius()
    {
        Assert.True(GameRules.IsInsideRadius(25, 10, 50));
        Assert.False(GameRules.IsInsideRadius(51, 5, 50));
        Assert.False(GameRules.IsInsideRadius(25, 51, 50));
    }

    [Fact]
    public void GroupBonusUsesDistinctMemberTierAndBaseXpOnly()
    {
        Assert.Equal(0, GameRules.GroupBonusXp(100, 2));
        Assert.Equal(20, GameRules.GroupBonusXp(100, 3));
        Assert.Equal(30, GameRules.GroupBonusXp(100, 4));
        Assert.Equal(40, GameRules.GroupBonusXp(100, 5));
    }

    [Fact]
    public async Task GroupBonusLedgerAllowsAtMostOneEntryPerMemberPlaceAndSeason()
    {
        await using var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        await using var db = new AppDbContext(options);
        await db.Database.MigrateAsync();

        db.XpEvents.Add(new XpEvent { UserId = "user-1", SeasonId = "week-1", PlaceId = "place-1", Kind = "group_bonus", Amount = 20 });
        await db.SaveChangesAsync();
        db.XpEvents.Add(new XpEvent { UserId = "user-1", SeasonId = "week-1", PlaceId = "place-1", Kind = "group_bonus", Amount = 20 });

        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public void CoopRequiresTheConfiguredNumberOfDistinctParticipants()
    {
        Assert.False(GameRules.CoopReady(2, 3));
        Assert.True(GameRules.CoopReady(3, 3));
        Assert.False(GameRules.CoopReady(3, 0));
    }

    [Fact]
    public void TerritoryUsesMeanXpPerVisitor()
    {
        Assert.Equal(40, GameRules.TerritoryPerCapitaScore([20, 60]));
        Assert.Equal(0, GameRules.TerritoryPerCapitaScore([0, -10]));
    }

    [Fact]
    public void TerritoryUsesFirstArrivalToBreakScoreTiesAndMarksOnlySimultaneousTies()
    {
        var first = DateTimeOffset.Parse("2026-10-17T10:00:00Z");
        var later = first.AddMinutes(1);
        var earlierWins = TerritoryRules.Rank([
            new TerritoryLedgerEntry("ada", "ada-1", 10, later),
            new TerritoryLedgerEntry("bdu", "bdu-1", 10, first),
        ]);
        Assert.Equal("bdu", earlierWins[0].UniversityId);
        Assert.False(earlierWins[0].Tied);

        var simultaneous = TerritoryRules.Rank([
            new TerritoryLedgerEntry("ada", "ada-1", 10, first),
            new TerritoryLedgerEntry("bdu", "bdu-1", 10, first),
        ]);
        Assert.All(simultaneous, row => Assert.True(row.Tied));
    }

    [Fact]
    public void VelocityCheckFlagsOnlyImpossibleTravel()
    {
        Assert.True(GameRules.IsImpossibleTravel(20_000, 0.1));
        Assert.False(GameRules.IsImpossibleTravel(20_000, 1));
        Assert.False(GameRules.IsImpossibleTravel(20_000, 0));
    }

    [Fact]
    public void QrSignatureIsBoundToPlaceTaskAndVersion()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["QR_HMAC_SECRET"] = "test-qr-secret-with-at-least-32-characters",
            ["JWT_SECRET"] = "test-jwt-secret-with-at-least-32-characters",
        }).Build();
        var tokens = new Tokens(config);
        var qr = tokens.QrToken("carpet-museum", "visit", 1);
        Assert.True(tokens.VerifyQr(qr, "carpet-museum", "visit", 1));
        Assert.False(tokens.VerifyQr(qr, "carpet-museum", "quiz", 1));
        Assert.False(tokens.VerifyQr(qr, "carpet-museum", "visit", 2));
    }

    [Fact]
    public async Task SeasonRolloverCanRunTwiceWithoutDuplicateSnapshotsOrResults()
    {
        await using var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        await using var db = new AppDbContext(options);
        await db.Database.EnsureCreatedAsync();
        var now = DateTimeOffset.UtcNow;
        var currentWeek = GameRules.CurrentSeason(now);
        var season = new Season { Id = $"season-{currentWeek.StartUtc:yyyyMMdd}", StartsAtUtc = currentWeek.StartUtc, EndsAtUtc = now.AddDays(1), Theme = "Test" };
        db.Seasons.Add(season);
        await db.SaveChangesAsync();

        await ApiRoutes.FinalizeSeasonAsync(db, season, demoOverride: true);
        await ApiRoutes.FinalizeSeasonAsync(db, season, demoOverride: true);

        Assert.True(season.Finalized);
        Assert.Equal(2, await db.Seasons.CountAsync());
        Assert.NotEqual(season.Id, (await db.Seasons.SingleAsync(x => x.Id != season.Id)).Id);
        Assert.Empty(await db.SeasonResults.ToListAsync());
        Assert.Empty(await db.TerritorySnapshots.ToListAsync());
    }

    [Fact]
    public async Task SeededWeeklyXpStaysWithinTheConfiguredAchievableEconomy()
    {
        await using var connection = new Microsoft.Data.Sqlite.SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        await using var db = new AppDbContext(options);
        var configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
        await DbSeeder.InitializeAsync(db, configuration);
        var season = await db.Seasons.SingleAsync();
        var baseTaskXp = await db.Tasks.Where(x => x.Type != "coop").SumAsync(x => x.Xp);
        var achievableCeiling = (int)Math.Ceiling(baseTaskXp * (1 + GameRules.MaximumWeekMultiplier - 1 + GameRules.GroupMultipliers[^1] - 1)) + GameRules.FirstVisitXp;
        var seedUsers = await db.Users.Where(x => x.Id.StartsWith("seed-")).ToListAsync();

        Assert.Equal(40, seedUsers.Select(x => x.Name).Distinct().Count());
        Assert.All(seedUsers, user => Assert.True(user.IsDemo));
        var universityCounts = seedUsers.GroupBy(x => x.UniversityId).Select(group => group.Count()).ToArray();
        Assert.Contains("bdu", seedUsers.Select(x => x.UniversityId));
        Assert.Contains("ada", seedUsers.Select(x => x.UniversityId));
        Assert.Contains("unec", seedUsers.Select(x => x.UniversityId));
        Assert.Contains("aztu", seedUsers.Select(x => x.UniversityId));
        Assert.Contains("adnsu", seedUsers.Select(x => x.UniversityId));
        Assert.Contains("khazar", seedUsers.Select(x => x.UniversityId));
        Assert.NotEqual(universityCounts[0], universityCounts[^1]);
        foreach (var user in seedUsers)
        {
            var xp = await db.XpEvents.Where(x => x.UserId == user.Id && x.SeasonId == season.Id).SumAsync(x => x.Amount);
            Assert.InRange(xp, 0, achievableCeiling);
        }

        var allPlaces = await db.Places.ToListAsync();
        foreach (var place in allPlaces)
        {
            var placeLedger = await db.XpEvents.Where(x => x.SeasonId == season.Id && x.PlaceId == place.Id)
                .Join(db.Users, xp => xp.UserId, user => user.Id, (xp, user) => new TerritoryLedgerEntry(user.UniversityId, xp.UserId, xp.Amount, xp.CreatedAtUtc))
                .ToListAsync();
            var placeRanking = TerritoryRules.Rank(placeLedger);
            Assert.DoesNotContain(placeRanking, row => row.Tied);
            for (var index = 1; index < placeRanking.Count; index++)
                Assert.NotEqual(placeRanking[index - 1].Score, placeRanking[index].Score);
        }

        var museums = allPlaces.Where(x => x.Type == "museum").ToList();
        Assert.All(await db.Tasks.ToListAsync(), task => Assert.True(task.NeedsReview, $"{task.Id} must be reviewed before publication."));
        Assert.True(museums.Count >= 6);
        var owners = new HashSet<string>(StringComparer.Ordinal);
        foreach (var museum in museums)
        {
            var ledger = await db.XpEvents.Where(x => x.SeasonId == season.Id && x.PlaceId == museum.Id)
                .Join(db.Users, xp => xp.UserId, user => user.Id, (xp, user) => new TerritoryLedgerEntry(user.UniversityId, xp.UserId, xp.Amount, xp.CreatedAtUtc))
                .ToListAsync();
            var ranking = TerritoryRules.Rank(ledger);
            Assert.True(ranking.Count >= (museum.Slug == "carpet-museum" ? 1 : 2));
            if (ranking.Count > 1) Assert.True(ranking[0].Score > ranking[1].Score, $"{museum.Name} should have a nonzero territory gap.");
            owners.Add(ranking[0].UniversityId);
            if (museum.Slug == "carpet-museum")
            {
                Assert.Equal("adnsu", ranking[0].UniversityId);
                Assert.Equal(8, ranking[0].Score);
                Assert.Single(ranking);
            }
            if (museum.Slug == "national-history")
            {
                Assert.Equal(12, ranking[0].Score - ranking[1].Score);
            }
            if (museum.Slug == "heydar-aliyev")
            {
                Assert.Equal(4, ranking[0].Score - ranking[1].Score);
            }
            if (museum.Slug == "modern-art")
            {
                Assert.Equal(7, ranking[0].Score - ranking[1].Score);
            }
            if (museum.Slug == "literature-museum")
            {
                Assert.Equal(15, ranking[0].Score - ranking[1].Score);
            }
        }
        Assert.True(owners.Count >= 4);

        var weeklyRows = await db.XpEvents.Where(x => x.SeasonId == season.Id)
            .Join(db.Users, xp => xp.UserId, user => user.Id, (xp, user) => new { user.UniversityId, xp.UserId, xp.Amount })
            .ToListAsync();
        var leagueRows = weeklyRows.GroupBy(x => x.UniversityId).Select(university =>
        {
            var members = university.GroupBy(x => x.UserId).Select(member => member.Sum(x => x.Amount)).ToArray();
            return GameRules.UniversityFairScore(members);
        }).ToArray();
        Assert.True(leagueRows.Count(x => x.Eligible) >= 4);
        Assert.All(leagueRows.Where(x => x.Eligible), row => Assert.True(row.Participants >= GameRules.UniversityMinimumActive));
    }
}
