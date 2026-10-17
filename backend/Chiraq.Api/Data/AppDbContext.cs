using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Chiraq.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<University> Universities => Set<University>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<GameTask> Tasks => Set<GameTask>();
    public DbSet<TaskCompletion> TaskCompletions => Set<TaskCompletion>();
    public DbSet<XpEvent> XpEvents => Set<XpEvent>();
    public DbSet<Checkin> Checkins => Set<Checkin>();
    public DbSet<GameGroup> Groups => Set<GameGroup>();
    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
    public DbSet<CoopSession> CoopSessions => Set<CoopSession>();
    public DbSet<CoopParticipant> CoopParticipants => Set<CoopParticipant>();
    public DbSet<Souvenir> Souvenirs => Set<Souvenir>();
    public DbSet<UserSouvenir> UserSouvenirs => Set<UserSouvenir>();
    public DbSet<Avatar> Avatars => Set<Avatar>();
    public DbSet<SeasonResult> SeasonResults => Set<SeasonResult>();
    public DbSet<TerritorySnapshot> TerritorySnapshots => Set<TerritorySnapshot>();
    public DbSet<RewardClaim> RewardClaims => Set<RewardClaim>();
    public DbSet<ActivityFlag> ActivityFlags => Set<ActivityFlag>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<University>().HasKey(x => x.Id);
        model.Entity<Season>().HasKey(x => x.Id);
        model.Entity<AppUser>().HasKey(x => x.Id);
        model.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        model.Entity<Place>().HasKey(x => x.Id);
        model.Entity<Place>().HasIndex(x => x.Slug).IsUnique();
        model.Entity<GameTask>().HasKey(x => x.Id);
        model.Entity<GameTask>().HasIndex(x => new { x.PlaceId, x.Code }).IsUnique();
        model.Entity<TaskCompletion>().HasKey(x => x.Id);
        model.Entity<TaskCompletion>().HasIndex(x => new { x.UserId, x.TaskId, x.SeasonId }).IsUnique();
        model.Entity<XpEvent>().HasKey(x => x.Id);
        model.Entity<XpEvent>().HasIndex(x => new { x.UserId, x.SeasonId });
        model.Entity<XpEvent>().HasIndex(x => new { x.UserId, x.SeasonId, x.PlaceId })
            .IsUnique().HasFilter("\"Kind\" = 'group_bonus'");
        model.Entity<Checkin>().HasKey(x => x.Id);
        model.Entity<Checkin>().HasIndex(x => new { x.UserId, x.PlaceId, x.SeasonId }).IsUnique();
        model.Entity<GameGroup>().HasKey(x => x.Id);
        model.Entity<GameGroup>().HasIndex(x => x.InviteCode).IsUnique();
        model.Entity<GroupMember>().HasKey(x => x.Id);
        model.Entity<GroupMember>().HasIndex(x => new { x.GroupId, x.UserId }).IsUnique();
        model.Entity<CoopSession>().HasKey(x => x.Id);
        model.Entity<CoopParticipant>().HasKey(x => x.Id);
        model.Entity<CoopParticipant>().HasIndex(x => new { x.SessionId, x.UserId }).IsUnique();
        model.Entity<Souvenir>().HasKey(x => x.Id);
        model.Entity<Souvenir>().HasIndex(x => new { x.PlaceId, x.SeasonId }).IsUnique();
        model.Entity<UserSouvenir>().HasKey(x => x.Id);
        model.Entity<UserSouvenir>().HasIndex(x => new { x.UserId, x.SouvenirId }).IsUnique();
        model.Entity<Avatar>().HasKey(x => x.Id);
        model.Entity<SeasonResult>().HasKey(x => x.Id);
        model.Entity<SeasonResult>().HasIndex(x => new { x.SeasonId, x.UserId }).IsUnique();
        model.Entity<TerritorySnapshot>().HasKey(x => x.Id);
        model.Entity<TerritorySnapshot>().HasIndex(x => new { x.SeasonId, x.PlaceId, x.Final }).IsUnique();
        model.Entity<RewardClaim>().HasKey(x => x.Id);
        model.Entity<ActivityFlag>().HasKey(x => x.Id);
        foreach (var property in model.Model.GetEntityTypes().SelectMany(x => x.GetProperties()).Where(x => x.ClrType == typeof(DateTimeOffset)))
            property.SetValueConverter(new DateTimeOffsetToBinaryConverter());
    }
}
