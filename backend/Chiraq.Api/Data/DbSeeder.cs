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
        if (await db.Universities.AnyAsync()) return;

        var now = DateTimeOffset.UtcNow;
        var seasonRange = GameRules.CurrentSeason(now);
        var season = new Season { Id = "season-current", StartsAtUtc = seasonRange.StartUtc, EndsAtUtc = seasonRange.EndUtc.AddTicks(-1), Theme = "Muzey həftəsi" };
        var universities = Universities.Select(x => new University { Id = x.Id, Name = x.Name, ShortName = x.Short, EmailDomains = JsonSerializer.Serialize(x.Domains) }).ToList();
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
        db.Universities.AddRange(universities);
        db.Places.AddRange(places);
        db.Tasks.AddRange(tasks);
        db.Avatars.AddRange(avatars);
        db.Users.AddRange(users);
        db.Souvenirs.AddRange(souvenirs);
        await db.SaveChangesAsync();

        // Each seeded score comes from distinct task completions, never from an arbitrary XP total.
        var placeById = places.ToDictionary(x => x.Id);
        foreach (var user in users)
        {
            var index = int.Parse(user.Id[^2..]);
            var count = 1 + index % 5;
            foreach (var task in tasks.Where(x => x.Type != "coop").Take(count))
            {
                db.TaskCompletions.Add(new TaskCompletion { UserId = user.Id, TaskId = task.Id, SeasonId = season.Id, Correct = index % 2 == 0, CompletedAtUtc = now.AddDays(-(index % 6)).AddMinutes(index * 3) });
                db.XpEvents.Add(new XpEvent { UserId = user.Id, SeasonId = season.Id, PlaceId = task.PlaceId, TaskId = task.Id, Kind = "base", Amount = task.Xp, CreatedAtUtc = now.AddDays(-(index % 6)).AddMinutes(index * 3) });
                if (placeById[task.PlaceId].Type == "museum" && user.VisitedMuseumLast12Months == false) user.FirstMuseumVisitCompleted = true;
            }
        }
        await db.SaveChangesAsync();
        await tx.CommitAsync();
    }
}
