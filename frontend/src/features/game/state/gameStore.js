const STORAGE_KEY = "ciraq-demo-progress";

const defaultProgress = {
  xp: 0,
  completedLevels: [],
  inventory: [],
};

function readStoredProgress() {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export function getGameProgress() {
  return readStoredProgress();
}

export function saveGameProgress(progress) {
  const next = { ...defaultProgress, ...progress };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function completeLevel(levelId, xp, artifactId) {
  const current = readStoredProgress();
  const completedLevels = current.completedLevels.includes(levelId)
    ? current.completedLevels
    : [...current.completedLevels, levelId];
  const inventory = artifactId && !current.inventory.includes(artifactId)
    ? [...current.inventory, artifactId]
    : current.inventory;
  return saveGameProgress({
    xp: current.xp + (current.completedLevels.includes(levelId) ? 0 : xp),
    completedLevels,
    inventory,
  });
}

export function isLevelUnlocked(level) {
  if (!level.requires) return true;
  return readStoredProgress().completedLevels.includes(level.requires);
}

export function resetGameProgress() {
  return saveGameProgress(defaultProgress);
}
