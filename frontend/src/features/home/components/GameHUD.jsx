import { Link } from "react-router-dom";
import useApiResource from "../../../services/useApiResource";
import { Compass, Map, Trophy, Zap } from "lucide-react";
import Avatar from "../../gamification/components/Avatar";
import styles from "../HomePage.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function GameHUD() {
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser } = useApiResource("/me", hasToken);
  return (
    <>
      <div className={styles.hudTop}>
        <span className={styles.hudStatus}><span className={styles.liveDot} />{t("Kəşf rejimi")}</span>
        <div className={styles.hudPlayer}>
          <Avatar avatarId={apiUser?.avatarId} avatarName={apiUser?.avatarId ? undefined : "Çıraq"} size={29} className={styles.hudAvatar}/>
          <span><b>{apiUser ? t("Səviyyə {level}", { level: apiUser.level }) : <Link to="/login">{t("Daxil ol")}</Link>}</b>{apiUser && <small><Zap size={10} /> {t("Ümumi XP")} · {apiUser.lifetimeXp}</small>}</span>
        </div>
      </div>
      <div className={styles.worldHint}><Compass size={14} /><span>{t("Fırlatmaq üçün sürüşdür")}</span><span className={styles.hintDivider} /> <span>{t("Yaxınlaş")}</span></div>
      <div className={styles.hudBottom}>
        <Link to="/map"><Map size={16} />{t("Xəritəni aç")}</Link>
        <Link to="/leaderboard"><Trophy size={16} />{t("Reytinq")}</Link>
      </div>
    </>
  );
}
