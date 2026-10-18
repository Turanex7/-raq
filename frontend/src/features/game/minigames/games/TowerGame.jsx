import { useEffect, useRef, useState } from "react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const MAX_BLOCKS = 12;
const BLOCK_HEIGHT = 21;
const DEFAULT_SPEED_PATTERN = Object.freeze([1.8, 0.55, 1]);
const SPEED_LABELS = ["Çox sürətli", "Yavaş", "Normal"];

function scoreTower(blockCount, width, baseWidth) {
  if (blockCount === 0 || baseWidth <= 0) return 0;
  const widthRatio = Math.max(0, Math.min(1, width / baseWidth));
  const heightFactor = Math.min(1, blockCount / 3);
  return Math.max(1, Math.round(widthRatio * heightFactor * 100));
}

export default function TowerGame({ durationSeconds, speedBase = 0.38, speedRamp = 0.02, speedPattern = DEFAULT_SPEED_PATTERN, onFinish }) {
  const areaRef = useRef(null);
  const [areaWidth, setAreaWidth] = useState(0);
  const [blockWidth, setBlockWidth] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [movingX, setMovingX] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const movingXRef = useRef(0);
  const widthRef = useRef(0);
  const centerRef = useRef(0);
  const directionRef = useRef(1);
  const blocksRef = useRef([]);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const width = areaRef.current?.clientWidth || 0;
    widthRef.current = width * 0.72;
    centerRef.current = width / 2;
    setAreaWidth(width);
    setBlockWidth(width * 0.72);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          finishRef.current(scoreTower(blocksRef.current.length, widthRef.current, areaWidth * 0.72));
        }
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [areaWidth]);

  useEffect(() => {
    if (!areaWidth) return undefined;
    const tick = window.setInterval(() => {
      if (finishedRef.current) return;
      const maxX = Math.max(0, areaWidth - widthRef.current);
      const speedMultiplier = speedPattern[blocksRef.current.length % speedPattern.length] || 1;
      const speed = Math.max(1.6, areaWidth * (speedBase + blocksRef.current.length * speedRamp) * speedMultiplier / 60);
      let next = movingXRef.current + speed * directionRef.current;
      if (next >= maxX) { next = maxX; directionRef.current = -1; }
      if (next <= 0) { next = 0; directionRef.current = 1; }
      movingXRef.current = next;
      setMovingX(next);
    }, 16);
    return () => window.clearInterval(tick);
  }, [areaWidth, speedBase, speedRamp, speedPattern]);

  function dropBlock() {
    if (finishedRef.current || !areaWidth) return;
    const previousWidth = widthRef.current || areaWidth * 0.72;
    const previousCenter = centerRef.current || areaWidth / 2;
    const dropX = movingXRef.current;
    const left = Math.max(dropX, previousCenter - previousWidth / 2);
    const right = Math.min(dropX + previousWidth, previousCenter + previousWidth / 2);
    const overlap = right - left;
    if (overlap <= 0) {
      finishedRef.current = true;
      finishRef.current(scoreTower(blocksRef.current.length, widthRef.current, areaWidth * 0.72));
      return;
    }
    const nextWidth = overlap;
    const nextCenter = (left + right) / 2;
    const nextBlocks = [...blocksRef.current, { center: nextCenter, width: nextWidth }];
    blocksRef.current = nextBlocks;
    widthRef.current = nextWidth;
    centerRef.current = nextCenter;
    setBlockWidth(nextWidth);
    setBlocks(nextBlocks);
    if (nextWidth < 34 || nextBlocks.length >= MAX_BLOCKS) {
      finishedRef.current = true;
      finishRef.current(scoreTower(nextBlocks.length, nextWidth, areaWidth * 0.72));
      return;
    }
    movingXRef.current = 0;
    directionRef.current = 1;
    setMovingX(0);
  }

  const speedLabel = SPEED_LABELS[blocks.length % SPEED_LABELS.length];
  const retainedWidth = areaWidth ? Math.round(blockWidth / (areaWidth * 0.72) * 100) : 100;

  return <div className={`${shell.gameStage} ${styles.towerStage}`}>
    <div className={styles.towerArea} ref={areaRef}>
      <div className={styles.towerBase} style={{ width: `${blockWidth ? blockWidth / Math.max(areaWidth, 1) * 100 : 72}%` }} />
      {blocks.map((block, index) => <i key={index} className={styles.towerBlock} style={{ left: `${block.center / Math.max(areaWidth, 1) * 100}%`, width: `${block.width / Math.max(areaWidth, 1) * 100}%`, bottom: `${(index + 1) * BLOCK_HEIGHT}px`, transform: "translateX(-50%)" }} />)}
      <i className={`${styles.towerBlock} ${styles.movingBlock}`} style={{ left: `${movingX / Math.max(areaWidth, 1) * 100}%`, width: `${blockWidth / Math.max(areaWidth, 1) * 100}%`, bottom: `${(blocks.length + 1) * BLOCK_HEIGHT}px` }} />
      <button className={styles.dropButton} type="button" onPointerDown={(event) => { event.preventDefault(); dropBlock(); }}>Daşı yerləşdir</button>
    </div>
    <span className={styles.brushHint}>{remaining} san. · Qüllə: {blocks.length}/{MAX_BLOCKS} · En: {retainedWidth}% · Sürət: {speedLabel}</span>
  </div>;
}
