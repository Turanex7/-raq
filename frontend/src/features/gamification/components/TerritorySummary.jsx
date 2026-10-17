import styles from "./TerritorySummary.module.scss";

export default function TerritorySummary({ owner, universityId, compact = false }) {
  if (!owner) return null;

  let gapMessage = owner.runner_up ? `${owner.runner_up}-dan ${owner.gap} xal fərq var` : "Hazırda rəqib universitet yoxdur";
  if (owner.runner_up && owner.gap === 0) gapMessage = "Universitetlər hazırda bərabər xaldadır";
  else if (universityId && universityId === owner.university_id && owner.runner_up) gapMessage = `${owner.runner_up}-dan ${owner.gap} xal öndəsən`;
  else if (universityId && universityId === owner.runner_up_id) gapMessage = `${owner.university}-dan ${owner.gap} xal geridəsən`;

  return <div className={`${styles.summary} ${compact ? styles.compact : ""}`}>
    <div className={styles.ownerRow}><span className={styles.badge}>{owner.university}</span><span className={styles.provisional}>{owner.final ? "Qalib" : "Müvəqqəti"}</span></div>
    <p className={styles.score}><b>{owner.score}</b> orta xal</p>
    {owner.runner_up && <p className={styles.runner}>İkinci yerdə {owner.runner_up} · {owner.runner_up_score} xal</p>}
    <p className={styles.gap}>{gapMessage}</p>
  </div>;
}
