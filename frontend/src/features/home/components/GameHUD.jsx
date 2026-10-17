import { Link } from "react-router-dom";
import { useGame } from "../../gamification/gameStore";
import { GAME_CONFIG } from "../../gamification/gameConfig";
import { useMocks } from "../../../services/api";
import useApiResource from "../../../services/useApiResource";
import { Compass, Map, Trophy, Zap } from "lucide-react";
import styles from "../HomePage.module.scss";

export default function GameHUD() {
  const game = useGame();
  const player = game.users.find((user) => user.id === game.currentUserId);
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser } = useApiResource("/me", !useMocks && hasToken);
  const xp = useMocks ? player.xp : apiUser?.lifetimeXp || 0;
  const level = useMocks ? Math.floor(player.xp / GAME_CONFIG.levelXp) + 1 : apiUser?.level || 1;
  const levelProgress = (xp % GAME_CONFIG.levelXp) / GAME_CONFIG.levelXp * 100;
  return (
    <>
      <div className={styles.hudTop}>
        <span className={styles.hudStatus}><span className={styles.liveDot} />Kəşf rejimi</span>
        <div className={styles.hudPlayer}>
          <span className={styles.hudAvatar}>{useMocks ? player.name.slice(0, 1) : (apiUser?.name || "Ç").slice(0, 1)}</span>
          <span><b>{!useMocks && !apiUser ? <Link to="/login">Macəraya qoşul</Link> : `Səviyyə ${level}`}</b><small><Zap size={10} /> {xp} XP</small></span>
          <div className={styles.hudProgress}><i style={{ width: `${levelProgress}%` }} /></div>
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
