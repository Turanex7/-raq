import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./GroupBonusInfo.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function GroupBonusInfo({ status }) {
  if (!status) return null;
  const needed = status.minimum_members;
  const current = status.current_members;
  const percent = needed ? Math.min(100, current / needed * 100) : 0;
  const message = status.already_awarded
    ? t("Bu məkanda dəstə bonusunu artıq qazanmısan.")
    : status.members_needed > 0
      ? t("{count} nəfər də tapşırığı tamamlayanda bonus aktiv olacaq.", { count: status.members_needed })
      : t("Dəstə bonusu bu tapşırıq üçün aktivdir.");

  return <aside className={styles.panel}>
    <div className={styles.heading}><Users size={17}/><b>{status.already_awarded ? t("Dəstə bonusu: artıq +{xp} XP qazanmısan", { xp: status.earned_xp }) : t("Dəstə bonusu: x{multiplier}, {needed} nəfər lazımdır, {current} nəfər var", { multiplier: Number(status.multiplier).toFixed(1), needed, current })}</b></div>
    <div className={styles.track} role="progressbar" aria-label={t("Dəstə bonusu üçün iştirakçılar")} aria-valuenow={Math.min(current, needed)} aria-valuemin={0} aria-valuemax={needed}><span style={{ width: `${percent}%` }}/></div>
    <div className={styles.footer}><span>{message}</span><Link to="/leaderboard?tab=open">{t("Dəstə qur və ya qoşul")}</Link></div>
  </aside>;
}
