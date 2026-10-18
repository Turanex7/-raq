import { useEffect, useRef, useState } from "react";
import { Archive } from "lucide-react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const FRAGILE_CELLS = new Set([12, 27, 39, 52, 68]);
const ARTIFACT_CELLS = new Set([23, 24, 25, 26, 33, 34, 35, 36, 43, 44, 45, 46]);
const SOIL_COUNT = 80;

export default function HistoryGame({ durationSeconds, onFinish }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [cleared, setCleared] = useState(() => new Set());
  const [cracks, setCracks] = useState(0);
  const [pressed, setPressed] = useState(false);
  const clearedRef = useRef(new Set());
  const cracksRef = useRef(0);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        if (!finishedRef.current) { finishedRef.current = true; finishRef.current(clearedRef.current.size); }
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function brush(event) {
    if (finishedRef.current || (event.type === "pointermove" && !pressed && event.pointerType !== "touch")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(0.999, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(0.999, (event.clientY - bounds.top) / bounds.height));
    const column = Math.floor(x * 10);
    const row = Math.floor(y * 8);
    const index = row * 10 + column;
    if (clearedRef.current.has(index)) return;
    const next = new Set(clearedRef.current);
    next.add(index);
    clearedRef.current = next;
    setCleared(next);

    if (FRAGILE_CELLS.has(index)) {
      cracksRef.current += 1;
      setCracks(cracksRef.current);
      if (cracksRef.current >= 3) {
        finishedRef.current = true;
        finishRef.current(clearedRef.current.size);
        return;
      }
    }
    const artifactRevealed = [...ARTIFACT_CELLS].every((cell) => next.has(cell));
    if (artifactRevealed) {
      finishedRef.current = true;
      finishRef.current(next.size + 18);
    }
  }

  return <div className={`${shell.gameStage} ${styles.historyStage}`}>
    <p className={styles.digHint}>Adi torpağı silib artefaktı tap. Çəhrayı “!” sahəyə toxunma — 3 səhv qazıntını bitirir.</p>
    <div className={styles.artifact} aria-hidden="true"><Archive size="42%" /></div>
    <div className={styles.soilGrid} onPointerDown={(event) => { setPressed(true); event.currentTarget.setPointerCapture(event.pointerId); brush(event); }} onPointerMove={brush} onPointerUp={() => setPressed(false)} onPointerCancel={() => setPressed(false)} aria-label="Torpağı silmək üçün toxun və sürüşdür">
      {Array.from({ length: SOIL_COUNT }, (_, index) => <i key={index} className={`${styles.soil} ${FRAGILE_CELLS.has(index) ? styles.fragile : ""} ${cleared.has(index) ? styles.cleared : ""} ${FRAGILE_CELLS.has(index) && cleared.has(index) ? styles.cracked : ""}`} />)}
    </div>
    <span className={styles.brushHint}>{remaining} san. · Açılan sahə: {cleared.size}/{SOIL_COUNT} · Artefakt zədəsi: {cracks}/3</span>
  </div>;
}
