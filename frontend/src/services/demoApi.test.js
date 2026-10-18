import test from "node:test";
import assert from "node:assert/strict";
import { clearDemoApiState, demoApiRequest } from "./demoApi.js";

test("demo API persists a daily lantern streak, awards on day seven, and resets after a missed day", async (t) => {
  const OriginalDate = globalThis.Date;
  let now = new OriginalDate("2026-10-11T12:00:00.000Z");
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Demo API must not use fetch."); };
  globalThis.Date = class DemoTestDate extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now.getTime(); }
  };
  t.after(() => {
    clearDemoApiState();
    globalThis.Date = OriginalDate;
    globalThis.fetch = originalFetch;
    delete globalThis.window;
  });

  const account = await demoApiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Demo İştirakçı", email: "demo@example.test", password: "demo-password",
      universityId: "bdu", avatarId: "nizami", visitedMuseumLast12Months: null,
    }),
  });
  window.localStorage.setItem("chiraq_token", account.token);

  const [config, universities, avatars, places] = await Promise.all([
    demoApiRequest("/config"),
    demoApiRequest("/universities"),
    demoApiRequest("/avatars"),
    demoApiRequest("/places"),
  ]);
  assert.deepEqual(config.daily_lantern, { streak_days: 7, milestone_xp: 10, time_zone: "Asia/Baku" });
  assert.equal(universities.length, 41);
  assert.equal(avatars.length, 5);
  assert.equal(places.length, 11);
  assert.equal(places.find((place) => place.slug === "ateshgah").status, "locked");

  let result;
  for (let day = 0; day < 7; day += 1) {
    now = new OriginalDate("2026-10-11T12:00:00.000Z");
    now.setUTCDate(now.getUTCDate() + day);
    result = await demoApiRequest("/lantern/ignite", { method: "POST", body: "{}" });
    assert.equal(result.xp_awarded, day === 6 ? 10 : 0);
  }
  assert.equal(result.lantern.streak_days, 7);
  assert.equal(result.lantern.progress_day, 7);

  const repeated = await demoApiRequest("/lantern/ignite", { method: "POST", body: "{}" });
  assert.equal(repeated.already_lit_today, true);
  assert.equal(repeated.xp_awarded, 0);
  assert.equal(repeated.new_total, 10);

  now = new OriginalDate("2026-10-19T12:00:00.000Z");
  const missed = await demoApiRequest("/me");
  assert.equal(missed.lantern.streak_days, 0);
  assert.equal(missed.lantern.missed_day, true);
  const restarted = await demoApiRequest("/lantern/ignite", { method: "POST", body: "{}" });
  assert.equal(restarted.streak_reset, true);
  assert.equal(restarted.lantern.streak_days, 1);
  assert.equal(restarted.xp_awarded, 0);
  assert.equal(restarted.new_total, 10);
});

test("demo mini-games award fixed XP once per place and enforce the Baku-day cap", async (t) => {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    },
  };
  t.after(() => { clearDemoApiState(); delete globalThis.window; });

  const registration = await demoApiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Demo Oyunçu", email: "mini-game-rules@example.test", password: "test-password-2026", universityId: "ada", avatarId: "nizami" }),
  });
  window.localStorage.setItem("chiraq_token", registration.token);

  const first = await demoApiRequest("/places/place-carpet-museum/minigame/complete", { method: "POST", body: JSON.stringify({ score: 999_999, stars: 3 }) });
  assert.equal(first.awarded, true);
  assert.equal(first.xp_awarded, 3);
  const replay = await demoApiRequest("/places/place-carpet-museum/minigame/complete", { method: "POST", body: JSON.stringify({ score: 999_999, stars: 3 }) });
  assert.equal(replay.reason, "already_awarded_today");
  assert.equal(replay.xp_awarded, 0);

  await demoApiRequest("/places/place-national-history/minigame/complete", { method: "POST", body: JSON.stringify({ score: 1, stars: 1 }) });
  await demoApiRequest("/places/place-heydar-aliyev/minigame/complete", { method: "POST", body: JSON.stringify({ score: 1, stars: 1 }) });
  const capped = await demoApiRequest("/places/place-icherisheher/minigame/complete", { method: "POST", body: JSON.stringify({ score: 1, stars: 1 }) });
  assert.equal(capped.reason, "daily_limit");
  assert.equal(capped.xp_awarded, 0);
  assert.equal((await demoApiRequest("/me")).lifetimeXp, 9);
});
