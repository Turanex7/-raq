import { ArrowRight, Gem, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../GamePage.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function LevelComplete({ artifactName, nextLevelUnlocked }) {
  return (
    <section className={styles.completeScreen}>
      <div className={styles.completeOrb}><Trophy size={42} /></div>
      <p className={styles.kicker}><Sparkles size={14} />{t("Missiya tamamlandı")}</p>
      <h1>{t("İlk sirri açdın!")}</h1>
      <p className={styles.completeText}>{t("İçərişəhərin qədim işığını tapdın və Qız Qalasının hekayəsinə bir addım yaxınlaşdın.")}</p>
      <div className={styles.rewardRow}><span><Gem size={16} />{t(artifactName)}</span></div>
      <Link to="/game" className={styles.completeAction}>{t(nextLevelUnlocked ? "Növbəti səviyyəni gör" : "Macəra xəritəsinə qayıt")} <ArrowRight size={17} /></Link>
    </section>
  );
}
