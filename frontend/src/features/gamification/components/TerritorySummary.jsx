import styles from "./TerritorySummary.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function TerritorySummary({ owner, universityId, compact = false, universityLamp }) {
  if (!owner) return null;

  let gapMessage = owner.runner_up ? t("{name}-dan {gap} xal fərq var", { name: owner.runner_up, gap: owner.gap }) : t("Hazırda rəqib universitet yoxdur");
  if (owner.tied) gapMessage = t("Bərabərlik");
  else if (owner.runner_up && owner.gap === 0 && universityId === owner.university_id) gapMessage = t("Xallar eynidir; üstünlük xala əvvəl çatmağınla qorunur");
  else if (owner.runner_up && owner.gap === 0) gapMessage = t("Xallar eynidir; lider xala daha tez çatıb");
  else if (universityId && universityId === owner.university_id && owner.runner_up) gapMessage = t("{name}-dan {gap} xal öndəsən", { name: owner.runner_up, gap: owner.gap });
  else if (universityId && universityId === owner.runner_up_id) gapMessage = t("{name}-dan {gap} xal geridəsən", { name: owner.university, gap: owner.gap });
  const lampBrightness = universityLamp?.maxScore > 0 ? Math.max(0, Math.min(1, universityLamp.score / universityLamp.maxScore)) : 0;

  return <div className={`${styles.summary} ${compact ? styles.compact : ""}`}>
    <div className={styles.ownerRow}><span className={styles.badge} style={{ "--lamp-brightness": lampBrightness }} title={universityLamp ? t("Universitet lampası · {score} həftəlik fair xalı", { score: universityLamp.score }) : undefined}>{owner.university}</span><span className={styles.provisional}>{t(owner.final ? "Qalib" : "Müvəqqəti")}</span></div>
    <p className={styles.score}><b>{owner.score}</b> {t("orta xal")}</p>
    {owner.runner_up && <p className={styles.runner}>{t("İkinci yerdə {name} · {score} xal", { name: owner.runner_up, score: owner.runner_up_score })}</p>}
    <p className={styles.gap}>{gapMessage}</p>
  </div>;
}
