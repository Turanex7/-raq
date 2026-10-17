import { Link } from "react-router-dom";
import { Compass, Map, Trophy, Zap } from "lucide-react";
import styles from "../HomePage.module.scss";

export default function GameHUD() {
  return (
    <>
      <div className={styles.hudTop}>
        <span className={styles.hudStatus}><span className={styles.liveDot} />Kəşf rejimi</span>
        <div className={styles.hudPlayer}>
          <span className={styles.hudAvatar}>A</span>
          <span><b>Səviyyə 2</b><small><Zap size={10} /> 350 / 500 XP</small></span>
          <div className={styles.hudProgress}><i /></div>
        </div>
      </div>
      <div className={styles.worldHint}><Compass size={14} /><span>Fırlatmaq üçün sürüşdür</span><span className={styles.hintDivider} /> <span>Yaxınlaş</span></div>
      <div className={styles.hudBottom}>
        <Link to="/map"><Map size={16} />Xəritəni aç</Link>
        <Link to="/leaderboard"><Trophy size={16} />Reytinq</Link>
      </div>
    </>
  );
}
