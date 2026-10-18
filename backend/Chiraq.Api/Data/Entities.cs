namespace Chiraq.Api.Data;

public sealed class University
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "";
    public string ShortName { get; set; } = "";
    public string EmailDomains { get; set; } = "[]";
}

public sealed class Season
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTimeOffset StartsAtUtc { get; set; }
    public DateTimeOffset EndsAtUtc { get; set; }
    public string Theme { get; set; } = "";
    public bool Finalized { get; set; }
}

public sealed class AppUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string UniversityId { get; set; } = "open";
    public string AvatarId { get; set; } = "nizami";
    public bool? VisitedMuseumLast12Months { get; set; }
    public bool FirstMuseumVisitCompleted { get; set; }
    public bool PrizeEligible { get; set; } = true;
    public bool IsDemo { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Place
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Slug { get; set; } = "";
    public string Type { get; set; } = "museum";
    public string Name { get; set; } = "";
    public string District { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int RadiusMeters { get; set; } = 50;
    public bool IsOpen { get; set; } = true;
    public int QrSecretVersion { get; set; } = 1;
    public string Description { get; set; } = "";
    public string Rarity { get; set; } = "adi";
}

public sealed class GameTask
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string PlaceId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Type { get; set; } = "find";
    public string Difficulty { get; set; } = "easy";
    public int Xp { get; set; }
    public string Payload { get; set; } = "{}";
    public int CoopSize { get; set; }
    public bool NeedsReview { get; set; } = true;
}

public sealed class TaskCompletion
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string TaskId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public bool Correct { get; set; }
    public DateTimeOffset CompletedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class XpEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public string PlaceId { get; set; } = "";
    public string? TaskId { get; set; }
    public string Kind { get; set; } = "base";
    public int Amount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class LanternIgnition
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string BakuDate { get; set; } = "";
    public int ConsecutiveDays { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Checkin
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string PlaceId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public bool Valid { get; set; }
    public double AccuracyMeters { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class GameGroup
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "";
    public string InviteCode { get; set; } = "";
    public string OwnerUserId { get; set; } = "";
    public bool IsOpenLeague { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class GroupMember
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string GroupId { get; set; } = "";
    public string UserId { get; set; } = "";
    public DateTimeOffset JoinedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class CoopSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string TaskId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public string PlaceId { get; set; } = "";
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public bool Completed { get; set; }
}

public sealed class CoopParticipant
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SessionId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Role { get; set; } = "";
    public string? Answer { get; set; }
    public DateTimeOffset? AnsweredAtUtc { get; set; }
    public DateTimeOffset JoinedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Souvenir
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string PlaceId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Rarity { get; set; } = "adi";
    public bool IsRareFlame { get; set; }
}

public sealed class UserSouvenir
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string SouvenirId { get; set; } = "";
    public DateTimeOffset EarnedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Avatar
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int UnlockLevel { get; set; }
    public string Illustration { get; set; } = "";
}

public sealed class SeasonResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SeasonId { get; set; } = "";
    public string UserId { get; set; } = "";
    public int Rank { get; set; }
    public int WeeklyXp { get; set; }
    public bool PrizeEligible { get; set; }
}

public sealed class TerritorySnapshot
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SeasonId { get; set; } = "";
    public string PlaceId { get; set; } = "";
    public string UniversityId { get; set; } = "";
    public int Score { get; set; }
    public bool Final { get; set; }
}

public sealed class RewardClaim
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string SeasonId { get; set; } = "";
    public string Status { get; set; } = "pending_verification";
    public string VerificationHash { get; set; } = "";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class ActivityFlag
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}
