const seededAvatarIds = ["nizami", "uzeyir", "nesimi", "natavan", "babek"];

export function seededAvatarId(userId) {
  const match = /^seed-(\d+)$/.exec(String(userId || ""));
  if (!match) return null;
  return seededAvatarIds[(Number(match[1]) - 1) % seededAvatarIds.length] || null;
}
