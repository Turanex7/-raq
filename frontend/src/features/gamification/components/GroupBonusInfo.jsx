import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./GroupBonusInfo.module.scss";

export default function GroupBonusInfo({ status }) {
  if (!status) return null;
  const needed = status.minimum_members;
  const current = status.current_members;
  const percent = needed ? Math.min(100, current / needed * 100) : 0;
  const message = status.already_awarded
    ? "Bu məkanda dəstə bonusunu artıq qazanmısan."
    : status.members_needed > 0
      ? `${status.members_needed} nəfər də tapşırığı tamamlayanda bonus aktiv olacaq.`
      : "Dəstə bonusu bu tapşırıq üçün aktivdir.";

  return <aside className={styles.panel}>
    <div className={styles.heading}><Users size={17}/><b>{status.already_awarded ? `Dəstə bonusu: artıq +${status.earned_xp} XP qazanmısan` : `Dəstə bonusu: x${Number(status.multiplier).toFixed(1)}, ${needed} nəfər lazımdır, ${current} nəfər var`}</b></div>
    <div className={styles.track} role="progressbar" aria-label="Dəstə bonusu üçün iştirakçılar" aria-valuenow={Math.min(current, needed)} aria-valuemin={0} aria-valuemax={needed}><span style={{ width: `${percent}%` }}/></div>
    <div className={styles.footer}><span>{message}</span><Link to="/leaderboard?tab=open">Dəstə qur və ya qoşul</Link></div>
  </aside>;
}
