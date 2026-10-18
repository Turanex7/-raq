const STORAGE_KEY = "ciraq-demo-progress";

const defaultProgress = {
  completedLevels: [],
  inventory: [],
};

function sanitizeProgress(value) {
  return {
    completedLevels: Array.isArray(value?.completedLevels) ? value.completedLevels.filter((item) => typeof item === "string") : [],
    inventory: Array.isArray(value?.inventory) ? value.inventory.filter((item) => typeof item === "string") : [],
  };
}

function readStoredProgress() {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    const progress = sanitizeProgress(JSON.parse(stored));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return progress;
  } catch {
    return defaultProgress;
  }
}

export function getGameProgress() {
  return readStoredProgress();
}

export function saveGameProgress(progress) {
  const next = sanitizeProgress(progress);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function completeLevel(levelId, artifactId) {
  const current = readStoredProgress();
  const completedLevels = current.completedLevels.includes(levelId)
    ? current.completedLevels
    : [...current.completedLevels, levelId];
  const inventory = artifactId && !current.inventory.includes(artifactId)
    ? [...current.inventory, artifactId]
    : current.inventory;
  return saveGameProgress({
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
