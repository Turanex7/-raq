import { ArrowRight, Gem, Sparkles, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../GamePage.module.scss";

export default function LevelComplete({ xp, artifactName, nextLevelUnlocked }) {
  return (
    <section className={styles.completeScreen}>
      <div className={styles.completeOrb}><Trophy size={42} /></div>
      <p className={styles.kicker}><Sparkles size={14} />Missiya tamamlandı</p>
      <h1>İlk sirri açdın!</h1>
      <p className={styles.completeText}>İçərişəhərin qədim işığını tapdın və Qız Qalasının hekayəsinə bir addım yaxınlaşdın.</p>
      <div className={styles.rewardRow}><span><Zap size={16} />+{xp} XP</span><span><Gem size={16} />{artifactName}</span></div>
      <Link to="/game" className={styles.completeAction}>{nextLevelUnlocked ? "Növbəti səviyyəni gör" : "Macəra xəritəsinə qayıt"} <ArrowRight size={17} /></Link>
    </section>
  );
}
