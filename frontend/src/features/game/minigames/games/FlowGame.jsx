import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const centerAt = (progress) => 160 + 68 * Math.sin(progress * Math.PI * 3);
const path = Array.from({ length: 81 }, (_, index) => {
  const progress = index / 80;
  return `${index === 0 ? "M" : "L"}${centerAt(progress).toFixed(1)},${(400 - progress * 340).toFixed(1)}`;
}).join(" ");

export default function FlowGame({ durationSeconds, onFinish }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [progress, setProgress] = useState(0);
  const [playerX, setPlayerX] = useState(160);
  const [lives, setLives] = useState(3);
  const progressRef = useRef(0);
  const playerXRef = useRef(160);
  const livesRef = useRef(3);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);
  const boundaryLeft = useMemo(() => path.replace(/([ML])([\d.]+),([\d.]+)/g, (_, command, x, y) => `${command}${(Number(x) - 44).toFixed(1)},${y}`), []);
  const boundaryRight = useMemo(() => path.replace(/([ML])([\d.]+),([\d.]+)/g, (_, command, x, y) => `${command}${(Number(x) + 44).toFixed(1)},${y}`), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (finishedRef.current) return;
      const nextProgress = Math.min(1, progressRef.current + 1 / (durationSeconds * 10));
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      setRemaining(Math.max(0, Math.ceil(durationSeconds * (1 - nextProgress))));
      const center = centerAt(nextProgress);
      if (Math.abs(playerXRef.current - center) > 51) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        playerXRef.current = center;
        setPlayerX(center);
        if (livesRef.current <= 0) {
          finishedRef.current = true;
          finishRef.current(Math.round(nextProgress * 100));
          return;
        }
      }
      if (nextProgress >= 1) {
        finishedRef.current = true;
        finishRef.current(100 - (3 - livesRef.current) * 12);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [durationSeconds]);

  function moveBall(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(18, Math.min(302, (event.clientX - bounds.left) / bounds.width * 320));
    playerXRef.current = x;
    setPlayerX(x);
  }

  function nudge(direction) {
    const x = Math.max(18, Math.min(302, playerXRef.current + direction * 24));
    playerXRef.current = x;
    setPlayerX(x);
  }

  const ballY = 400 - progress * 340;
  return <div className={`${shell.gameStage} ${styles.flowStage}`}>
    <svg className={styles.flowSvg} viewBox="0 0 320 420" role="img" aria-label="Əyri cığırda işıqlı kürəni idarə et" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveBall(event); }} onPointerMove={(event) => { if (event.buttons || event.pointerType === "touch") moveBall(event); }}>
      <path d={path} fill="none" stroke="#17223d" strokeWidth="104" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#344765" strokeWidth="88" strokeLinecap="round" />
      <path d={boundaryLeft} fill="none" stroke="#a0e4c9" strokeOpacity=".72" strokeWidth="3" />
      <path d={boundaryRight} fill="none" stroke="#a0e4c9" strokeOpacity=".72" strokeWidth="3" />
      <path d={path} fill="none" stroke="#f5b942" strokeOpacity=".22" strokeWidth="2" strokeDasharray="7 12" />
      <circle cx={playerX} cy={ballY} r="11" fill="#a0e4c9" opacity=".25" />
      <circle cx={playerX} cy={ballY} r="7" fill="#c9ffe9" stroke="#a0e4c9" strokeWidth="2" />
      <circle cx={playerX - 2} cy={ballY - 2} r="2" fill="#fff" />
    </svg>
    <div className={styles.flowControls} aria-label="Kürə idarəetməsi">
      <button type="button" onPointerDown={(event) => { event.preventDefault(); nudge(-1); }} aria-label="Sola yönəlt">←</button>
      <button type="button" onPointerDown={(event) => { event.preventDefault(); nudge(1); }} aria-label="Sağa yönəlt">→</button>
    </div>
    <span className={styles.brushHint}>{remaining} san. · Cığırda: {Math.round(progress * 100)}% · Qalan fürsət: {lives}</span>
  </div>;
}
