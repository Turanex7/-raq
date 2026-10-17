import styles from "./XPProgressBar.module.scss";
import { getXpProgress } from "../mockData";

export default function XPProgressBar({ xp }) {
  const { level, current, needed, remaining, percent } = getXpProgress(xp);

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <span className={styles.level}>Səviyyə {level}</span>
        <span className={styles.numbers}>
          {current} / {needed} XP
        </span>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={needed}
        aria-label={`Səviyyə ${level} üçün ${percent} faiz`}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>

      <p className={styles.hint}>Növbəti səviyyəyə {remaining} XP qalıb</p>
    </div>
  );
}
