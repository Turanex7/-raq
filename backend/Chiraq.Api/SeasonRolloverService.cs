using Chiraq.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Chiraq.Api;

public sealed class SeasonRolloverService(IServiceScopeFactory scopeFactory, ILogger<SeasonRolloverService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await FinalizeExpiredSeasons(stoppingToken); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception error) { logger.LogError(error, "Season rollover check failed"); }
            try { await timer.WaitForNextTickAsync(stoppingToken); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
        }
    }

    private async Task FinalizeExpiredSeasons(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTimeOffset.UtcNow;
        var expired = await db.Seasons.Where(x => !x.Finalized && x.EndsAtUtc < now).OrderBy(x => x.EndsAtUtc).ToListAsync(cancellationToken);
        foreach (var season in expired)
        {
            await ApiRoutes.FinalizeSeasonAsync(db, season);
            logger.LogInformation("Finalized season {SeasonId} at scheduled end", season.Id);
        }
    }
}
