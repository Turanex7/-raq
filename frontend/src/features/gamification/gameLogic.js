import { GAME_CONFIG } from "./gameConfig.js";

export function getWeeklyXp(completions, multiplier = 1) {
  const byDay = new Map();
  for (const item of completions) byDay.set(item.day, (byDay.get(item.day) || 0) + item.baseXp);
  let streak = 0;
  let sum = 0;
  for (let day = 0; day < GAME_CONFIG.daysPerWeek; day += 1) {
    if (byDay.has(day)) streak = Math.min(streak + 1, GAME_CONFIG.streak.capDays);
    else streak = 0;
    sum += (byDay.get(day) || 0) * (1 + (byDay.has(day) ? streak * GAME_CONFIG.streak.dailyPercent / 100 : 0));
  }
  return Math.round(sum * multiplier);
}

export function applyTieBreak(rows) {
  return [...rows].sort((a, b) => (b.weeklyXp ?? b.xp) - (a.weeklyXp ?? a.xp) || b.correctAnswers - a.correctAnswers || a.reachedAt - b.reachedAt);
}

export function rankUniversities(users, topN = GAME_CONFIG.universityRanking.topMembers) {
  return Object.values(users.reduce((acc, user) => {
    if (!acc[user.university]) acc[user.university] = [];
    acc[user.university].push(user);
    return acc;
  }, {})).map((members) => {
    const activeMembers = members.filter((user) => (user.weeklyXp ?? user.xp) > 0);
    const sorted = [...activeMembers].sort((a, b) => (b.weeklyXp ?? b.xp) - (a.weeklyXp ?? a.xp)).slice(0, topN);
    return { university: members[0].university, memberCount: activeMembers.length, xp: Math.round(sorted.reduce((s, user) => s + (user.weeklyXp ?? user.xp), 0) / Math.max(1, sorted.length)), eligible: activeMembers.length >= GAME_CONFIG.universityRanking.minimumActive };
  }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.xp - a.xp);
}

export function assignPrizes(rankedUsers, overallPrize, universityPrize) {
  const overall = rankedUsers[0] || null;
  const university = overall ? rankedUsers.find((user) => user.university === overall.university && user.id !== overall.id) || null : rankedUsers[0] || null;
  return { overall: overall && { ...overall, prize: overallPrize }, university: university && { ...university, prize: universityPrize } };
}

export function multiplierForLastWeek(rank) {
  return GAME_CONFIG.universityMultipliers[rank - 1] || 1;
}
