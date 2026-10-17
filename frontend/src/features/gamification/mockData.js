/** Demo data matching the MVP API contract. Replace with services/ calls later. */

export const XP_PER_LEVEL = 250;

export function getLevelFromXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpProgress(xp) {
  const level = getLevelFromXp(xp);
  const current = xp % XP_PER_LEVEL;
  const percent = Math.min(100, Math.round((current / XP_PER_LEVEL) * 100));

  return {
    level,
    xp,
    current,
    needed: XP_PER_LEVEL,
    remaining: XP_PER_LEVEL - current,
    percent,
  };
}

/** GET /api/users/me */
export const currentUser = {
  id: "user_demo",
  name: "Aysel Məmmədova",
  university: "ADA Universiteti",
  avatarUrl: null,
  xp: 350,
  level: getLevelFromXp(350),
};

/** GET /api/users/me/rewards */
export const myRewards = [
  {
    id: "reward_buta",
    title: "Buta",
    description: "Xalça Muzeyi — Buta simvolunu tap və suala cavab ver",
    icon: "✨",
    earnedAt: "2026-10-17T10:12:00Z",
    museumId: "museum_001",
    questId: "quest_001",
  },
  {
    id: "reward_chiraq",
    title: "Çıraq",
    description: "İlk quest-i tamamladığın üçün rəqəmsal məşəl",
    icon: "🔥",
    earnedAt: "2026-10-17T10:12:00Z",
    museumId: "museum_001",
    questId: "quest_001",
  },
];

export const lockedRewards = [
  {
    id: "reward_carpet",
    title: "Şirvan xalçası",
    description: "Xalça Muzeyində 3 quest tamamla",
    icon: "🧶",
    earnedAt: null,
  },
  {
    id: "reward_manuscript",
    title: "Əlyazma nişanı",
    description: "Əlyazmalar İnstitutu quest-ini bitir",
    icon: "📜",
    earnedAt: null,
  },
];

/** GET /api/leaderboard?type=user */
export const userLeaderboard = [
  {
    rank: 1,
    userId: "user_001",
    name: "Nihad Quliyev",
    university: "Bakı Dövlət Universiteti",
    xp: 980,
    level: getLevelFromXp(980),
  },
  {
    rank: 2,
    userId: "user_002",
    name: "Leyla Hüseynova",
    university: "UNEC",
    xp: 740,
    level: getLevelFromXp(740),
  },
  {
    rank: 3,
    userId: "user_demo",
    name: currentUser.name,
    university: currentUser.university,
    xp: currentUser.xp,
    level: currentUser.level,
  },
  {
    rank: 4,
    userId: "user_004",
    name: "Kamran Əliyev",
    university: "AzTU",
    xp: 310,
    level: getLevelFromXp(310),
  },
  {
    rank: 5,
    userId: "user_005",
    name: "Fəridə İsmayılova",
    university: "ADNSU",
    xp: 220,
    level: getLevelFromXp(220),
  },
];

/** GET /api/leaderboard?type=university */
export const universityLeaderboard = [
  {
    rank: 1,
    university: "Bakı Dövlət Universiteti",
    xp: 15400,
    memberCount: 22,
  },
  {
    rank: 2,
    university: "ADA Universiteti",
    xp: 12150,
    memberCount: 18,
  },
  {
    rank: 3,
    university: "UNEC",
    xp: 9800,
    memberCount: 16,
  },
  {
    rank: 4,
    university: "AzTU",
    xp: 6400,
    memberCount: 11,
  },
  {
    rank: 5,
    university: "ADNSU",
    xp: 5100,
    memberCount: 9,
  },
];
