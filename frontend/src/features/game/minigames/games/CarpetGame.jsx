import { useEffect, useRef, useState } from "react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const COLORS = ["#f5b942", "#a0e4c9", "#be8cff", "#f07a72", "#75b8ff"];

export default function CarpetGame({ durationSeconds, onFinish }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [targetColumn, setTargetColumn] = useState(0);
  const [hits, setHits] = useState(0);
  const [rows, setRows] = useState([]);
  const hitsRef = useRef(0);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        if (!finishedRef.current) { finishedRef.current = true; finishRef.current(hitsRef.current); }
        return 0;
      }
      return value - 1;
    }), 1000);
    const thread = window.setInterval(() => setTargetColumn((value) => (value + 1 + Math.floor(Math.random() * 2)) % COLORS.length), 1050);
    return () => { window.clearInterval(timer); window.clearInterval(thread); };
  }, []);

  function hitColumn(index) {
    if (finishedRef.current || index !== targetColumn) return;
    hitsRef.current += 1;
    setHits(hitsRef.current);
    setRows((current) => [...current, Array.from({ length: 5 }, (_, column) => (column + hitsRef.current) % COLORS.length)].slice(-7));
    setTargetColumn((current) => (current + 2) % COLORS.length);
  }

  return <div className={`${shell.gameStage} ${styles.carpetStage}`}>
    <div className={styles.scoreLine}><span>Toxunan sıra</span><b>{hits}</b><span>{remaining} san.</span></div>
    <div className={styles.pattern} aria-label={`${hits} sıra xalça toxunub`}>
      {rows.map((row, index) => <div className={styles.patternRow} key={`${index}-${row.join("")}`}>{row.map((colorIndex, column) => <i key={column} className={styles.patternCell} style={{ background: COLORS[colorIndex] }} />)}</div>)}
      {rows.length === 0 && <span className={styles.patternRow} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i className={styles.patternCell} key={index} />)}</span>}
    </div>
    <div className={styles.columns} aria-label="İp sütunları">
      {COLORS.map((color, index) => <button key={color} type="button" onClick={() => hitColumn(index)} className={`${styles.column} ${targetColumn === index ? styles.columnActive : ""}`} aria-label={`${index + 1}-ci ip sütunu${targetColumn === index ? ", toxun" : ""}`}>
        <i className={styles.thread} style={{ "--thread-color": color }} />
        <span className={styles.columnLabel}>{index + 1}</span>
      </button>)}
    </div>
    <p className={shell.resultText}>Parlayan ipi vaxtında toxuyaraq naxışı tamamla.</p>
  </div>;
}
