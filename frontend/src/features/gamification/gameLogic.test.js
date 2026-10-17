import test from "node:test";
import assert from "node:assert/strict";
import { applyTieBreak, assignPrizes, getWeeklyXp, rankUniversities } from "./gameLogic.js";
import { GAME_CONFIG, WEEKLY_PINS } from "./gameConfig.js";

test("full week with rare pin earns more than the rare pin alone", () => {
  const rareOnly = getWeeklyXp([{ day: 5, baseXp: GAME_CONFIG.xp.rare }]);
  const fullWeek = [
    ...Array.from({ length: GAME_CONFIG.daysPerWeek }, (_, day) => ({ day, baseXp: GAME_CONFIG.xp.popular })),
    { day: 1, baseXp: GAME_CONFIG.xp.museum }, { day: 4, baseXp: GAME_CONFIG.xp.museum }, { day: 5, baseXp: GAME_CONFIG.xp.rare },
  ];
  assert.ok(getWeeklyXp(fullWeek) > rareOnly);
  const baseWithoutRare = WEEKLY_PINS.filter((pin) => pin.type !== "rare").reduce((sum, pin) => sum + GAME_CONFIG.xp[pin.type], 0);
  assert.equal(baseWithoutRare, 150);
});

test("ties are resolved by correct answers, then earlier score time", () => {
  const result = applyTieBreak([
    { id: "late", xp: 100, correctAnswers: 2, reachedAt: 20 },
    { id: "few", xp: 100, correctAnswers: 1, reachedAt: 1 },
    { id: "early", xp: 100, correctAnswers: 2, reachedAt: 10 },
  ]);
  assert.deepEqual(result.map((item) => item.id), ["early", "late", "few"]);
});

test("top-member university average is size independent and requires three members", () => {
  const users = [
    ...Array.from({ length: 5 }, (_, index) => ({ university: "Uni A", weeklyXp: 100 - index * 10 })),
    ...Array.from({ length: 25 }, (_, index) => ({ university: "Uni B", weeklyXp: index < 5 ? 80 : 0 })),
    ...Array.from({ length: 2 }, () => ({ university: "Uni C", weeklyXp: 999 })),
  ];
  const ranks = rankUniversities(users, 10);
  assert.equal(ranks.find((item) => item.university === "Uni A").xp, 80);
  assert.equal(ranks.find((item) => item.university === "Uni B").xp, 80);
  assert.equal(ranks.find((item) => item.university === "Uni C").eligible, false);
});

test("overall winner cannot also receive their university prize", () => {
  const result = assignPrizes([
    { id: "winner", university: "Uni A", xp: 500 },
    { id: "next", university: "Uni A", xp: 400 },
    { id: "other", university: "Uni B", xp: 300 },
  ], "big", "small");
  assert.equal(result.overall.id, "winner");
  assert.equal(result.university.id, "next");
  assert.notEqual(result.overall.id, result.university.id);
});
