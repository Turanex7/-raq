import { useEffect, useRef, useState } from "react";
import { Archive } from "lucide-react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const FRAGILE_CELLS = new Set([12, 27, 39, 52, 68]);
const SOIL_COUNT = 80;
const SAFE_CELL_COUNT = SOIL_COUNT - FRAGILE_CELLS.size;

export default function HistoryGame({ durationSeconds, scoreBaseMs = 60_000, onFinish }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [cleared, setCleared] = useState(() => new Set());
  const [pressed, setPressed] = useState(false);
  const clearedRef = useRef(new Set());
  const lastCellRef = useRef(null);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          finishRef.current(0, { outcome: "lost", reason: "timeout" });
        }
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function clearCell(index) {
    if (finishedRef.current || clearedRef.current.has(index)) return !finishedRef.current;
    if (FRAGILE_CELLS.has(index)) {
      finishedRef.current = true;
      finishRef.current(0, { outcome: "lost", reason: "hazard" });
      return false;
    }
    const next = new Set(clearedRef.current);
    next.add(index);
    clearedRef.current = next;
    setCleared(next);

    if (next.size === SAFE_CELL_COUNT) {
      finishedRef.current = true;
      const elapsedMs = Math.max(0, Date.now() - startedAtRef.current);
      finishRef.current(Math.max(0, Math.floor(scoreBaseMs - elapsedMs)), { outcome: "won", elapsedMs });
      return false;
    }
    return true;
  }

  function brush(event) {
    if (finishedRef.current || (event.type === "pointermove" && !pressed && event.pointerType !== "touch")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(0.999, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(0.999, (event.clientY - bounds.top) / bounds.height));
    const cell = { column: Math.floor(x * 10), row: Math.floor(y * 8) };
    const previous = lastCellRef.current;
    if (!previous) {
      if (!clearCell(cell.row * 10 + cell.column)) return;
    } else {
      const deltaColumn = cell.column - previous.column;
      const deltaRow = cell.row - previous.row;
      const steps = Math.max(Math.abs(deltaColumn), Math.abs(deltaRow)) * 2;
      for (let step = 1; step <= steps; step += 1) {
        const column = Math.round(previous.column + deltaColumn * step / steps);
        const row = Math.round(previous.row + deltaRow * step / steps);
        if (!clearCell(row * 10 + column)) {
          lastCellRef.current = null;
          return;
        }
      }
    }
    lastCellRef.current = cell;
  }

  return <div className={`${shell.gameStage} ${styles.historyStage}`}>
    <p className={styles.digHint}>Nida işarəli sahələrə toxunmadan bütün torpağı təmizlə. 13 saniyəyədək: 3 ulduz · 13 saniyədən çox, 16 saniyəyədək: 2 ulduz · daha çox: 1 ulduz.</p>
    <div className={styles.artifact} aria-hidden="true"><Archive size="42%" /></div>
    <div className={styles.soilGrid} onPointerDown={(event) => { setPressed(true); lastCellRef.current = null; event.currentTarget.setPointerCapture(event.pointerId); brush(event); }} onPointerMove={brush} onPointerUp={() => { setPressed(false); lastCellRef.current = null; }} onPointerCancel={() => { setPressed(false); lastCellRef.current = null; }} aria-label="Nida işarəli sahələrə toxunmadan torpağı sil">
      {Array.from({ length: SOIL_COUNT }, (_, index) => <i key={index} className={`${styles.soil} ${FRAGILE_CELLS.has(index) ? styles.fragile : ""} ${cleared.has(index) ? styles.cleared : ""} ${FRAGILE_CELLS.has(index) && cleared.has(index) ? styles.cracked : ""}`} />)}
    </div>
    <span className={styles.brushHint}>{remaining} san. · Təmizlənib: {cleared.size}/{SAFE_CELL_COUNT}</span>
  </div>;
}
