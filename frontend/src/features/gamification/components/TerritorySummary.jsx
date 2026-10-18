import styles from "./TerritorySummary.module.scss";

export default function TerritorySummary({ owner, universityId, compact = false, universityLamp }) {
  if (!owner) return null;

  let gapMessage = owner.runner_up ? `${owner.runner_up}-dan ${owner.gap} xal fərq var` : "Hazırda rəqib universitet yoxdur";
  if (owner.tied) gapMessage = "Bərabərlik";
  else if (owner.runner_up && owner.gap === 0 && universityId === owner.university_id) gapMessage = "Xallar eynidir; üstünlük xala əvvəl çatmağınla qorunur";
  else if (owner.runner_up && owner.gap === 0 && universityId === owner.runner_up_id) gapMessage = "Xallar eynidir; lider xala daha tez çatıb";
  else if (owner.runner_up && owner.gap === 0) gapMessage = "Xallar eynidir; lider xala daha tez çatıb";
  else if (universityId && universityId === owner.university_id && owner.runner_up) gapMessage = `${owner.runner_up}-dan ${owner.gap} xal öndəsən`;
  else if (universityId && universityId === owner.runner_up_id) gapMessage = `${owner.university}-dan ${owner.gap} xal geridəsən`;
  const lampBrightness = universityLamp?.maxScore > 0 ? Math.max(0, Math.min(1, universityLamp.score / universityLamp.maxScore)) : 0;

  return <div className={`${styles.summary} ${compact ? styles.compact : ""}`}>
    <div className={styles.ownerRow}><span className={styles.badge} style={{ "--lamp-brightness": lampBrightness }} title={universityLamp ? `Universitet lampası · ${universityLamp.score} həftəlik fair xalı` : undefined}>{owner.university}</span><span className={styles.provisional}>{owner.final ? "Qalib" : "Müvəqqəti"}</span></div>
    <p className={styles.score}><b>{owner.score}</b> orta xal</p>
    {owner.runner_up && <p className={styles.runner}>İkinci yerdə {owner.runner_up} · {owner.runner_up_score} xal</p>}
    <p className={styles.gap}>{gapMessage}</p>
  </div>;
}
