namespace Chiraq.Api;

public sealed record TerritoryLedgerEntry(string UniversityId, string UserId, int Amount, DateTimeOffset CreatedAtUtc);

public sealed record TerritoryRanking(string UniversityId, int Score, int Participants, DateTimeOffset ReachedAtUtc, bool Tied);

public static class TerritoryRules
{
    public static IReadOnlyList<TerritoryRanking> Rank(IEnumerable<TerritoryLedgerEntry> ledger)
    {
        var scores = ledger.GroupBy(x => x.UniversityId).Select(group =>
        {
            var entries = group.OrderBy(x => x.CreatedAtUtc).ToArray();
            var visitors = entries.GroupBy(x => x.UserId).Select(visitor => visitor.Sum(x => x.Amount)).ToArray();
            var score = GameRules.TerritoryPerCapitaScore(visitors);
            var runningXp = 0;
            var reachedAt = entries[^1].CreatedAtUtc;
            foreach (var entry in entries)
            {
                runningXp += entry.Amount;
                if (Math.Round(runningXp / (double)visitors.Length) >= score)
                {
                    reachedAt = entry.CreatedAtUtc;
                    break;
                }
            }

            return new TerritoryRanking(group.Key, score, visitors.Length, reachedAt, false);
        }).OrderByDescending(x => x.Score).ThenBy(x => x.ReachedAtUtc).ThenBy(x => x.UniversityId, StringComparer.Ordinal).ToList();

        if (scores.Count > 1 && scores[0].Score == scores[1].Score && scores[0].ReachedAtUtc == scores[1].ReachedAtUtc)
        {
            scores[0] = scores[0] with { Tied = true };
            scores[1] = scores[1] with { Tied = true };
        }

        return scores;
    }
}
