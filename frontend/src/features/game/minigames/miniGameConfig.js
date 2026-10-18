export const MINI_GAME_CONFIG = Object.freeze({
  completionXp: 3,
  dailyAwardLimit: 3,
  bakuTimeZone: "Asia/Baku",
  carpet: { durationSeconds: 45, targetIntervalMs: 780, oneStar: 5, twoStars: 11, threeStars: 18 },
  history: { durationSeconds: 45, scoreBaseMs: 60_000, resultMetric: "completion-time", oneStar: 1, twoStars: 40_000, threeStars: 47_000 },
  flow: { durationSeconds: 40, pathTurns: 4.5, edgeTolerance: 42, oneStar: 60, twoStars: 85, threeStars: 100 },
  tower: { durationSeconds: 14, speedBase: 0.38, speedRamp: 0.02, speedPattern: [1.8, 0.55, 1], oneStar: 1, twoStars: 35, threeStars: 55 },
});
