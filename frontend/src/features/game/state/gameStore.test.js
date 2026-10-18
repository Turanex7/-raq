import test from "node:test";
import assert from "node:assert/strict";
import { completeLevel, getGameProgress, saveGameProgress } from "./gameStore.js";

const entries = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
  },
};

test("minigame progress cannot grant or persist XP", () => {
  window.localStorage.setItem("ciraq-demo-progress", JSON.stringify({ xp: "client-award", completedLevels: [], inventory: [] }));
  assert.deepEqual(getGameProgress(), { completedLevels: [], inventory: [] });

  const saved = saveGameProgress({ xp: "client-award", completedLevels: [], inventory: [] });
  assert.deepEqual(saved, { completedLevels: [], inventory: [] });
  assert.equal(JSON.parse(window.localStorage.getItem("ciraq-demo-progress")).xp, undefined);

  const completed = completeLevel("icherisheher", "maiden-tower-light");
  assert.deepEqual(completed, { completedLevels: ["icherisheher"], inventory: ["maiden-tower-light"] });
  assert.equal("xp" in completed, false);
});
