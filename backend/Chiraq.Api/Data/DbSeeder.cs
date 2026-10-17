using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Chiraq.Api.Data;

public static class DbSeeder
{
    private static readonly (string Id, string Name, string Short, string[] Domains)[] Universities =
    [
        ("bdu", "Bakı Dövlət Universiteti", "BDU", ["bdu.edu.az", "bsu.edu.az"]),
        ("ada", "ADA Universiteti", "ADA", ["ada.edu.az"]),
        ("unec", "Azərbaycan Dövlət İqtisad Universiteti", "UNEC", ["unec.edu.az"]),
        ("aztu", "Azərbaycan Texniki Universiteti", "AzTU", ["aztu.edu.az"]),
        ("adnsu", "Azərbaycan Dövlət Neft və Sənaye Universiteti", "ADNSU", ["asoiu.edu.az"]),
        ("atmu", "Azərbaycan Turizm və Menecment Universiteti", "ATMU", ["atmu.edu.az"]),
        ("khazar", "Xəzər Universiteti", "Xəzər", ["khazar.org"]),
        ("atu", "Azərbaycan Tibb Universiteti", "ATU", ["amu.edu.az"]),
        ("banm", "Bakı Ali Neft Məktəbi", "BANM", ["bhos.edu.az"]),
        ("adpu", "Azərbaycan Dövlət Pedaqoji Universiteti", "ADPU", ["adpu.edu.az"]),
        ("azmiu", "Azərbaycan Memarlıq və İnşaat Universiteti", "AzMİU", ["azmiu.edu.az"]),
        ("bsu-slavyan", "Bakı Slavyan Universiteti", "BSU", ["bsu-uni.edu.az"]),
        ("adu", "Azərbaycan Dillər Universiteti", "ADU", ["adu.edu.az"]),
        ("beu", "Bakı Mühəndislik Universiteti", "BMU", ["beu.edu.az"]),
        ("bma", "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", "BMA", ["musakademiya.musigi-dunya.az"]),
        ("admiu", "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", "ADMİU", ["admiu.edu.az"]),
        ("sdu", "Sumqayıt Dövlət Universiteti", "SDU", ["sdu.edu.az"]),
        ("lsu", "Lənkəran Dövlət Universiteti", "LDU", ["lsu.edu.az"]),
        ("gsu", "Gəncə Dövlət Universiteti", "GDU", ["gsu.az"]),
        ("atu-gence", "Azərbaycan Texnologiya Universiteti", "ATU", ["atu.edu.az"]),
        ("mdu", "Mingəçevir Dövlət Universiteti", "MDU", ["mdu.edu.az"]),
        ("ndu", "Naxçıvan Dövlət Universiteti", "NDU", ["ndu.edu.az"]),
        ("azra", "Azərbaycan Dövlət Rəssamlıq Akademiyası", "ADRA", ["azra.edu.az"]),
        ("konservatoriya", "Azərbaycan Milli Konservatoriyası", "AMK", ["conservatory.az"]),
        ("nmi", "Naxçıvan Müəllimlər İnstitutu", "NMİ", ["nmi.edu.az"]),
        ("qarabag", "Qarabağ Universiteti", "Qarabağ", ["karabakh.edu.az"]),
        ("tau", "Türkiyə-Azərbaycan Universiteti", "TAU", ["tau.edu.az"]),
        ("sport", "Azərbaycan İdman Akademiyası", "AİA", ["sport.edu.az"]),
        ("adau", "Azərbaycan Dövlət Aqrar Universiteti", "ADAU", ["adau.edu.az"]),
        ("dia", "Prezident yanında Dövlət İdarəçilik Akademiyası", "DİA", ["dia.edu.az"]),
        ("adda", "Azərbaycan Dövlət Dəniz Akademiyası", "ADDA", ["adda.edu.az"]),
        ("naa", "Milli Aviasiya Akademiyası", "MAA", ["naa.az"]),
        ("bxa", "Bakı Xoreoqrafiya Akademiyası", "BXA", ["bxa.edu.az"]),
        ("ait", "Azərbaycan İlahiyyat İnstitutu", "Aİİ", ["ait.edu.az"]),
        ("qku", "Qərbi Kaspi Universiteti", "QKU", ["wu.edu.az"]),
        ("au", "Azərbaycan Universiteti", "AU", ["au.edu.az"]),
        ("oyu", "Odlar Yurdu Universiteti", "OYU", ["oyu.edu.az"]),
        ("baau", "Bakı Avrasiya Universiteti", "BAAU", ["baau.edu.az"]),
        ("aku", "Azərbaycan Kooperasiya Universiteti", "AKU", ["aku.edu.az"]),
        ("bbu", "Bakı Biznes Universiteti", "BBU", ["bbu.edu.az"]),
        ("aesma", "Azərbaycan Əmək və Sosial Münasibətlər Akademiyası", "AESMA", ["aesma.edu.az"]),
    ];

    private static readonly (string Slug, string Name, string District, string Type, double Lat, double Lng, string Description, string Rarity)[] Places =
    [
        ("carpet-museum", "Azərbaycan Milli Xalça Muzeyi", "Dənizkənarı Bulvar", "museum", 40.3593, 49.8355, "Azərbaycan xalçaçılıq məktəblərini və naxış ənənələrini araşdır.", "epik"),
        ("national-history", "Milli Azərbaycan Tarixi Muzeyi", "Şəhər mərkəzi", "museum", 40.3697, 49.8352, "Azərbaycan tarixinin müxtəlif dövrlərini muzey kolleksiyası ilə tanı.", "nadir"),
        ("heydar-aliyev", "Heydər Əliyev Mərkəzi", "Nərimanov", "museum", 40.3953, 49.8671, "Memarlıq və mədəniyyət sərgilərini kəşf et.", "nadir"),
        ("modern-art", "Müasir İncəsənət Muzeyi", "Yusif Səfərov küçəsi", "museum", 40.3805, 49.8545, "Azərbaycan müasir incəsənətinin seçilmiş nümunələrinə bax.", "adi"),
        ("literature-museum", "Nizami Gəncəvi adına Ədəbiyyat Muzeyi", "Fəvvarələr Meydanı", "museum", 40.3692, 49.8357, "Azərbaycan ədəbiyyatının irsini və klassik müəllifləri tanı.", "nadir"),
        ("28-may", "28 May meydanı", "Mərkəz", "outdoor", 40.3792, 49.8467, "Şəhərin gündəlik ritmini açıq meydandan müşahidə et.", "adi"),
        ("bulvar", "Dənizkənarı Bulvar", "Sahil", "outdoor", 40.3659, 49.8401, "Xəzər sahilində şəhərin tarixini və gündəlik həyatını kəşf et.", "adi"),
        ("icherisheher", "İçərişəhər", "İçərişəhər", "outdoor", 40.3661, 49.8374, "Qala divarları və tarixi küçələri araşdır.", "epik"),
        ("fountains", "Fəvvarələr Meydanı", "Mərkəz", "outdoor", 40.3727, 49.8372, "Şəhər mərkəzinin memarlığına və həyatına nəzər sal.", "adi"),
        ("ateshgah", "Suraxanı Atəşgahı", "Suraxanı", "outdoor", 40.4167, 50.0050, "Abşeronun alovla bağlı tarixi məkanını ziyarət et.", "epik"),
    ];

    private static readonly string[] Names =
    [
        "Aysel Məmmədova", "Nihad Quliyev", "Leyla Hüseynova", "Kamran Əliyev", "Fəridə İsmayılova",
        "Orxan Həsənov", "Nərmin Rzayeva", "Murad Cəfərov", "Günel Abdullayeva", "Tural Məmmədli",
        "Sevinc İbrahimova", "Elvin Qasımov", "Zəhra Vəliyeva", "Rəşad Əhmədov", "Ayan Süleymanlı",
        "Fuad Babayev", "Lalə Kərimova", "Emin Mustafayev", "Səbinə Hacıyeva", "Anar Məlikov",
        "Mələk Hümbətova", "Cavid İsmayılov", "Aytac Nəcəfova", "Sadiq Abbasov", "Dilarə Xəlilova",
        "Ramin Cəbrayılov", "Fidan Məmmədli", "İlkin Rəhimov", "Nigar Əlizadə", "Vüsal Həsənli",
        "Xədicə Əliyeva", "Eldar Qurbanov", "Gülər Sadıqova", "Samir Məmmədov", "Aminə Orucova",
        "Təhminə Kərimova", "Kənan Şirinov", "Ülkər Nəsirova", "Elçin Rüstəmov", "Zaurə Quliyeva",
    ];

    public static async Task InitializeAsync(AppDbContext db, IConfiguration configuration)
    {
        await db.Database.MigrateAsync();
        var existingUniversityIds = await db.Universities.Select(x => x.Id).ToListAsync();
        var missingUniversities = Universities
            .Where(x => !existingUniversityIds.Contains(x.Id))
            .Select(x => new University { Id = x.Id, Name = x.Name, ShortName = x.Short, EmailDomains = JsonSerializer.Serialize(x.Domains) })
            .ToList();
        if (missingUniversities.Count > 0)
        {
            db.Universities.AddRange(missingUniversities);
            await db.SaveChangesAsync();
        }
        if (await db.Seasons.AnyAsync())
        {
            var currentTime = DateTimeOffset.UtcNow;
            var activeSeason = await db.Seasons.Where(x => x.StartsAtUtc <= currentTime && x.EndsAtUtc >= currentTime).OrderByDescending(x => x.StartsAtUtc).FirstOrDefaultAsync();
            if (activeSeason is not null) await EnsureDemoTerritorySeedsAsync(db, activeSeason.Id);
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var seasonRange = GameRules.CurrentSeason(now);
        var season = new Season { Id = "season-current", StartsAtUtc = seasonRange.StartUtc, EndsAtUtc = seasonRange.EndUtc.AddTicks(-1), Theme = "Muzey həftəsi" };
        var places = Places.Select((x, index) => new Place
        {
            Id = $"place-{x.Slug}", Slug = x.Slug, Name = x.Name, District = x.District, Type = x.Type,
            Latitude = x.Lat, Longitude = x.Lng, RadiusMeters = x.Type == "museum" ? 60 : 50,
            Description = x.Description, Rarity = x.Rarity, IsOpen = index < 8,
        }).ToList();

        var tasks = new List<GameTask>();
        foreach (var place in places)
        {
            var outdoor = place.Type == "outdoor";
            tasks.Add(new GameTask
            {
                Id = $"{place.Slug}-visit", PlaceId = place.Id, Code = "visit", Title = outdoor ? "Məkanı kəşf et" : "Eksponatı kəşf et",
                Description = "Məkanın hekayəsini oxu və ilk izi tamamla.", Type = outdoor ? "find" : "qr_scan", Difficulty = "easy",
                Xp = outdoor ? GameRules.OutdoorPinXp : GameRules.DifficultyXp[0], CoopSize = 0, NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { qrToken = "", answer = "", fact = "Bu tapşırığın məlumatı insan tərəfindən yoxlanmalıdır." }),
            });
            tasks.Add(new GameTask
            {
                Id = $"{place.Slug}-quiz", PlaceId = place.Id, Code = "quiz", Title = "Qısa bilik sualı",
                Description = place.Description, Type = "quiz", Difficulty = "medium", Xp = GameRules.DifficultyXp[1], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = $"{place.Name} hansı şəhərdə yerləşir?", answer = "bakı", fact = "Bakı Azərbaycanın paytaxtıdır." }),
            });
            tasks.Add(new GameTask
            {
                Id = $"{place.Slug}-vote", PlaceId = place.Id, Code = "vote", Title = "Sənin seçimin",
                Description = "Məkanda ən çox diqqətini çəkən detalı seç.", Type = "vote", Difficulty = "easy", Xp = GameRules.DifficultyXp[0], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Bu məkanda ən çox nə diqqətini çəkdi?", choices = new[] { "Memarlıq", "Tarix", "İncəsənət" } }),
            });
            tasks.Add(new GameTask
            {
                Id = $"{place.Slug}-challenge", PlaceId = place.Id, Code = "challenge", Title = "Usta kəşfiyyatçının izi",
                Description = "Məkanı diqqətlə araşdır və tarixçədən bir detal tap.", Type = "find", Difficulty = "hard", Xp = GameRules.DifficultyXp[2], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Məkanla bağlı bir memarlıq və ya tarix detalını təsvir et." }),
            });
            tasks.Add(new GameTask
            {
                Id = $"{place.Slug}-coop", PlaceId = place.Id, Code = "coop", Title = "Dostlarınla birlikdə kəşf et",
                Description = "Eyni məkanda QR kodunu iki dəqiqə ərzində skan edin.", Type = "coop", Difficulty = "medium", Xp = GameRules.DifficultyXp[1], CoopSize = 3, NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Komanda ilə məkanda bir detal tap." }),
            });
        }

        var avatars = new[]
        {
            new Avatar { Id = "nizami", Name = "Nizami Gəncəvi", UnlockLevel = 1, Illustration = "nizami" },
            new Avatar { Id = "uzeyir", Name = "Üzeyir Hacıbəyov", UnlockLevel = 2, Illustration = "uzeyir" },
            new Avatar { Id = "nesimi", Name = "İmadəddin Nəsimi", UnlockLevel = 3, Illustration = "nesimi" },
            new Avatar { Id = "natavan", Name = "Xurşidbanu Natəvan", UnlockLevel = 4, Illustration = "natavan" },
            new Avatar { Id = "babek", Name = "Babək", UnlockLevel = 6, Illustration = "babek" },
        };
        var users = Names.Select((name, i) => new AppUser
        {
            Id = $"seed-{i + 1:D2}", Name = name, Email = $"student{i + 1:D2}@example.invalid",
            PasswordHash = "!seed-only!", UniversityId = Universities[i / 5].Id, AvatarId = avatars[i % 5].Id,
            VisitedMuseumLast12Months = i % 3 == 0, CreatedAtUtc = now.AddDays(-40 - i),
        }).ToList();
        var souvenirs = places.Select((place, i) => new Souvenir { Id = $"souvenir-{place.Slug}", PlaceId = place.Id, SeasonId = season.Id, Name = place.Name, Rarity = place.Rarity }).ToList();

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Seasons.Add(season);
        db.Places.AddRange(places);
        db.Tasks.AddRange(tasks);
        db.Avatars.AddRange(avatars);
        db.Users.AddRange(users);
        db.Souvenirs.AddRange(souvenirs);
        await db.SaveChangesAsync();

        // Each seeded score comes from distinct task completions, never from an arbitrary XP total.
        var placeById = places.ToDictionary(x => x.Id);
        var territoryDemoPlaces = new HashSet<string>(StringComparer.Ordinal) { "carpet-museum", "national-history" };
        var leaderboardTasks = tasks.Where(x => x.Type != "coop" && !territoryDemoPlaces.Contains(placeById[x.PlaceId].Slug)).ToList();
        foreach (var user in users)
        {
            var index = int.Parse(user.Id[^2..]);
            var count = 1 + index % 5;
            foreach (var task in leaderboardTasks.Take(count))
            {
                db.TaskCompletions.Add(new TaskCompletion { UserId = user.Id, TaskId = task.Id, SeasonId = season.Id, Correct = index % 2 == 0, CompletedAtUtc = now.AddDays(-(index % 6)).AddMinutes(index * 3) });
                db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = task.PlaceId, TaskId = task.Id, Kind = "base", Amount = task.Xp, CreatedAtUtc = now.AddDays(-(index % 6)).AddMinutes(index * 3) });
                if (placeById[task.PlaceId].Type == "museum" && user.VisitedMuseumLast12Months == false) user.FirstMuseumVisitCompleted = true;
            }
        }
        await db.SaveChangesAsync();
        await EnsureDemoTerritorySeedsAsync(db, season.Id);
        await tx.CommitAsync();
    }

    private static async Task EnsureDemoTerritorySeedsAsync(AppDbContext db, string seasonId)
    {
        var seedUsers = await db.Users.Where(x => x.PasswordHash == "!seed-only!").ToDictionaryAsync(x => x.Id);
        if (!seedUsers.ContainsKey("seed-06") || !seedUsers.ContainsKey("seed-21") || !seedUsers.ContainsKey("seed-22")) return;

        var places = await db.Places.Where(x => x.Slug == "carpet-museum" || x.Slug == "national-history").ToListAsync();
        if (places.Count != 2) return;
        var placeIds = places.Select(x => x.Id).ToArray();
        var tasks = await db.Tasks.Where(x => placeIds.Contains(x.PlaceId) && x.Type != "coop").ToListAsync();
        var taskById = tasks.ToDictionary(x => x.Id);
        var expected = new[]
        {
            new DemoTerritoryTask("seed-21", "carpet-museum-visit", false),
            new DemoTerritoryTask("seed-22", "carpet-museum-quiz", true),
            new DemoTerritoryTask("seed-06", "carpet-museum-visit", false),
            new DemoTerritoryTask("seed-21", "national-history-visit", false),
            new DemoTerritoryTask("seed-06", "national-history-quiz", true),
        };
        if (expected.Any(x => !taskById.ContainsKey(x.TaskId))) return;

        var seedUserIds = seedUsers.Keys.ToArray();
        var hasRealVisitor = await db.XpEvents.AnyAsync(x => x.SeasonId == seasonId && placeIds.Contains(x.PlaceId) && !seedUserIds.Contains(x.UserId));
        if (hasRealVisitor) return;

        var currentSeedEvents = await db.XpEvents.Where(x => x.SeasonId == seasonId && placeIds.Contains(x.PlaceId) && seedUserIds.Contains(x.UserId))
            .Select(x => new { x.UserId, x.TaskId, x.Amount, x.Kind }).ToListAsync();
        var alreadyBalanced = currentSeedEvents.Count == expected.Length && expected.All(item =>
            currentSeedEvents.Any(row => row.UserId == item.UserId && row.TaskId == item.TaskId && row.Kind == "base" && row.Amount == taskById[item.TaskId].Xp));
        if (alreadyBalanced) return;

        var targetedTaskIds = tasks.Select(x => x.Id).ToArray();
        db.TaskCompletions.RemoveRange(await db.TaskCompletions.Where(x => x.SeasonId == seasonId && seedUserIds.Contains(x.UserId) && targetedTaskIds.Contains(x.TaskId)).ToListAsync());
        db.XpEvents.RemoveRange(await db.XpEvents.Where(x => x.SeasonId == seasonId && seedUserIds.Contains(x.UserId) && placeIds.Contains(x.PlaceId)).ToListAsync());
        var now = DateTimeOffset.UtcNow.AddDays(-1);
        foreach (var (item, index) in expected.Select((item, index) => (item, index)))
        {
            var task = taskById[item.TaskId];
            var completedAt = now.AddMinutes(index * 7);
            db.TaskCompletions.Add(new TaskCompletion { UserId = item.UserId, TaskId = task.Id, SeasonId = seasonId, Correct = item.Correct, CompletedAtUtc = completedAt });
            db.XpEvents.Add(new XpEvent { UserId = item.UserId, SeasonId = seasonId, PlaceId = task.PlaceId, TaskId = task.Id, Kind = "base", Amount = task.Xp, CreatedAtUtc = completedAt });
            if (places.First(x => x.Id == task.PlaceId).Type == "museum") seedUsers[item.UserId].FirstMuseumVisitCompleted = true;
        }
        await db.SaveChangesAsync();
    }

    private sealed record DemoTerritoryTask(string UserId, string TaskId, bool Correct);
}
