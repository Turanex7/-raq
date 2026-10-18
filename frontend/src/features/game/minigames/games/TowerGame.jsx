import { useEffect, useRef, useState } from "react";
import styles from "./MiniGameVisuals.module.scss";
import shell from "../MiniGameShell.module.scss";

const MAX_BLOCKS = 12;
const BLOCK_HEIGHT = 21;

export default function TowerGame({ durationSeconds, perfectTolerance = 3, speedBase = 0.38, speedRamp = 0.02, onFinish }) {
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
        if (!finishedRef.current) { finishedRef.current = true; finishRef.current(blocksRef.current.length); }
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!areaWidth) return undefined;
    const tick = window.setInterval(() => {
      if (finishedRef.current) return;
      const maxX = Math.max(0, areaWidth - widthRef.current);
      const speed = Math.max(1.6, areaWidth * (speedBase + blocksRef.current.length * speedRamp) / 60);
      let next = movingXRef.current + speed * directionRef.current;
      if (next >= maxX) { next = maxX; directionRef.current = -1; }
      if (next <= 0) { next = 0; directionRef.current = 1; }
      movingXRef.current = next;
      setMovingX(next);
    }, 16);
    return () => window.clearInterval(tick);
  }, [areaWidth, speedBase, speedRamp]);

  function dropBlock() {
    if (finishedRef.current || !areaWidth) return;
    const previousWidth = widthRef.current || areaWidth * 0.72;
    const previousCenter = centerRef.current || areaWidth / 2;
    const left = Math.max(movingXRef.current, previousCenter - previousWidth / 2);
    const right = Math.min(movingXRef.current + previousWidth, previousCenter + previousWidth / 2);
    const overlap = right - left;
    if (overlap <= 0) {
      finishedRef.current = true;
      finishRef.current(blocksRef.current.length);
      return;
    }
    const movingCenter = movingXRef.current + previousWidth / 2;
    const perfect = Math.abs(movingCenter - previousCenter) <= perfectTolerance;
    const nextWidth = perfect ? previousWidth : overlap;
    const nextCenter = perfect ? previousCenter : (left + right) / 2;
    const nextBlocks = [...blocksRef.current, { center: nextCenter, width: nextWidth }];
    blocksRef.current = nextBlocks;
    widthRef.current = nextWidth;
    centerRef.current = nextCenter;
    setBlockWidth(nextWidth);
    setBlocks(nextBlocks);
    if (nextWidth < 34 || nextBlocks.length >= MAX_BLOCKS) {
      finishedRef.current = true;
      finishRef.current(nextBlocks.length);
      return;
    }
    movingXRef.current = 0;
    directionRef.current = 1;
    setMovingX(0);
  }

  return <div className={`${shell.gameStage} ${styles.towerStage}`}>
    <div className={styles.towerArea} ref={areaRef}>
      <div className={styles.towerBase} style={{ width: `${blockWidth ? blockWidth / Math.max(areaWidth, 1) * 100 : 72}%` }} />
      {blocks.map((block, index) => <i key={index} className={styles.towerBlock} style={{ left: `${block.center / Math.max(areaWidth, 1) * 100}%`, width: `${block.width / Math.max(areaWidth, 1) * 100}%`, bottom: `${(index + 1) * BLOCK_HEIGHT}px`, transform: "translateX(-50%)" }} />)}
      <i className={`${styles.towerBlock} ${styles.movingBlock}`} style={{ left: `${movingX / Math.max(areaWidth, 1) * 100}%`, width: `${blockWidth / Math.max(areaWidth, 1) * 100}%`, bottom: `${(blocks.length + 1) * BLOCK_HEIGHT}px` }} />
      <button className={styles.dropButton} type="button" onPointerDown={(event) => { event.preventDefault(); dropBlock(); }}>Daşı yerləşdir</button>
    </div>
    <span className={styles.brushHint}>{remaining} san. · Qüllə: {blocks.length}/{MAX_BLOCKS}</span>
  </div>;
}
