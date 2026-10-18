import { Link } from "react-router-dom";
import useApiResource from "../../../services/useApiResource";
import { Compass, Map, Trophy, Zap } from "lucide-react";
import styles from "../HomePage.module.scss";

export default function GameHUD() {
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser } = useApiResource("/me", hasToken);
  return (
    <>
      <div className={styles.hudTop}>
        <span className={styles.hudStatus}><span className={styles.liveDot} />Kəşf rejimi</span>
        <div className={styles.hudPlayer}>
          <span className={styles.hudAvatar}>{apiUser?.name?.slice(0, 1) || "Ç"}</span>
          <span><b>{apiUser ? `Səviyyə ${apiUser.level}` : <Link to="/login">Daxil ol</Link>}</b>{apiUser && <small><Zap size={10} /> Ümumi XP · {apiUser.lifetimeXp}</small>}</span>
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
