using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Chiraq.Api.Data;
using Chiraq.Api.Security;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Chiraq.Api;

public static class ApiRoutes
{
    public static async Task FinalizeSeasonAsync(AppDbContext db, Season active, bool demoOverride = false)
    {
        if (active.Finalized) return;
        var rows = await RankedUsers(db, active.Id);
        var rank = 0;
        foreach (var row in rows.Where(x => x.Xp > 0))
        {
            rank++;
            var flagged = await db.ActivityFlags.AnyAsync(x => x.UserId == row.User.Id);
            db.SeasonResults.Add(new SeasonResult { SeasonId = active.Id, UserId = row.User.Id, Rank = rank, WeeklyXp = row.Xp, PrizeEligible = !flagged && row.User.PrizeEligible });
        }
        foreach (var place in await db.Places.ToListAsync())
        {
            var owner = await TerritoryOwner(db, active.Id, place.Id);
            var university = (string?)owner?.GetType().GetProperty("university_id")?.GetValue(owner);
            var score = (int?)owner?.GetType().GetProperty("score")?.GetValue(owner);
            if (university is not null && score.HasValue && !await db.TerritorySnapshots.AnyAsync(x => x.SeasonId == active.Id && x.PlaceId == place.Id && x.Final))
                db.TerritorySnapshots.Add(new TerritorySnapshot { SeasonId = active.Id, PlaceId = place.Id, UniversityId = university, Score = score.Value, Final = true });
        }
        active.Finalized = true;
        var now = DateTimeOffset.UtcNow;
        var schedule = GameRules.CurrentSeason(now);
        var nextId = $"season-{schedule.StartUtc:yyyyMMdd}";
        var next = await db.Seasons.FindAsync(nextId);
        if (next is null)
        {
            var start = demoOverride ? now : schedule.StartUtc;
            var end = demoOverride ? now.AddDays(7) : schedule.EndUtc;
            next = new Season { Id = nextId, StartsAtUtc = start, EndsAtUtc = end.AddTicks(-1), Theme = "Şəhər həftəsi" };
            db.Seasons.Add(next);
            foreach (var place in await db.Places.ToListAsync())
                db.Souvenirs.Add(new Souvenir { Id = $"souvenir-{nextId}-{place.Slug}", PlaceId = place.Id, SeasonId = nextId, Name = place.Name, Rarity = place.Rarity });
        }
        await db.SaveChangesAsync();
    }

    public static void MapChiraqApi(this WebApplication app)
    {
        var api = app.MapGroup("/api");
        api.MapGet("/config", () => Results.Ok(new
        {
            level_xp = GameRules.LevelXp,
            outdoor_pin_xp = GameRules.OutdoorPinXp,
            difficulty_xp = new { easy = GameRules.DifficultyXp[0], medium = GameRules.DifficultyXp[1], hard = GameRules.DifficultyXp[2] },
            university_ranking = new { top_members = GameRules.UniversityTopMembers, minimum_active = GameRules.UniversityMinimumActive },
            group_bonus = new { minimum_members = GameRules.GroupBonusMinimumMembers, window_minutes = GameRules.GroupBonusWindowMinutes, multipliers = GameRules.GroupMultipliers },
            maximum_week_multiplier = GameRules.MaximumWeekMultiplier,
            time_zone = GameRules.TimeZoneId,
        }));
        api.MapGet("/universities", async (AppDbContext db) => Results.Ok(await db.Universities.OrderBy(x => x.Name).Select(x => new { x.Id, x.Name, shortName = x.ShortName }).ToListAsync()));
        api.MapGet("/avatars", async (AppDbContext db) => Results.Ok(await db.Avatars.OrderBy(x => x.UnlockLevel).Select(x => new { x.Id, x.Name, unlock_level = x.UnlockLevel, illustration = x.Illustration }).ToListAsync()));
        api.MapPost("/auth/register", Register).RequireRateLimiting("auth");
        api.MapPost("/auth/login", Login).RequireRateLimiting("auth");
        api.MapGet("/me", GetMe);
        api.MapPatch("/me", PatchMe);
        api.MapGet("/places", GetPlaces);
        api.MapGet("/places/{slug}", GetPlace);
        api.MapGet("/seasons/current", GetSeason);
        api.MapPost("/checkins", Checkin).RequireRateLimiting("checkin");
        api.MapPost("/tasks/{id}/complete", CompleteTask).RequireRateLimiting("complete");
        api.MapGet("/leaderboard", GetLeaderboard);
        api.MapGet("/territories", GetTerritories);
        api.MapPost("/groups", CreateGroup);
        api.MapPost("/groups/join", JoinGroup);
        api.MapGet("/groups/me", GetGroups);
        api.MapPost("/coop/{taskId}/join", JoinCoop).RequireRateLimiting("complete");
        api.MapGet("/coop/{sessionId}", GetCoop);
        api.MapGet("/me/collection", GetCollection);
        api.MapGet("/rewards/current", GetRewards);
        api.MapPost("/rewards/claim", ClaimReward);
        api.MapGet("/me/share-card", GetShareCard);
        api.MapGet("/admin/metrics", GetMetrics);
        api.MapPost("/admin/demo/simulate-activity", SimulateActivity).RequireRateLimiting("complete");
        api.MapPost("/admin/demo/advance-week", AdvanceWeek);
        api.MapGet("/dev/qr-sheet", GetQrSheet);
        api.MapGet("/demo/qr/{taskId}", GetDemoQr);
    }

    private static IResult Fail(int status, string code, string message) => Results.Json(new { error = new { code, message } }, statusCode: status);
    private static string? UserId(HttpContext context, Tokens tokens) => tokens.Validate(context.Request.Headers.Authorization.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase), DateTimeOffset.UtcNow);
    private static async Task<Season?> ActiveSeason(AppDbContext db, DateTimeOffset now) => await db.Seasons.FirstOrDefaultAsync(x => !x.Finalized && x.StartsAtUtc <= now && x.EndsAtUtc >= now);
    private static async Task<AppUser?> CurrentUser(HttpContext context, AppDbContext db, Tokens tokens)
    {
        var id = UserId(context, tokens);
        return id is null ? null : await db.Users.FindAsync(id);
    }
    private static async Task<int> XpFor(AppDbContext db, string userId, string? seasonId = null)
    {
        var rows = db.XpEvents.Where(x => x.UserId == userId);
        if (seasonId is not null) rows = rows.Where(x => x.SeasonId == seasonId);
        return await rows.SumAsync(x => (int?)x.Amount) ?? 0;
    }
    private static async Task<int> PreviousRank(AppDbContext db, string universityId)
    {
        var previous = await db.Seasons.Where(x => x.Finalized).OrderByDescending(x => x.EndsAtUtc).FirstOrDefaultAsync();
        if (previous is null) return 99;
        var events = await db.XpEvents.Where(x => x.SeasonId == previous.Id)
            .Join(db.Users, xp => xp.UserId, user => user.Id, (xp, user) => new { user.UniversityId, xp.UserId, xp.Amount }).ToListAsync();
        var scores = events.GroupBy(x => x.UniversityId).Select(group => new
        {
            Id = group.Key,
            Score = GameRules.UniversityFairScore(group.GroupBy(x => x.UserId).Select(member => member.Sum(x => x.Amount))).Score,
            Count = group.Select(x => x.UserId).Distinct().Count(),
        }).Where(x => x.Count >= GameRules.UniversityMinimumActive).OrderByDescending(x => x.Score).ToList();
        var index = scores.FindIndex(x => x.Id == universityId);
        return index < 0 ? 99 : index + 1;
    }

    private static async Task<IResult> Register(RegisterRequest request, AppDbContext db, Tokens tokens)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length is < 2 or > 50) return Fail(400, "invalid_name", "Ad 2–50 simvol olmalıdır.");
        if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 || !request.Email.Contains('@')) return Fail(400, "invalid_email", "Düzgün e-poçt ünvanı daxil et.");
        if (request.Password is null || request.Password.Length is < 10 or > 128) return Fail(400, "invalid_password", "Şifrə ən azı 10 simvol olmalıdır.");
        if (await db.Users.AnyAsync(x => x.Email == request.Email.Trim().ToLowerInvariant())) return Fail(409, "email_in_use", "Bu e-poçt artıq qeydiyyatdan keçib.");
        var university = await db.Universities.FindAsync(request.UniversityId);
        if (university is null) return Fail(400, "invalid_university", "Universitet siyahısından seçim et.");
        var avatar = await db.Avatars.FindAsync(string.IsNullOrWhiteSpace(request.AvatarId) ? "nizami" : request.AvatarId);
        if (avatar is null || avatar.UnlockLevel > 1) return Fail(400, "avatar_locked", "Bu avatar hələ açılmayıb.");
        var user = new AppUser
        {
            Name = request.Name.Trim(), Email = request.Email.Trim().ToLowerInvariant(), PasswordHash = Tokens.HashPassword(request.Password),
            UniversityId = university.Id, AvatarId = avatar.Id, VisitedMuseumLast12Months = request.VisitedMuseumLast12Months,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Results.Ok(new { token = tokens.Issue(user.Id, DateTimeOffset.UtcNow), user = await UserView(db, user, null) });
    }

    private static async Task<IResult> Login(LoginRequest request, AppDbContext db, Tokens tokens)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password)) return Fail(400, "credentials_required", "E-poçt və şifrəni daxil et.");
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == request.Email.Trim().ToLowerInvariant());
        if (user is null || !Tokens.VerifyPassword(request.Password, user.PasswordHash)) return Fail(401, "invalid_credentials", "E-poçt və ya şifrə yanlışdır.");
        return Results.Ok(new { token = tokens.Issue(user.Id, DateTimeOffset.UtcNow), user = await UserView(db, user, null) });
    }

    private static async Task<object> UserView(AppDbContext db, AppUser user, string? seasonId)
    {
        var uni = await db.Universities.FindAsync(user.UniversityId);
        return new { user.Id, user.Name, user.Email, university = uni?.Name, universityId = user.UniversityId, user.AvatarId,
            user.VisitedMuseumLast12Months, user.FirstMuseumVisitCompleted, lifetimeXp = await XpFor(db, user.Id), weeklyXp = await XpFor(db, user.Id, seasonId),
            level = (await XpFor(db, user.Id)) / GameRules.LevelXp + 1 };
    }

    private static async Task<IResult> GetMe(HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Daxil ol və yenidən cəhd et.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        return Results.Ok(await UserView(db, user, season?.Id));
    }

    private static async Task<IResult> PatchMe(ProfilePatch request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Daxil ol və yenidən cəhd et.");
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            if (request.Name.Trim().Length is < 2 or > 50) return Fail(400, "invalid_name", "Ad 2–50 simvol olmalıdır.");
            user.Name = request.Name.Trim();
        }
        if (request.AvatarId is not null)
        {
            var avatar = await db.Avatars.FindAsync(request.AvatarId);
            if (avatar is null || avatar.UnlockLevel > (await XpFor(db, user.Id)) / GameRules.LevelXp + 1) return Fail(400, "avatar_locked", "Bu avatar hələ açılmayıb.");
            user.AvatarId = avatar.Id;
        }
        await db.SaveChangesAsync();
        return Results.Ok(await UserView(db, user, (await ActiveSeason(db, DateTimeOffset.UtcNow))?.Id));
    }

    private static async Task<IResult> GetSeason(AppDbContext db)
    {
        var now = DateTimeOffset.UtcNow;
        var season = await ActiveSeason(db, now);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm məlumatı əlçatan deyil.");
        return Results.Ok(new { season.Id, start = season.StartsAtUtc, end = season.EndsAtUtc, season.Theme, seconds_remaining = Math.Max(0, (long)(season.EndsAtUtc - now).TotalSeconds), time_zone = GameRules.TimeZoneId });
    }

    private static async Task<IResult> GetPlaces(AppDbContext db, HttpContext http, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        var places = await db.Places.OrderBy(x => x.Name).ToListAsync();
        var result = new List<object>();
        foreach (var place in places)
        {
            var owner = season is null ? null : await TerritoryOwner(db, season.Id, place.Id);
            var completions = user is null || season is null ? [] : await db.TaskCompletions.Where(x => x.UserId == user.Id && x.SeasonId == season.Id).Join(db.Tasks, x => x.TaskId, t => t.Id, (x, t) => t.PlaceId).Where(x => x == place.Id).ToListAsync();
            var tasks = await db.Tasks.CountAsync(x => x.PlaceId == place.Id);
            var xp = season is null ? 0 : await db.XpEvents.Where(x => x.SeasonId == season.Id && x.PlaceId == place.Id).SumAsync(x => (int?)x.Amount) ?? 0;
            result.Add(new { place.Id, place.Slug, place.Type, place.Name, district = place.District, place.Description, lat = place.Latitude, lng = place.Longitude, radius_m = place.RadiusMeters, status = place.IsOpen ? "open" : "locked", task_count = tasks, completed_count = completions.Count, xp_total = xp, territory_owner = owner });
        }
        return Results.Ok(result);
    }

    private static async Task<IResult> GetPlace(string slug, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var place = await db.Places.FirstOrDefaultAsync(x => x.Slug == slug);
        if (place is null) return Fail(404, "place_not_found", "Məkan tapılmadı.");
        var user = await CurrentUser(http, db, tokens);
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        var tasks = await db.Tasks.Where(x => x.PlaceId == place.Id).OrderBy(x => x.Difficulty).ToListAsync();
        var statuses = new List<object>();
        foreach (var task in tasks)
        {
            var completed = user is not null && season is not null && await db.TaskCompletions.AnyAsync(x => x.UserId == user.Id && x.TaskId == task.Id && x.SeasonId == season.Id);
            object? payload = null;
            if (task.Type is "quiz" or "vote")
            {
                using var json = JsonDocument.Parse(task.Payload);
                var root = json.RootElement;
                var question = root.TryGetProperty("question", out var questionNode) ? questionNode.GetString() : null;
                var choices = root.TryGetProperty("choices", out var choicesNode) ? choicesNode.EnumerateArray().Select(x => x.GetString()).ToArray() : Array.Empty<string?>();
                payload = new { question, choices };
            }
            statuses.Add(new { task.Id, task.Code, task.Title, task.Description, task.Type, task.Difficulty, task.Xp, task.CoopSize, task.NeedsReview, completed, payload });
        }
        return Results.Ok(new { place.Id, place.Slug, place.Type, place.Name, place.District, place.Description, place.Latitude, place.Longitude, place.RadiusMeters, status = place.IsOpen ? "open" : "locked", territory = season is null ? null : await TerritoryOwner(db, season.Id, place.Id), group_bonus = await GroupBonusStatus(db, user, season?.Id, place.Id), tasks = statuses });
    }

    private static async Task<object> GroupBonusStatus(AppDbContext db, AppUser? user, string? seasonId, string placeId)
    {
        var currentMembers = 0;
        if (user is not null && seasonId is not null)
        {
            var groupIds = await db.GroupMembers.Where(x => x.UserId == user.Id).Select(x => x.GroupId).ToListAsync();
            foreach (var groupId in groupIds)
            {
                var memberIds = await db.GroupMembers.Where(x => x.GroupId == groupId).Select(x => x.UserId).ToListAsync();
                var participating = await db.TaskCompletions.Where(x => memberIds.Contains(x.UserId) && x.SeasonId == seasonId && x.CompletedAtUtc >= DateTimeOffset.UtcNow.AddMinutes(-GameRules.GroupBonusWindowMinutes))
                    .Join(db.Tasks.Where(x => x.PlaceId == placeId), completion => completion.TaskId, task => task.Id, (completion, _) => completion.UserId)
                    .Distinct().CountAsync();
                currentMembers = Math.Max(currentMembers, Math.Min(5, participating));
            }
        }
        var tierMembers = Math.Clamp(Math.Max(currentMembers, GameRules.GroupBonusMinimumMembers), 2, 5);
        var multiplier = GameRules.GroupMultipliers[tierMembers - 2];
        var alreadyAwarded = user is not null && seasonId is not null && await db.XpEvents.AnyAsync(x => x.UserId == user.Id && x.SeasonId == seasonId && x.PlaceId == placeId && x.Kind == "group_bonus");
        var earnedXp = user is not null && seasonId is not null ? await db.XpEvents.Where(x => x.UserId == user.Id && x.SeasonId == seasonId && x.PlaceId == placeId && x.Kind == "group_bonus").SumAsync(x => (int?)x.Amount) ?? 0 : 0;
        return new
        {
            minimum_members = GameRules.GroupBonusMinimumMembers,
            current_members = currentMembers,
            members_needed = Math.Max(0, GameRules.GroupBonusMinimumMembers - currentMembers),
            multiplier,
            window_minutes = GameRules.GroupBonusWindowMinutes,
            already_awarded = alreadyAwarded,
            earned_xp = earnedXp,
        };
    }

    private static async Task<object?> TerritoryOwner(AppDbContext db, string seasonId, string placeId)
    {
        var events = await db.XpEvents.Where(x => x.SeasonId == seasonId && x.PlaceId == placeId)
            .Join(db.Users, x => x.UserId, u => u.Id, (x, u) => new { u.UniversityId, x.UserId, x.Amount }).ToListAsync();
        var scores = events.GroupBy(x => x.UniversityId).Select(group => new
        {
            UniversityId = group.Key,
            Score = (int)Math.Round(group.Sum(row => row.Amount) / (double)group.Select(row => row.UserId).Distinct().Count()),
            Visitors = group.Select(row => row.UserId).Distinct().Count(),
        }).OrderByDescending(x => x.Score).ThenBy(x => x.UniversityId, StringComparer.Ordinal).ToList();
        if (scores.Count == 0) return null;
        var universites = await db.Universities.ToDictionaryAsync(x => x.Id, x => x.ShortName);
        var top = scores[0];
        var gap = scores.Count > 1 ? Math.Max(0, top.Score - scores[1].Score) : top.Score;
        return new { university_id = top.UniversityId, university = universites.GetValueOrDefault(top.UniversityId, ""), score = top.Score, runner_up_id = scores.Count > 1 ? scores[1].UniversityId : null, runner_up = scores.Count > 1 ? universites.GetValueOrDefault(scores[1].UniversityId, "") : null, runner_up_score = scores.Count > 1 ? scores[1].Score : 0, gap, participant_count = top.Visitors, final = false };
    }

    private static double DistanceMeters(double lat1, double lon1, double lat2, double lon2)
    {
        const double radius = 6_371_000;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return radius * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static async Task AddVelocityFlag(AppDbContext db, string userId, Place place, DateTimeOffset now)
    {
        var previousCheckin = await db.Checkins.Where(x => x.UserId == userId && x.Valid).OrderByDescending(x => x.CreatedAtUtc).FirstOrDefaultAsync();
        var previousTask = await db.TaskCompletions.Where(x => x.UserId == userId).OrderByDescending(x => x.CompletedAtUtc)
            .Join(db.Tasks, completion => completion.TaskId, task => task.Id, (completion, task) => new { completion.CompletedAtUtc, task.PlaceId }).FirstOrDefaultAsync();
        var previousPlaceId = previousCheckin is null || (previousTask is not null && previousTask.CompletedAtUtc > previousCheckin.CreatedAtUtc) ? previousTask?.PlaceId : previousCheckin.PlaceId;
        var previousAt = previousCheckin is null || (previousTask is not null && previousTask.CompletedAtUtc > previousCheckin.CreatedAtUtc) ? previousTask?.CompletedAtUtc : previousCheckin.CreatedAtUtc;
        if (previousPlaceId is null || previousAt is null || previousPlaceId == place.Id) return;
        var oldPlace = await db.Places.FindAsync(previousPlaceId);
        if (oldPlace is null) return;
        var hours = (now - previousAt.Value).TotalHours;
        if (GameRules.IsImpossibleTravel(DistanceMeters(oldPlace.Latitude, oldPlace.Longitude, place.Latitude, place.Longitude), hours))
        {
            db.ActivityFlags.Add(new ActivityFlag { UserId = userId, Reason = "impossible_travel_velocity", CreatedAtUtc = now });
            var user = await db.Users.FindAsync(userId);
            if (user is not null) user.PrizeEligible = false;
        }
    }

    private static async Task<IResult> Checkin(CheckinRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Giriş etdikdən sonra yenidən cəhd et.");
        if (string.IsNullOrWhiteSpace(request.PlaceId) || !double.IsFinite(request.Latitude) || !double.IsFinite(request.Longitude) || !double.IsFinite(request.Accuracy) || request.Latitude is < -90 or > 90 || request.Longitude is < -180 or > 180 || request.Accuracy is < 0 or > 1000)
            return Fail(400, "invalid_location", "Məkan və GPS dəqiqliyi düzgün deyil.");
        var place = await db.Places.FirstOrDefaultAsync(x => x.Id == request.PlaceId || x.Slug == request.PlaceId);
        if (place is null || place.Type != "outdoor") return Fail(404, "outdoor_place_not_found", "Açıq hava pin-i tapılmadı.");
        if (!place.IsOpen) return Fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        if (await db.Checkins.AnyAsync(x => x.UserId == user.Id && x.PlaceId == place.Id && x.SeasonId == season.Id)) return Fail(409, "already_checked_in", "Bu pin üçün bu həftə artıq yoxlama etmisən.");
        if (request.Accuracy > place.RadiusMeters) return Fail(400, "accuracy_too_low", "GPS dəqiqliyi pin radiusu daxilində olmalıdır.");
        var distance = DistanceMeters(request.Latitude, request.Longitude, place.Latitude, place.Longitude);
        var valid = GameRules.IsInsideRadius(distance, request.Accuracy, place.RadiusMeters);
        var now = DateTimeOffset.UtcNow;
        if (await db.Checkins.CountAsync(x => x.UserId == user.Id && x.CreatedAtUtc >= now.AddHours(-1)) >= GameRules.MaximumCheckinsPerHour)
            return Fail(429, "checkin_limit", "Bir saat ərzində pin yoxlamalarının say həddinə çatmısan.");
        await AddVelocityFlag(db, user.Id, place, now);
        if (valid) db.Checkins.Add(new Checkin { UserId = user.Id, PlaceId = place.Id, SeasonId = season.Id, Valid = true, AccuracyMeters = request.Accuracy, CreatedAtUtc = now });
        else
        {
            db.ActivityFlags.Add(new ActivityFlag { UserId = user.Id, Reason = "outdoor_checkin_outside_radius", CreatedAtUtc = now });
            user.PrizeEligible = false;
        }
        await db.SaveChangesAsync();
        // Raw coordinates are deliberately discarded after validation.
        return Results.Ok(new { valid, place_id = place.Id, accuracy_m = request.Accuracy, radius_m = place.RadiusMeters, checked_at_utc = now });
    }

    private static async Task<IResult> CompleteTask(string id, TaskCompleteRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Giriş etdikdən sonra yenidən cəhd et.");
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return Fail(404, "task_not_found", "Tapşırıq tapılmadı.");
        var place = await db.Places.FindAsync(task.PlaceId);
        if (place is null) return Fail(404, "place_not_found", "Məkan tapılmadı.");
        if (!place.IsOpen) return Fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
        if (task.Type == "coop") return Fail(409, "coop_required", "Bu tapşırığı ko-op sessiyasında tamamla.");
        var now = DateTimeOffset.UtcNow;
        var season = await ActiveSeason(db, now);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        if (await db.TaskCompletions.AnyAsync(x => x.UserId == user.Id && x.TaskId == task.Id && x.SeasonId == season.Id)) return Fail(409, "already_completed", "Bu tapşırıq üçün XP-ni artıq qazanmısan.");
        if (await db.TaskCompletions.CountAsync(x => x.UserId == user.Id && x.CompletedAtUtc >= now.AddHours(-1)) >= GameRules.MaximumCompletionsPerHour)
            return Fail(429, "completion_limit", "Bir saat ərzində tapşırıqların say həddinə çatmısan.");
        if (place.Type == "outdoor" && !await db.Checkins.AnyAsync(x => x.UserId == user.Id && x.PlaceId == place.Id && x.SeasonId == season.Id && x.Valid))
            return Fail(403, "checkin_required", "Əvvəl pin radiusunda GPS yoxlamasını tamamla.");
        if (place.Type == "museum" && task.Type != "qr_scan" && !await db.TaskCompletions.AnyAsync(x => x.UserId == user.Id && x.SeasonId == season.Id && db.Tasks.Any(qr => qr.Id == x.TaskId && qr.PlaceId == place.Id && qr.Type == "qr_scan")))
            return Fail(403, "museum_qr_required", "Əvvəl muzeydəki QR kodunu oxut.");

        JsonDocument? payload = null;
        try { payload = JsonDocument.Parse(task.Payload); } catch (JsonException) { }
        var root = payload?.RootElement;
        var correct = true;
        string? correctAnswer = null;
        string? fact = null;
        if (task.Type == "qr_scan")
        {
            if (string.IsNullOrWhiteSpace(request.QrToken) || !tokens.VerifyQr(request.QrToken, place.Slug, task.Code, place.QrSecretVersion))
            {
                payload?.Dispose();
                return Fail(403, "invalid_qr", "QR kodunun imzası düzgün deyil.");
            }
        }
        if (task.Type == "quiz")
        {
            var expected = root?.TryGetProperty("answer", out var answerNode) == true ? answerNode.GetString() ?? "" : "";
            fact = root?.TryGetProperty("fact", out var factNode) == true ? factNode.GetString() : null;
            correctAnswer = expected;
            if (string.IsNullOrWhiteSpace(request.Answer)) { payload?.Dispose(); return Fail(400, "answer_required", "Suala cavab daxil et."); }
            correct = NormalizeAnswer(request.Answer) == NormalizeAnswer(expected);
        }
        else if (task.Type == "vote" && string.IsNullOrWhiteSpace(request.Answer))
        {
            payload?.Dispose();
            return Fail(400, "vote_required", "Seçimlərdən birini seç.");
        }

        var beforeOwner = await TerritoryOwner(db, season.Id, place.Id);
        var previousRank = await PreviousRank(db, user.UniversityId);
        var baseXp = task.Type == "quiz" ? GameRules.QuizXp(task.Xp, correct) : task.Xp;
        var multiplierXp = GameRules.BaseXp(baseXp, previousRank) - baseXp;
        var nowForEvent = DateTimeOffset.UtcNow;
        if (request.Latitude.HasValue || request.Longitude.HasValue)
        {
            if (!request.Latitude.HasValue || !request.Longitude.HasValue || request.Latitude is < -90 or > 90 || request.Longitude is < -180 or > 180)
            { payload?.Dispose(); return Fail(400, "invalid_location", "Məkan siqnalı natamamdır."); }
            var distance = DistanceMeters(request.Latitude.Value, request.Longitude.Value, place.Latitude, place.Longitude);
            if (distance > GameRules.SoftGeoFlagMeters)
            {
                db.ActivityFlags.Add(new ActivityFlag { UserId = user.Id, Reason = "location_far_from_place", CreatedAtUtc = nowForEvent });
                user.PrizeEligible = false;
            }
        }
        await AddVelocityFlag(db, user.Id, place, nowForEvent);
        db.TaskCompletions.Add(new TaskCompletion { UserId = user.Id, TaskId = task.Id, SeasonId = season.Id, Correct = correct, CompletedAtUtc = nowForEvent });
        db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = place.Id, TaskId = task.Id, Kind = "base", Amount = baseXp, CreatedAtUtc = nowForEvent });
        if (multiplierXp > 0) db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = place.Id, TaskId = task.Id, Kind = "multiplier", Amount = multiplierXp, CreatedAtUtc = nowForEvent });

        var firstVisitXp = 0;
        if (place.Type == "museum" && !user.FirstMuseumVisitCompleted)
        {
            user.FirstMuseumVisitCompleted = true;
            if (user.VisitedMuseumLast12Months == false)
            {
                firstVisitXp = GameRules.FirstVisitXp;
                db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = place.Id, TaskId = task.Id, Kind = "first_visit", Amount = firstVisitXp, CreatedAtUtc = nowForEvent });
            }
        }
        var souvenir = await db.Souvenirs.FirstOrDefaultAsync(x => x.PlaceId == place.Id && x.SeasonId == season.Id);
        var souvenirDrop = false;
        if (souvenir is not null && !await db.UserSouvenirs.AnyAsync(x => x.UserId == user.Id && x.SouvenirId == souvenir.Id))
        {
            db.UserSouvenirs.Add(new UserSouvenir { UserId = user.Id, SouvenirId = souvenir.Id, EarnedAtUtc = nowForEvent });
            souvenirDrop = true;
        }
        payload?.Dispose();
        await db.SaveChangesAsync();

        var groupBonus = await GrantGroupBonus(db, user.Id, place.Id, season.Id, nowForEvent);
        var total = baseXp + multiplierXp + firstVisitXp + groupBonus;
        var afterOwner = await TerritoryOwner(db, season.Id, place.Id);
        var beforeUniversity = (string?)beforeOwner?.GetType().GetProperty("university_id")?.GetValue(beforeOwner);
        var afterUniversity = (string?)afterOwner?.GetType().GetProperty("university_id")?.GetValue(afterOwner);
        var territoryChanged = afterUniversity is not null && beforeUniversity != afterUniversity && afterUniversity == user.UniversityId;
        var lifetime = await XpFor(db, user.Id);
        var weeklyTotal = await XpFor(db, user.Id, season.Id);
        var level = lifetime / GameRules.LevelXp + 1;
        var oldLevel = (lifetime - total) / GameRules.LevelXp + 1;
        var unlocked = level > oldLevel ? await db.Avatars.Where(x => x.UnlockLevel > oldLevel && x.UnlockLevel <= level).Select(x => new { x.Id, x.Name }).ToListAsync() : [];
        var result = new
        {
            xp_awarded = total,
            breakdown = new { base_xp = baseXp, group_bonus = groupBonus, first_visit = firstVisitXp, multiplier = multiplierXp },
            new_total = lifetime,
            weekly_total = weeklyTotal,
            level,
            level_up = level > oldLevel,
            avatar_unlocked = unlocked,
            souvenir_drop = souvenirDrop ? new { souvenir!.Id, souvenir.Name, souvenir.Rarity } : null,
            territory_change = territoryChanged ? new { message = TerritoryTakeoverMessage(place, beforeOwner), owner = afterOwner } : null,
            correct, correct_answer = correct ? null : correctAnswer, fact = correct ? null : fact,
            prize_eligible = user.PrizeEligible,
        };
        return Results.Ok(result);
    }

    private static string NormalizeAnswer(string value) => value.Trim().Normalize(NormalizationForm.FormKC).ToLowerInvariant().Replace('ə', 'e').Replace('ı', 'i');

    private static string TerritoryTakeoverMessage(Place place, object? previousOwner)
    {
        var previousUniversity = (string?)previousOwner?.GetType().GetProperty("university")?.GetValue(previousOwner);
        var placeName = place.Slug switch
        {
            "carpet-museum" => "Xalça Muzeyini",
            "national-history" => "Milli Tarix Muzeyini",
            _ => $"{place.Name} məkanını",
        };
        return previousUniversity is null
            ? $"{placeName} ilk dəfə fəth etdin!"
            : $"{placeName} {previousUniversity}-dan fəth etdin!";
    }

    private static async Task<int> GrantGroupBonus(AppDbContext db, string userId, string placeId, string seasonId, DateTimeOffset now)
    {
        var memberGroups = await db.GroupMembers.Where(x => x.UserId == userId).Select(x => x.GroupId).ToListAsync();
        foreach (var groupId in memberGroups)
        {
            var members = await db.GroupMembers.Where(x => x.GroupId == groupId).Select(x => x.UserId).ToListAsync();
            if (members.Count < GameRules.GroupBonusMinimumMembers) continue;
            var recent = await db.TaskCompletions.Where(x => members.Contains(x.UserId) && x.SeasonId == seasonId && x.CompletedAtUtc >= now.AddMinutes(-GameRules.GroupBonusWindowMinutes))
                .Join(db.Tasks.Where(x => x.PlaceId == placeId), x => x.TaskId, x => x.Id, (completion, task) => new { completion.UserId, completion.TaskId })
                .ToListAsync();
            var participating = recent.Select(x => x.UserId).Distinct().ToList();
            if (participating.Count < GameRules.GroupBonusMinimumMembers) continue;
            var count = Math.Min(5, participating.Count);
            var bonusForCurrentUser = 0;
            foreach (var participant in participating)
            {
                if (await db.XpEvents.AnyAsync(x => x.UserId == participant && x.SeasonId == seasonId && x.PlaceId == placeId && x.Kind == "group_bonus")) continue;
                var taskIds = recent.Where(x => x.UserId == participant).Select(x => x.TaskId).Distinct().ToArray();
                var earned = await db.XpEvents.Where(x => x.UserId == participant && x.SeasonId == seasonId && x.PlaceId == placeId && x.Kind == "base" && taskIds.Contains(x.TaskId!)).SumAsync(x => (int?)x.Amount) ?? 0;
                var bonus = GameRules.GroupBonusXp(earned, count);
                if (bonus <= 0) continue;
                db.XpEvents.Add(new XpEvent { UserId = participant, SeasonId = seasonId, PlaceId = placeId, Kind = "group_bonus", Amount = bonus, CreatedAtUtc = now });
                if (participant == userId) bonusForCurrentUser = bonus;
            }
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException error) when (error.InnerException is SqliteException { SqliteErrorCode: 19 })
            {
                foreach (var entry in db.ChangeTracker.Entries<XpEvent>().Where(x => x.State == EntityState.Added && x.Entity.Kind == "group_bonus"))
                    entry.State = EntityState.Detached;
                var existing = await db.XpEvents.FirstOrDefaultAsync(x => x.UserId == userId && x.SeasonId == seasonId && x.PlaceId == placeId && x.Kind == "group_bonus");
                if (existing is null) throw;
                return existing.Amount;
            }
            if (bonusForCurrentUser > 0) return bonusForCurrentUser;
        }
        return 0;
    }

    private sealed record RankedUser(AppUser User, int Xp, int Lifetime, int Correct, DateTimeOffset? ReachedAt);
    private sealed record UniversityBoardRow(string UniversityId, int? Rank, string University, string ShortName, int FairScore, int ParticipantCount, int MinimumParticipants, bool Eligible, int TerritoryCount, int? ChangeVsLastWeek, bool Current);
    private static string PublicName(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 1 ? $"{parts[0]} {char.ToUpperInvariant(parts[^1][0])}." : name;
    }

    private static async Task<List<RankedUser>> RankedUsers(AppDbContext db, string seasonId)
    {
        var users = await db.Users.ToListAsync();
        var rows = new List<RankedUser>();
        foreach (var user in users)
        {
            var events = await db.XpEvents.Where(x => x.UserId == user.Id && x.SeasonId == seasonId).ToListAsync();
            var xp = events.Sum(x => x.Amount);
            var correct = await db.TaskCompletions.CountAsync(x => x.UserId == user.Id && x.SeasonId == seasonId && x.Correct);
            rows.Add(new RankedUser(user, xp, await XpFor(db, user.Id), correct, events.Count == 0 ? null : events.Max(x => x.CreatedAtUtc)));
        }
        return rows.OrderByDescending(x => x.Xp).ThenByDescending(x => x.Correct).ThenBy(x => x.ReachedAt ?? DateTimeOffset.MaxValue).ToList();
    }

    private static async Task<IResult> GetLeaderboard(string? scope, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Reytinqə baxmaq üçün daxil ol.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        scope = scope?.ToLowerInvariant() ?? "global";
        if (scope == "league")
        {
            var ranked = await RankedUsers(db, season.Id);
            var universities = await db.Universities.ToListAsync();
            var currentLast = await db.Seasons.Where(x => x.Finalized).OrderByDescending(x => x.EndsAtUtc).FirstOrDefaultAsync();
            var previousRanks = new Dictionary<string, int>(StringComparer.Ordinal);
            if (currentLast is not null)
            {
                var previousXp = await db.XpEvents.Where(x => x.SeasonId == currentLast.Id)
                    .Join(db.Users, x => x.UserId, u => u.Id, (xp, member) => new { member.UniversityId, member.Id, xp.Amount })
                    .GroupBy(x => new { x.UniversityId, x.Id })
                    .Select(group => new { group.Key.UniversityId, WeeklyXp = group.Sum(x => x.Amount) })
                    .ToListAsync();
                var previousLeague = previousXp.GroupBy(x => x.UniversityId)
                    .Select(group => new { UniversityId = group.Key, Fair = GameRules.UniversityFairScore(group.Select(x => x.WeeklyXp)) })
                    .Where(row => row.Fair.Eligible)
                    .OrderByDescending(row => row.Fair.Score)
                    .ThenBy(row => row.UniversityId)
                    .ToList();
                previousRanks = previousLeague.Select((row, index) => (row.UniversityId, Rank: index + 1))
                    .ToDictionary(row => row.UniversityId, row => row.Rank, StringComparer.Ordinal);
            }
            var list = new List<UniversityBoardRow>();
            foreach (var university in universities)
            {
                var activeCount = ranked.Count(x => x.User.UniversityId == university.Id && x.Xp > 0);
                var active = ranked.Where(x => x.User.UniversityId == university.Id && x.Xp > 0).OrderByDescending(x => x.Xp).Take(GameRules.UniversityTopMembers).ToList();
                var fair = GameRules.UniversityFairScore(active.Select(x => x.Xp));
                var eligible = fair.Eligible;
                var score = fair.Score;
                var owned = 0;
                foreach (var place in await db.Places.ToListAsync())
                {
                    var owner = await TerritoryOwner(db, season.Id, place.Id);
                    if ((string?)owner?.GetType().GetProperty("university_id")?.GetValue(owner) == university.Id) owned++;
                }
                list.Add(new UniversityBoardRow(university.Id, null, university.Name, university.ShortName, score, activeCount, GameRules.UniversityMinimumActive, eligible, owned, null, university.Id == user.UniversityId));
            }
            var sorted = list.OrderByDescending(x => x.Eligible).ThenByDescending(x => x.FairScore).ThenBy(x => x.UniversityId).ToList();
            sorted = sorted.Select((row, index) =>
            {
                var rank = row.Eligible ? index + 1 : (int?)null;
                var change = rank.HasValue && previousRanks.TryGetValue(row.UniversityId, out var previousRank) ? previousRank - rank.Value : (int?)null;
                return row with { Rank = rank, ChangeVsLastWeek = change };
            }).ToList();
            var own = ranked.Where(x => x.User.UniversityId == user.UniversityId && x.Xp > 0).Select(x => x.Xp).ToList();
            return Results.Ok(new { scope, rows = sorted, my_rank = own.Count < GameRules.UniversityMinimumActive ? (int?)null : sorted.FindIndex(x => x.Current) + 1, my_message = own.Count < GameRules.UniversityMinimumActive ? "Reytinq üçün kifayət qədər iştirakçı yoxdur" : null, score_formula = $"Top {GameRules.UniversityTopMembers} aktiv üzvün orta həftəlik XP-si" });
        }
        if (scope == "open")
        {
            var groups = await db.Groups.Where(x => x.IsOpenLeague).ToListAsync();
            var users = await RankedUsers(db, season.Id);
            var rows = new List<object>();
            foreach (var group in groups)
            {
                var ids = await db.GroupMembers.Where(x => x.GroupId == group.Id).Select(x => x.UserId).ToListAsync();
                var active = users.Where(x => ids.Contains(x.User.Id) && x.Xp > 0).ToList();
                rows.Add(new { group.Id, group.Name, member_count = ids.Count, fair_score = active.Count == 0 ? 0 : (int)Math.Round(active.Average(x => x.Xp)), active_count = active.Count });
            }
            return Results.Ok(new { scope, rows = rows.OrderByDescending(x => (int)x.GetType().GetProperty("fair_score")!.GetValue(x)!).ToList(), my_rank = (int?)null, my_message = "Hələ açıq liqa qrupuna qoşulmamısan" });
        }
        if (scope is not ("global" or "university")) return Fail(400, "invalid_scope", "scope global, university, league və ya open olmalıdır.");
        var all = await RankedUsers(db, season.Id);
        if (scope == "university") all = all.Where(x => x.User.UniversityId == user.UniversityId).ToList();
        var rank = all.FindIndex(x => x.User.Id == user.Id && x.Xp > 0);
        var rowsUsers = all.Where(x => x.Xp > 0).Select((x, index) => new { rank = index + 1, id = x.User.Id, name = PublicName(x.User.Name), university_id = x.User.UniversityId, weekly_xp = x.Xp, lifetime_xp = x.Lifetime, correct_answers = x.Correct, current = x.User.Id == user.Id }).ToList();
        return Results.Ok(new { scope, rows = rowsUsers, my_rank = rank < 0 ? (int?)null : rank + 1, my_message = rank < 0 ? "Hələ reytinqdə deyilsən" : null });
    }

    private static async Task<IResult> GetTerritories(HttpContext http, AppDbContext db, Tokens tokens)
    {
        if (await CurrentUser(http, db, tokens) is null) return Fail(401, "unauthorized", "Ərazilərə baxmaq üçün daxil ol.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        var places = await db.Places.ToListAsync();
        var items = new List<object>();
        foreach (var place in places)
        {
            items.Add(new { place_id = place.Id, place_slug = place.Slug, place = place.Name, owner = await TerritoryOwner(db, season.Id, place.Id) });
        }
        return Results.Ok(new { provisional = true, rows = items });
    }

    private static async Task<IResult> CreateGroup(GroupRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Qrup yaratmaq üçün daxil ol.");
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length is < 2 or > 40) return Fail(400, "invalid_group_name", "Qrup adı 2–40 simvol olmalıdır.");
        var group = new GameGroup { Name = request.Name.Trim(), OwnerUserId = user.Id, InviteCode = Convert.ToHexString(RandomNumberGenerator.GetBytes(4)), IsOpenLeague = true };
        db.Groups.Add(group);
        db.GroupMembers.Add(new GroupMember { GroupId = group.Id, UserId = user.Id });
        await db.SaveChangesAsync();
        return Results.Created($"/api/groups/me", new { group.Id, group.Name, group.InviteCode, open_league = group.IsOpenLeague, members = new[] { PublicName(user.Name) } });
    }

    private static async Task<IResult> JoinGroup(GroupJoinRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Qrupa qoşulmaq üçün daxil ol.");
        if (string.IsNullOrWhiteSpace(request.InviteCode) || request.InviteCode.Length > 16) return Fail(400, "invalid_invite_code", "Dəvət kodu düzgün deyil.");
        var group = await db.Groups.FirstOrDefaultAsync(x => x.InviteCode == request.InviteCode.Trim().ToUpperInvariant());
        if (group is null) return Fail(404, "group_not_found", "Bu dəvət kodu ilə qrup tapılmadı.");
        if (!await db.GroupMembers.AnyAsync(x => x.GroupId == group.Id && x.UserId == user.Id))
        {
            if (await db.GroupMembers.CountAsync(x => x.GroupId == group.Id) >= 5) return Fail(409, "group_full", "Qrupda ən çox 5 nəfər ola bilər.");
            db.GroupMembers.Add(new GroupMember { GroupId = group.Id, UserId = user.Id });
            await db.SaveChangesAsync();
        }
        return Results.Ok(new { group.Id, group.Name, group.InviteCode, member_count = await db.GroupMembers.CountAsync(x => x.GroupId == group.Id) });
    }

    private static async Task<IResult> GetGroups(HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Qruplara baxmaq üçün daxil ol.");
        var groups = await db.Groups.Where(x => db.GroupMembers.Any(m => m.GroupId == x.Id && m.UserId == user.Id)).ToListAsync();
        var result = new List<object>();
        foreach (var group in groups)
        {
            var members = await db.GroupMembers.Where(x => x.GroupId == group.Id).Join(db.Users, m => m.UserId, u => u.Id, (m, u) => new { id = u.Id, name = PublicName(u.Name), current = u.Id == user.Id }).ToListAsync();
            result.Add(new { group.Id, group.Name, group.InviteCode, open_league = group.IsOpenLeague, members, member_count = members.Count });
        }
        return Results.Ok(result);
    }

    private static async Task<IResult> JoinCoop(string taskId, CoopJoinRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Ko-op tapşırığı üçün daxil ol.");
        var task = await db.Tasks.FindAsync(taskId);
        var place = task is null ? null : await db.Places.FindAsync(task.PlaceId);
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (task is null || task.Type != "coop" || place is null || season is null) return Fail(404, "coop_task_not_found", "Ko-op tapşırığı tapılmadı.");
        if (!tokens.VerifyQr(request.QrToken ?? "", place.Slug, task.Code, place.QrSecretVersion)) return Fail(403, "invalid_qr", "QR kodunun imzası düzgün deyil.");
        var now = DateTimeOffset.UtcNow;
        var session = await db.CoopSessions.Where(x => x.TaskId == task.Id && x.SeasonId == season.Id && !x.Completed && x.ExpiresAtUtc > now).OrderByDescending(x => x.ExpiresAtUtc).FirstOrDefaultAsync();
        if (session is null)
        {
            session = new CoopSession { TaskId = task.Id, SeasonId = season.Id, PlaceId = place.Id, ExpiresAtUtc = now.AddMinutes(GameRules.CoopTtlMinutes) };
            db.CoopSessions.Add(session);
            await db.SaveChangesAsync();
        }
        var existing = await db.CoopParticipants.AnyAsync(x => x.SessionId == session.Id && x.UserId == user.Id);
        if (!existing)
        {
            var participantIds = await db.CoopParticipants.Where(x => x.SessionId == session.Id).Select(x => x.UserId).ToListAsync();
            if (participantIds.Count > 0)
            {
                var participantUniversities = await db.Users.Where(x => participantIds.Contains(x.Id)).Select(x => x.UniversityId).Distinct().ToListAsync();
                var sameUniversity = participantUniversities.Count == 1 && participantUniversities[0] == user.UniversityId;
                var userGroups = await db.GroupMembers.Where(x => x.UserId == user.Id).Select(x => x.GroupId).ToListAsync();
                var sameTeam = userGroups.Count > 0 && await db.GroupMembers.Where(x => participantIds.Contains(x.UserId) && userGroups.Contains(x.GroupId)).GroupBy(x => x.GroupId).AnyAsync(group => group.Select(x => x.UserId).Distinct().Count() == participantIds.Count);
                if (!sameTeam && !sameUniversity) return Fail(403, "coop_team_mismatch", "Ko-op üçün eyni qrupda və ya universitetdə olmalısınız.");
            }
            db.CoopParticipants.Add(new CoopParticipant { SessionId = session.Id, UserId = user.Id, JoinedAtUtc = now });
        }
        await db.SaveChangesAsync();
        var participants = await db.CoopParticipants.Where(x => x.SessionId == session.Id).ToListAsync();
        var awarded = false;
        if (!session.Completed && GameRules.CoopReady(participants.Select(x => x.UserId).Distinct().Count(), task.CoopSize))
        {
            session.Completed = true;
            foreach (var participant in participants.Take(task.CoopSize))
            {
                if (await db.TaskCompletions.AnyAsync(x => x.UserId == participant.UserId && x.TaskId == task.Id && x.SeasonId == season.Id)) continue;
                db.TaskCompletions.Add(new TaskCompletion { UserId = participant.UserId, TaskId = task.Id, SeasonId = season.Id, Correct = true, CompletedAtUtc = now });
                db.XpEvents.Add(new XpEvent { UserId = participant.UserId, SeasonId = season.Id, PlaceId = place.Id, TaskId = task.Id, Kind = "base", Amount = task.Xp, CreatedAtUtc = now });
            }
            await db.SaveChangesAsync();
            awarded = true;
        }
        return Results.Ok(new { session_id = session.Id, joined = participants.Count, needed = task.CoopSize, expires_at_utc = session.ExpiresAtUtc, completed = session.Completed, xp_awarded = awarded ? task.Xp : 0, message = session.Completed ? "Komanda tapşırığı tamamladı." : $"{participants.Count}/{task.CoopSize} nəfər qoşuldu." });
    }

    private static async Task<IResult> GetCoop(string sessionId, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Sessiyaya baxmaq üçün daxil ol.");
        var session = await db.CoopSessions.FindAsync(sessionId);
        if (session is null || !await db.CoopParticipants.AnyAsync(x => x.SessionId == session.Id && x.UserId == user.Id)) return Fail(404, "session_not_found", "Ko-op sessiyası tapılmadı.");
        var task = await db.Tasks.FindAsync(session.TaskId);
        var members = await db.CoopParticipants.Where(x => x.SessionId == session.Id).Join(db.Users, x => x.UserId, u => u.Id, (x, u) => new { id = u.Id, name = PublicName(u.Name) }).ToListAsync();
        return Results.Ok(new { session.Id, session.Completed, participants = members, joined = members.Count, needed = task?.CoopSize ?? 3, expires_at_utc = session.ExpiresAtUtc, xp_awarded = session.Completed ? task?.Xp ?? 0 : 0 });
    }

    private static async Task<IResult> GetCollection(HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Kolleksiyaya baxmaq üçün daxil ol.");
        var now = DateTimeOffset.UtcNow;
        var activeSeason = await ActiveSeason(db, now);
        var seasons = await db.Seasons.OrderByDescending(x => x.StartsAtUtc).ToListAsync();
        var items = new List<object>();
        foreach (var season in seasons)
        {
            var souvenirs = await db.Souvenirs.Where(x => x.SeasonId == season.Id).Join(db.Places, x => x.PlaceId, p => p.Id, (x, p) => new { Souvenir = x, Place = p }).ToListAsync();
            foreach (var item in souvenirs)
            {
                var earned = await db.UserSouvenirs.AnyAsync(x => x.UserId == user.Id && x.SouvenirId == item.Souvenir.Id);
                var status = earned ? "earned" : activeSeason?.Id == season.Id ? "available" : season.Finalized ? "missed" : "upcoming";
                items.Add(new { id = item.Souvenir.Id, name = item.Souvenir.Name, place = item.Place.Name, rarity = item.Souvenir.Rarity, earned, season_id = season.Id, season_theme = season.Theme, season_starts_at_utc = season.StartsAtUtc, limited = true, status });
            }
        }
        return Results.Ok(new { rows = items, avatars = await AvatarCollection(db, user) });
    }

    private static async Task<List<object>> AvatarCollection(AppDbContext db, AppUser user)
    {
        var level = await XpFor(db, user.Id) / GameRules.LevelXp + 1;
        return await db.Avatars.OrderBy(x => x.UnlockLevel).Select(x => (object)new { x.Id, x.Name, x.UnlockLevel, x.Illustration, unlocked = x.UnlockLevel <= level }).ToListAsync();
    }

    private static async Task<IResult> GetRewards(HttpContext http, AppDbContext db, Tokens tokens)
    {
        if (await CurrentUser(http, db, tokens) is null) return Fail(401, "unauthorized", "Mükafatlara baxmaq üçün daxil ol.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null)
        {
            var finalized = await db.Seasons.Where(x => x.Finalized).OrderByDescending(x => x.EndsAtUtc).FirstOrDefaultAsync();
            if (finalized is null) return Results.Ok(new { status = "provisional", rows = Array.Empty<object>() });
            var results = await FinalRewardRows(db, finalized.Id);
            return Results.Ok(new { status = "final", season_id = finalized.Id, rows = results });
        }
        var ranked = await RankedUsers(db, season.Id);
        var eligible = ranked.Where(x => x.Xp > 0).ToList();
        var overall = eligible.FirstOrDefault();
        var university = overall is null ? null : eligible.FirstOrDefault(x => x.User.UniversityId == overall.User.UniversityId && x.User.Id != overall.User.Id);
        var overallUniversity = overall is null ? null : await db.Universities.FindAsync(overall.User.UniversityId);
        var universityName = university is null ? null : await db.Universities.FindAsync(university.User.UniversityId);
        var candidates = new List<object>();
        if (overall is not null) candidates.Add(new { type = "overall", rank = 1, name = PublicName(overall.User.Name), university_id = overall.User.UniversityId, university = overallUniversity?.ShortName, weekly_xp = overall.Xp, prize_eligible = overall.User.PrizeEligible, label = "Hazırda öndə" });
        if (university is not null) candidates.Add(new { type = "university", rank = 2, name = PublicName(university.User.Name), university_id = university.User.UniversityId, university = universityName?.ShortName, weekly_xp = university.Xp, prize_eligible = university.User.PrizeEligible, label = "Universitet mükafatına namizəd" });
        var lastSeason = await db.Seasons.Where(x => x.Finalized).OrderByDescending(x => x.EndsAtUtc).FirstOrDefaultAsync();
        var previousFinal = lastSeason is null ? [] : await FinalRewardRows(db, lastSeason.Id);
        return Results.Ok(new { status = "provisional", season_id = season.Id, theme = season.Theme, closes_at_utc = season.EndsAtUtc, rows = candidates, previous_final = previousFinal });
    }

    private static async Task<List<object>> FinalRewardRows(AppDbContext db, string seasonId)
    {
        var rows = await db.SeasonResults.Where(x => x.SeasonId == seasonId).OrderBy(x => x.Rank).Take(10)
            .Join(db.Users, result => result.UserId, user => user.Id, (result, user) => new { result.UserId, result.Rank, result.WeeklyXp, result.PrizeEligible, user.Name, user.UniversityId }).ToListAsync();
        var first = rows.FirstOrDefault();
        var secondWinnerId = first is null ? null : rows.FirstOrDefault(x => x.UserId != first.UserId && x.UniversityId == first.UniversityId)?.UserId;
        return rows.Select(row => (object)new
        {
            id = row.UserId, rank = row.Rank, name = PublicName(row.Name), weeklyXp = row.WeeklyXp,
            prizeEligible = row.PrizeEligible, universityId = row.UniversityId,
            winner = row.Rank == 1 || row.UserId == secondWinnerId,
            label = row.Rank == 1 ? "Qalib" : row.UserId == secondWinnerId ? "Universitet mükafatının qalibi" : "Reytinq iştirakçısı",
        }).ToList();
    }
    private static async Task<IResult> ClaimReward(RewardClaimRequest request, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Mükafatı tələb etmək üçün daxil ol.");
        if (string.IsNullOrWhiteSpace(request.VerificationReference) || request.VerificationReference.Trim().Length is < 4 or > 80) return Fail(400, "verification_required", "Tələbə e-poçtu və ya ID kodunu daxil et.");
        if (!user.PrizeEligible || await db.ActivityFlags.AnyAsync(x => x.UserId == user.Id)) return Fail(403, "manual_review_required", "Mükafat uyğunluğu yoxlama gözləyir.");
        var season = await db.Seasons.Where(x => x.Finalized).OrderByDescending(x => x.EndsAtUtc).FirstOrDefaultAsync();
        if (season is null)
            return Fail(409, "not_a_winner", "Yekun nəticədə mükafat tələb etmək imkanın yoxdur.");
        var finalRows = await db.SeasonResults.Where(x => x.SeasonId == season.Id).OrderBy(x => x.Rank).Join(db.Users, result => result.UserId, participant => participant.Id, (result, participant) => new { result.UserId, result.Rank, result.PrizeEligible, participant.UniversityId }).ToListAsync();
        var first = finalRows.FirstOrDefault();
        var universityWinner = first is null ? null : finalRows.FirstOrDefault(x => x.UniversityId == first.UniversityId && x.UserId != first.UserId);
        var ownResult = finalRows.FirstOrDefault(x => x.UserId == user.Id);
        var isWinner = ownResult is not null && ownResult.PrizeEligible && (ownResult.Rank == 1 || universityWinner?.UserId == user.Id);
        if (!isWinner) return Fail(409, "not_a_winner", "Yekun nəticədə mükafat tələb etmək imkanın yoxdur.");
        var already = await db.RewardClaims.AnyAsync(x => x.UserId == user.Id && x.SeasonId == season.Id);
        if (already) return Fail(409, "claim_exists", "Bu mövsüm üçün mükafat müraciətin artıq qeydə alınıb.");
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.VerificationReference.Trim().ToLowerInvariant())));
        var claim = new RewardClaim { UserId = user.Id, SeasonId = season.Id, VerificationHash = hash };
        db.RewardClaims.Add(claim);
        await db.SaveChangesAsync();
        return Results.Accepted($"/api/rewards/current", new { claim.Id, claim.Status, message = "Məlumat əl ilə yoxlanacaq. ID kodu bazada saxlanılmır." });
    }

    private static async Task<IResult> GetShareCard(string? placeId, HttpContext http, AppDbContext db, Tokens tokens)
    {
        var user = await CurrentUser(http, db, tokens);
        if (user is null) return Fail(401, "unauthorized", "Paylaşım kartı üçün daxil ol.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        var all = await RankedUsers(db, season.Id);
        var own = all.FirstOrDefault(x => x.User.Id == user.Id);
        var globalRank = all.Where(x => x.Xp > 0).ToList().FindIndex(x => x.User.Id == user.Id) + 1;
        var uni = all.Where(x => x.User.UniversityId == user.UniversityId && x.Xp > 0).ToList();
        var uniRank = uni.FindIndex(x => x.User.Id == user.Id) + 1;
        Place? place = null;
        object? territory = null;
        if (!string.IsNullOrWhiteSpace(placeId))
        {
            place = await db.Places.FirstOrDefaultAsync(x => x.Id == placeId || x.Slug == placeId);
            if (place is null) return Fail(404, "place_not_found", "Məkan tapılmadı.");
            territory = await TerritoryOwner(db, season.Id, place.Id);
        }
        var university = await db.Universities.FindAsync(user.UniversityId);
        return Results.Ok(new { place = place?.Name, xp = own?.Xp ?? 0, rank = globalRank > 0 ? globalRank : (int?)null, university = university?.ShortName, university_rank = uniRank > 0 ? uniRank : (int?)null, territory, brand = "Çıraq", share_text = $"Çıraq-da {place?.Name ?? "Bakıda"} kəşfini tamamladım və {own?.Xp ?? 0} XP qazandım!" });
    }

    private static async Task<IResult> GetMetrics(HttpContext http, AppDbContext db, IConfiguration config)
    {
        if (!AdminAuthorized(http, config)) return Fail(401, "admin_required", "Admin token tələb olunur.");
        var users = await db.Users.ToListAsync();
        var firstStart = await db.Seasons.OrderBy(x => x.StartsAtUtc).Select(x => (DateTimeOffset?)x.StartsAtUtc).FirstOrDefaultAsync();
        var userIds = users.Select(x => x.Id).ToList();
        var museumCompletions = await db.TaskCompletions.Join(db.Tasks, x => x.TaskId, x => x.Id, (completion, task) => new { completion, task }).Join(db.Places, x => x.task.PlaceId, x => x.Id, (x, place) => new { x.completion, place }).Where(x => x.place.Type == "museum").ToListAsync();
        var places = await db.Places.ToListAsync();
        var visitsByPlace = places.Select(place => new { place = place.Name, visits = museumCompletions.Count(x => x.place.Id == place.Id) }).ToList();
        var universities = await db.Universities.ToListAsync();
        var visitsByUniversity = universities.Select(uni => new { university = uni.ShortName, visits = museumCompletions.Count(x => users.FirstOrDefault(u => u.Id == x.completion.UserId)?.UniversityId == uni.Id) }).ToList();
        var firstTimers = users.Count(x => x.VisitedMuseumLast12Months == false && x.FirstMuseumVisitCompleted);
        var week1 = await db.Seasons.OrderBy(x => x.StartsAtUtc).Skip(0).FirstOrDefaultAsync();
        var week2 = await db.Seasons.OrderBy(x => x.StartsAtUtc).Skip(1).FirstOrDefaultAsync();
        var cohort = week1 is null ? [] : await db.TaskCompletions.Where(x => x.SeasonId == week1.Id).Select(x => x.UserId).Distinct().ToListAsync();
        var retained = week2 is null || cohort.Count == 0 ? 0 : await db.TaskCompletions.Where(x => x.SeasonId == week2.Id && cohort.Contains(x.UserId)).Select(x => x.UserId).Distinct().CountAsync();
        return Results.Ok(new { new_users = firstStart is null ? 0 : users.Count(x => x.CreatedAtUtc >= firstStart), users_with_museum_completion = museumCompletions.Select(x => x.completion.UserId).Distinct().Count(), first_time_museum_visitors = firstTimers, visits_per_place = visitsByPlace, visits_per_university = visitsByUniversity, week1_to_week2_retention = new { cohort_users = cohort.Count, returned_users = retained, percent = cohort.Count == 0 ? (double?)null : Math.Round(100d * retained / cohort.Count, 1) } });
    }

    private static bool AdminAuthorized(HttpContext http, IConfiguration config)
    {
        if (!bool.TryParse(config["DEMO_MODE"], out var demo) || !demo) return false;
        var expected = config["ADMIN_TOKEN"];
        var provided = http.Request.Headers["X-Admin-Token"].ToString();
        return !string.IsNullOrWhiteSpace(expected) && expected.Length >= 24 && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(provided));
    }

    private static async Task<IResult> SimulateActivity(SimulateActivityRequest request, HttpContext http, AppDbContext db, IConfiguration config)
    {
        if (!AdminAuthorized(http, config)) return Fail(401, "admin_required", "Demo rejimi və admin token tələb olunur.");
        if (request.Count is < 1 or > 20) return Fail(400, "invalid_count", "Fəaliyyət sayı 1–20 arası olmalıdır.");
        var season = await ActiveSeason(db, DateTimeOffset.UtcNow);
        if (season is null) return Fail(503, "season_unavailable", "Cari mövsüm tapılmadı.");
        var users = await db.Users.Where(x => x.PasswordHash == "!seed-only!").OrderBy(x => x.Id).ToListAsync();
        var tasks = await db.Tasks.Where(x => x.Type != "coop").OrderBy(x => x.Id).ToListAsync();
        var awarded = new List<object>();
        for (var i = 0; i < request.Count; i++)
        {
            var user = users[(i + season.Id.Length) % users.Count];
            var task = tasks[(i * 3 + season.Id.Length) % tasks.Count];
            if (await db.TaskCompletions.AnyAsync(x => x.UserId == user.Id && x.TaskId == task.Id && x.SeasonId == season.Id)) continue;
            db.TaskCompletions.Add(new TaskCompletion { UserId = user.Id, TaskId = task.Id, SeasonId = season.Id, Correct = i % 2 == 0 });
            db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = task.PlaceId, TaskId = task.Id, Kind = "base", Amount = task.Xp });
            awarded.Add(new { user = PublicName(user.Name), task = task.Title, xp = task.Xp });
        }
        await db.SaveChangesAsync();
        return Results.Ok(new { simulated = awarded.Count, rows = awarded });
    }

    private static async Task<IResult> AdvanceWeek(AdvanceWeekRequest request, HttpContext http, AppDbContext db, IConfiguration config)
    {
        if (!AdminAuthorized(http, config)) return Fail(401, "admin_required", "Demo rejimi və admin token tələb olunur.");
        if (string.IsNullOrWhiteSpace(request.SeasonId)) return Fail(400, "season_id_required", "Yekunlaşdırılacaq mövsümün ID-sini göndər.");
        var active = await db.Seasons.FindAsync(request.SeasonId);
        if (active is null) return Fail(404, "season_not_found", "Mövsüm tapılmadı.");
        if (active.Finalized) return Results.Ok(new { already_finalized = true, season_id = active.Id });
        await FinalizeSeasonAsync(db, active, demoOverride: true);
        return Results.Ok(new { finalized_season = active.Id, next_season = await db.Seasons.OrderByDescending(x => x.StartsAtUtc).Select(x => x.Id).FirstAsync(), users_ranked = await db.SeasonResults.CountAsync(x => x.SeasonId == active.Id), territory_snapshots = await db.TerritorySnapshots.CountAsync(x => x.SeasonId == active.Id && x.Final) });
    }

    private static async Task<IResult> GetQrSheet(HttpContext http, AppDbContext db, Tokens tokens, IConfiguration config)
    {
        if (!AdminAuthorized(http, config)) return Fail(404, "not_found", "Səhifə tapılmadı.");
        var tasks = await db.Tasks.Join(db.Places, task => task.PlaceId, place => place.Id, (task, place) => new { task.Id, task.Code, task.Title, task.Type, place.Slug, place.Name, place.QrSecretVersion }).ToListAsync();
        return Results.Ok(tasks.Select(x => new { x.Id, x.Title, x.Type, place = x.Name, slug = x.Slug, qr_payload = tokens.QrToken(x.Slug, x.Code, x.QrSecretVersion) }));
    }

    private static async Task<IResult> GetDemoQr(string taskId, AppDbContext db, Tokens tokens, IConfiguration config)
    {
        if (!bool.TryParse(config["DEMO_MODE"], out var demo) || !demo) return Fail(404, "not_found", "Demo rejimi bağlıdır.");
        var task = await db.Tasks.FindAsync(taskId);
        var place = task is null ? null : await db.Places.FindAsync(task.PlaceId);
        if (task is null || place is null) return Fail(404, "task_not_found", "Tapşırıq tapılmadı.");
        return Results.Ok(new { task_id = task.Id, qr_payload = tokens.QrToken(place.Slug, task.Code, place.QrSecretVersion) });
    }

    private sealed record RegisterRequest(string? Name, string? Email, string? Password, string? UniversityId, string? AvatarId, bool? VisitedMuseumLast12Months);
    private sealed record LoginRequest(string? Email, string? Password);
    private sealed record ProfilePatch(string? Name, string? AvatarId);
    private sealed record CheckinRequest(string? PlaceId, double Latitude, double Longitude, double Accuracy);
    private sealed record TaskCompleteRequest(string? QrToken, string? Answer, double? Latitude, double? Longitude, double? Accuracy);
    private sealed record GroupRequest(string? Name);
    private sealed record GroupJoinRequest(string? InviteCode);
    private sealed record CoopJoinRequest(string? QrToken);
    private sealed record RewardClaimRequest(string? VerificationReference);
    private sealed record SimulateActivityRequest(int Count = 1);
    private sealed record AdvanceWeekRequest(string? SeasonId);
}



