import { useEffect, useMemo } from "react";

export default function InteractionSystem({ playerPosition, targetPosition, collected, onNearby, onInteract }) {
  const distance = useMemo(() => {
    if (collected) return Infinity;
    const dx = playerPosition[0] - targetPosition[0];
    const dz = playerPosition[2] - targetPosition[2];
    return Math.sqrt(dx * dx + dz * dz);
  }, [collected, playerPosition, targetPosition]);
  const canInteract = distance < 1.75;

  useEffect(() => {
    onNearby(canInteract);
  }, [canInteract, onNearby]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key.toLowerCase() === "e" && canInteract) onInteract();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canInteract, onInteract]);

  return null;
}
