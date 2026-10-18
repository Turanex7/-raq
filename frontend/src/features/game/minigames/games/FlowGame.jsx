import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";
import { translate as t } from "../../../../i18n/i18n";

const centerAt = (progress, pathTurns) => 160 + 68 * Math.sin(progress * Math.PI * pathTurns);

export default function FlowGame({ durationSeconds, pathTurns = 4.5, edgeTolerance = 42, onFinish }) {
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
  const gamePath = useMemo(() => Array.from({ length: 81 }, (_, index) => {
    const nextProgress = index / 80;
    return `${index === 0 ? "M" : "L"}${centerAt(nextProgress, pathTurns).toFixed(1)},${(400 - nextProgress * 340).toFixed(1)}`;
  }).join(" "), [pathTurns]);
  const boundaryLeft = useMemo(() => gamePath.replace(/([ML])([\d.]+),([\d.]+)/g, (_, command, x, y) => `${command}${(Number(x) - 39).toFixed(1)},${y}`), [gamePath]);
  const boundaryRight = useMemo(() => gamePath.replace(/([ML])([\d.]+),([\d.]+)/g, (_, command, x, y) => `${command}${(Number(x) + 39).toFixed(1)},${y}`), [gamePath]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (finishedRef.current) return;
      const nextProgress = Math.min(1, progressRef.current + 1 / (durationSeconds * 10));
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      setRemaining(Math.max(0, Math.ceil(durationSeconds * (1 - nextProgress))));
      const center = centerAt(nextProgress, pathTurns);
      if (Math.abs(playerXRef.current - center) > edgeTolerance) {
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
  }, [durationSeconds, edgeTolerance, pathTurns]);

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
    <svg className={styles.flowSvg} viewBox="0 0 320 420" role="img" aria-label={t("Əyri cığırda işıqlı kürəni idarə et")} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveBall(event); }} onPointerMove={(event) => { if (event.buttons || event.pointerType === "touch") moveBall(event); }}>
      <path d={gamePath} fill="none" stroke="#17223d" strokeWidth="94" strokeLinecap="round" />
      <path d={gamePath} fill="none" stroke="#344765" strokeWidth="78" strokeLinecap="round" />
      <path d={boundaryLeft} fill="none" stroke="#a0e4c9" strokeOpacity=".72" strokeWidth="3" />
      <path d={boundaryRight} fill="none" stroke="#a0e4c9" strokeOpacity=".72" strokeWidth="3" />
      <path d={gamePath} fill="none" stroke="#f5b942" strokeOpacity=".22" strokeWidth="2" strokeDasharray="7 12" />
      <circle cx={playerX} cy={ballY} r="11" fill="#a0e4c9" opacity=".25" />
      <circle cx={playerX} cy={ballY} r="7" fill="#c9ffe9" stroke="#a0e4c9" strokeWidth="2" />
      <circle cx={playerX - 2} cy={ballY - 2} r="2" fill="#fff" />
    </svg>
    <div className={styles.flowControls} aria-label={t("Kürə idarəetməsi")}>
      <button type="button" onPointerDown={(event) => { event.preventDefault(); nudge(-1); }} aria-label={t("Sola yönəlt")}>←</button>
      <button type="button" onPointerDown={(event) => { event.preventDefault(); nudge(1); }} aria-label={t("Sağa yönəlt")}>→</button>
    </div>
    <span className={styles.brushHint}>{remaining} {t("san.")} · {t("Cığırda:")} {Math.round(progress * 100)}% · {t("Qalan fürsət:")} {lives}</span>
  </div>;
}
