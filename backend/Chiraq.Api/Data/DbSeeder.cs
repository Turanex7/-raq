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
        ("miniature-book-museum", "Miniatür Kitab Muzeyi", "İçərişəhər", "museum", 40.3667, 49.8346, "İçərişəhərdəki miniatür kitab kolleksiyasını kəşf et.", "nadir"),
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
            await EnsureMissingCatalogDataAsync(db);
            var demoUsers = await db.Users.Where(x => x.PasswordHash == "!seed-only!" && !x.IsDemo).ToListAsync();
            foreach (var demoUser in demoUsers) demoUser.IsDemo = true;
            if (demoUsers.Count > 0) await db.SaveChangesAsync();
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
            tasks.AddRange(CreateTasksForPlace(place));
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
            PasswordHash = "!seed-only!", UniversityId = SeedUniversityId(i), AvatarId = avatars[i % 5].Id,
            VisitedMuseumLast12Months = i % 3 == 0, IsDemo = true, CreatedAtUtc = now.AddDays(-40 - i),
        }).ToList();
        var souvenirs = places.SelectMany(place => new[]
        {
            new Souvenir { Id = $"souvenir-{place.Slug}", PlaceId = place.Id, SeasonId = season.Id, Name = place.Name, Rarity = place.Rarity },
            new Souvenir { Id = $"souvenir-rare-{place.Slug}", PlaceId = place.Id, SeasonId = season.Id, Name = "Çıraq alovu", Rarity = "nadir", IsRareFlame = true },
        }).ToList();

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
        var territoryDemoPlaces = Places.Where(x => x.Type == "museum").Select(x => x.Slug).ToHashSet(StringComparer.Ordinal);
        var leaderboardTasks = tasks.Where(x => x.Type != "coop" && !territoryDemoPlaces.Contains(placeById[x.PlaceId].Slug)).ToList();
        foreach (var user in users)
        {
            var index = int.Parse(user.Id[^2..]);
            var count = 1 + index % 4;
            // Small per-university offsets keep the map's seeded owners out of score ties.
            if (index == 7) count = 1;
            if (index == 28) count = 2;
            if (index == 30) count = 4;
            if (index == 33) count = 1;
            if (index == 36) count = 2;
            if (index == 37) count = 4;
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
        if (!seedUsers.ContainsKey("seed-01") || !seedUsers.ContainsKey("seed-06") || !seedUsers.ContainsKey("seed-11") || !seedUsers.ContainsKey("seed-16") || !seedUsers.ContainsKey("seed-21") || !seedUsers.ContainsKey("seed-22") || !seedUsers.ContainsKey("seed-30") || !seedUsers.ContainsKey("seed-34") || !seedUsers.ContainsKey("seed-38")) return;

        var placeSlugs = Places.Where(x => x.Type == "museum" || x.Slug == "bulvar").Select(x => x.Slug).ToArray();
        var places = await db.Places.Where(x => placeSlugs.Contains(x.Slug)).ToListAsync();
        if (places.Count != placeSlugs.Length) return;
        var placeIds = places.Select(x => x.Id).ToArray();
        var tasks = await db.Tasks.Where(x => placeIds.Contains(x.PlaceId) && x.Type != "coop").ToListAsync();
        var taskById = tasks.ToDictionary(x => x.Id);
        var expected = new[]
        {
            new DemoTerritoryTask("seed-21", "carpet-museum-quiz", false),
            new DemoTerritoryTask("seed-01", "national-history-quiz", true),
            new DemoTerritoryTask("seed-06", "national-history-quiz", false),
            new DemoTerritoryTask("seed-11", "heydar-aliyev-quiz", true),
            new DemoTerritoryTask("seed-12", "heydar-aliyev-quiz", false),
            new DemoTerritoryTask("seed-16", "heydar-aliyev-visit", false),
            new DemoTerritoryTask("seed-01", "modern-art-visit", false),
            new DemoTerritoryTask("seed-02", "modern-art-quiz", true),
            new DemoTerritoryTask("seed-06", "modern-art-quiz", false),
            new DemoTerritoryTask("seed-29", "literature-museum-challenge", false),
            new DemoTerritoryTask("seed-30", "literature-museum-visit", false),
            new DemoTerritoryTask("seed-16", "literature-museum-visit", false),
            new DemoTerritoryTask("seed-37", "miniature-book-museum-challenge", false),
            new DemoTerritoryTask("seed-38", "miniature-book-museum-quiz", true),
            new DemoTerritoryTask("seed-16", "miniature-book-museum-visit", false),
            new DemoTerritoryTask("seed-30", "bulvar-visit", false),
        };
        if (expected.Any(x => !taskById.ContainsKey(x.TaskId))) return;

        var seedUserIds = seedUsers.Keys.ToArray();
        var currentSeedEvents = await db.XpEvents.Where(x => x.SeasonId == seasonId && placeIds.Contains(x.PlaceId) && seedUserIds.Contains(x.UserId))
            .Select(x => new { x.UserId, x.TaskId, x.Amount, x.Kind }).ToListAsync();
        var alreadyBalanced = currentSeedEvents.Count == expected.Length && expected.All(item =>
            currentSeedEvents.Any(row => row.UserId == item.UserId && row.TaskId == item.TaskId && row.Kind == "base" && row.Amount == SeedTaskXp(item, taskById[item.TaskId])));
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
            db.XpEvents.Add(new XpEvent { UserId = item.UserId, SeasonId = seasonId, PlaceId = task.PlaceId, TaskId = task.Id, Kind = "base", Amount = SeedTaskXp(item, task), CreatedAtUtc = completedAt });
            if (places.First(x => x.Id == task.PlaceId).Type == "museum") seedUsers[item.UserId].FirstMuseumVisitCompleted = true;
        }
        await db.SaveChangesAsync();
    }

    private static string SeedUniversityId(int index) => index switch
    {
        < 5 => "bdu",
        < 10 => "ada",
        < 15 => "unec",
        < 20 => "aztu",
        < 28 => "adnsu",
        < 32 => "atmu",
        < 36 => "khazar",
        _ => "atu",
    };

    private static List<GameTask> CreateTasksForPlace(Place place)
    {
        var outdoor = place.Type == "outdoor";
        return
        [
            new GameTask
            {
                Id = $"{place.Slug}-visit", PlaceId = place.Id, Code = "visit", Title = outdoor ? "Məkanı kəşf et" : "Eksponatı kəşf et",
                Description = "Məkanın hekayəsini oxu və ilk izi tamamla.", Type = outdoor ? "find" : "qr_scan", Difficulty = "easy",
                Xp = outdoor ? GameRules.OutdoorPinXp : GameRules.DifficultyXp[0], CoopSize = 0, NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { qrToken = "", answer = "", fact = "Bu tapşırığın məlumatı insan tərəfindən yoxlanmalıdır." }),
            },
            new GameTask
            {
                Id = $"{place.Slug}-quiz", PlaceId = place.Id, Code = "quiz", Title = "Qısa bilik sualı",
                Description = place.Description, Type = "quiz", Difficulty = "medium", Xp = GameRules.DifficultyXp[1], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = $"{place.Name} hansı şəhərdə yerləşir?", answer = "bakı", fact = "Bakı Azərbaycanın paytaxtıdır." }),
            },
            new GameTask
            {
                Id = $"{place.Slug}-vote", PlaceId = place.Id, Code = "vote", Title = "Sənin seçimin",
                Description = "Məkanda ən çox diqqətini çəkən detalı seç.", Type = "vote", Difficulty = "easy", Xp = GameRules.DifficultyXp[0], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Bu məkanda ən çox nə diqqətini çəkdi?", choices = new[] { "Memarlıq", "Tarix", "İncəsənət" } }),
            },
            new GameTask
            {
                Id = $"{place.Slug}-challenge", PlaceId = place.Id, Code = "challenge", Title = "Usta kəşfiyyatçının izi",
                Description = "Məkanı diqqətlə araşdır və tarixçədən bir detal tap.", Type = "find", Difficulty = "hard", Xp = GameRules.DifficultyXp[2], NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Məkanla bağlı bir memarlıq və ya tarix detalını təsvir et." }),
            },
            new GameTask
            {
                Id = $"{place.Slug}-coop", PlaceId = place.Id, Code = "coop", Title = "Dostlarınla birlikdə kəşf et",
                Description = "Üç iştirakçı QR kodunu skan edib fərqli rolların cavabını 60 dəqiqə ərzində göndərir.", Type = "coop", Difficulty = "medium", Xp = GameRules.DifficultyXp[1], CoopSize = 3, NeedsReview = true,
                Payload = JsonSerializer.Serialize(new { question = "Komanda ilə məkanda bir detal tap." }),
            },
        ];
    }

    private static async Task EnsureMissingCatalogDataAsync(AppDbContext db)
    {
        var cooperativeTasks = await db.Tasks.Where(x => x.Code == "coop").ToListAsync();
        foreach (var task in cooperativeTasks)
        {
            task.Description = "Üç iştirakçı QR kodunu skan edib fərqli rolların cavabını 60 dəqiqə ərzində göndərir.";
            task.NeedsReview = true;
        }
        if (cooperativeTasks.Count > 0) await db.SaveChangesAsync();
        var existingSlugs = await db.Places.Select(x => x.Slug).ToListAsync();
        var missing = Places.Where(x => !existingSlugs.Contains(x.Slug)).Select((x, index) => new Place
        {
            Id = $"place-{x.Slug}", Slug = x.Slug, Name = x.Name, District = x.District, Type = x.Type,
            Latitude = x.Lat, Longitude = x.Lng, RadiusMeters = x.Type == "museum" ? 60 : 50,
            Description = x.Description, Rarity = x.Rarity, IsOpen = Array.IndexOf(Places.Select(p => p.Slug).ToArray(), x.Slug) < 8,
        }).ToList();
        if (missing.Count > 0)
        {
            db.Places.AddRange(missing);
            await db.SaveChangesAsync();
            db.Tasks.AddRange(missing.SelectMany(CreateTasksForPlace));
            await db.SaveChangesAsync();
        }

        var places = await db.Places.ToListAsync();
        var seasons = await db.Seasons.ToListAsync();
        var existingSouvenirKeys = (await db.Souvenirs.Select(x => new { x.PlaceId, x.SeasonId, x.IsRareFlame }).ToListAsync())
            .Select(x => $"{x.PlaceId}|{x.SeasonId}|{x.IsRareFlame}").ToHashSet(StringComparer.Ordinal);
        var missingSouvenirs = new List<Souvenir>();
        foreach (var place in places)
        foreach (var season in seasons)
        foreach (var rareFlame in new[] { false, true })
        {
            if (existingSouvenirKeys.Contains($"{place.Id}|{season.Id}|{rareFlame}")) continue;
            missingSouvenirs.Add(rareFlame
                ? new Souvenir { Id = $"souvenir-rare-{season.Id}-{place.Slug}", PlaceId = place.Id, SeasonId = season.Id, Name = "Çıraq alovu", Rarity = "nadir", IsRareFlame = true }
                : new Souvenir { Id = $"souvenir-{season.Id}-{place.Slug}", PlaceId = place.Id, SeasonId = season.Id, Name = place.Name, Rarity = place.Rarity });
        }
        if (missingSouvenirs.Count > 0)
        {
            db.Souvenirs.AddRange(missingSouvenirs);
            await db.SaveChangesAsync();
        }
    }

    private sealed record DemoTerritoryTask(string UserId, string TaskId, bool Correct);

    private static int SeedTaskXp(DemoTerritoryTask item, GameTask task) => task.Type == "quiz" ? GameRules.QuizXp(task.Xp, item.Correct) : task.Xp;
}
