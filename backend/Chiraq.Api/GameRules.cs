namespace Chiraq.Api;

public static class GameRules
{
    public const string TimeZoneId = "Asia/Baku";
    public const int LevelXp = 250;
    public const int OutdoorPinXp = 10;
    public const int WrongAnswerPercent = 40;
    public const int FirstVisitXp = 20;
    public const int TicketedPlaceBonusXp = 3;
    public const int UniversityTopMembers = 10;
    public const int UniversityMinimumActive = 3;
    public const int GroupBonusMinimumMembers = 3;
    public const int GroupBonusWindowMinutes = 60;
    public const int DailyLanternStreakDays = 7;
    public const int DailyLanternMilestoneXp = 10;
    public const int MiniGameCompletionXp = 3;
    public const int MiniGameDailyAwardLimit = 3;
    public const int MaximumCheckinsPerHour = 6;
    public const int MaximumCompletionsPerHour = 20;
    public const int SoftGeoFlagMeters = 500;
    public const double MaximumWeekMultiplier = 1.10;
    public static readonly int[] DifficultyXp = [10, 20, 40];
    public static readonly double[] GroupMultipliers = [1.0, 1.2, 1.3, 1.4];
    public static readonly string[] TicketedPlaceSlugs = [
        "carpet-museum", "national-history", "modern-art", "literature-museum", "miniature-book-museum", "ateshgah",
    ];
    public static readonly TimeZoneInfo BakuZone = TimeZoneInfo.FindSystemTimeZoneById(TimeZoneId);
    public static int QuizXp(int taskXp, bool correct) => correct ? taskXp : Math.Max(1, (int)Math.Floor(taskXp * WrongAnswerPercent / 100d));
    public static int TicketedPlaceBonus(string placeSlug) => TicketedPlaceSlugs.Contains(placeSlug, StringComparer.Ordinal) ? TicketedPlaceBonusXp : 0;
    public static bool IsInsideRadius(double distanceMeters, double accuracyMeters, int radiusMeters) =>
        double.IsFinite(distanceMeters) && double.IsFinite(accuracyMeters) && distanceMeters <= radiusMeters && accuracyMeters >= 0 && accuracyMeters <= radiusMeters;
    public static (int Score, int Participants, bool Eligible) UniversityFairScore(IEnumerable<int> activeWeeklyXp)
    {
        var members = activeWeeklyXp.Where(x => x > 0).OrderDescending().Take(UniversityTopMembers).ToArray();
        return (members.Length == 0 ? 0 : (int)Math.Round(members.Average()), members.Length, members.Length >= UniversityMinimumActive);
    }

    public static (DateTimeOffset StartUtc, DateTimeOffset EndUtc) CurrentSeason(DateTimeOffset now)
    {
        var bakuNow = TimeZoneInfo.ConvertTime(now, BakuZone);
        var monday = DateOnly.FromDateTime(bakuNow.DateTime).AddDays(-(((int)bakuNow.DayOfWeek + 6) % 7));
        var startLocal = monday.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        var endLocal = monday.AddDays(7).ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        var start = TimeZoneInfo.ConvertTimeToUtc(startLocal, BakuZone);
        var end = TimeZoneInfo.ConvertTimeToUtc(endLocal, BakuZone);
        return (new DateTimeOffset(start, TimeSpan.Zero), new DateTimeOffset(end, TimeSpan.Zero));
    }

    public static int BaseXp(int baseXp, int previousRank) => (int)Math.Round(baseXp * Math.Min(MaximumWeekMultiplier, previousRank == 1 ? 1.10 : previousRank == 2 ? 1.05 : 1.0));
    public static int GroupBonusXp(int baseXp, int distinctMembers)
    {
        if (distinctMembers < GroupBonusMinimumMembers || baseXp <= 0) return 0;
        var index = Math.Clamp(distinctMembers - 2, 1, GroupMultipliers.Length - 1);
        return (int)Math.Round(baseXp * (GroupMultipliers[index] - 1));
    }
    public static bool CoopReady(int distinctParticipants, int requiredParticipants) => requiredParticipants > 0 && distinctParticipants >= requiredParticipants;
    public static bool IsImpossibleTravel(double distanceMeters, double elapsedHours) =>
        double.IsFinite(distanceMeters) && double.IsFinite(elapsedHours) && elapsedHours > 0 && distanceMeters / (elapsedHours * 1000) > 150;
    public static int TerritoryPerCapitaScore(IEnumerable<int> weeklyXpPerVisitor)
    {
        var scores = weeklyXpPerVisitor.Where(x => x > 0).ToArray();
        return scores.Length == 0 ? 0 : (int)Math.Round(scores.Average());
    }
}
