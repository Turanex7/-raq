import { Compass, HelpCircle, Pause, Play } from "lucide-react";
import styles from "../GamePage.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function QuestHUD({ level, artifactCollected, canInteract, paused, onPause, onHelp }) {
  return (
    <>
      <div className={styles.gameTopBar}>
        <div className={styles.gameBrand}><span>✦</span><b>Çıraq</b><small>{t(level.title)}</small></div>
        <div className={styles.gameActions}><button type="button" onClick={onHelp} aria-label={t("İdarəetmə köməyi")}><HelpCircle size={18} /></button><button type="button" onClick={onPause} aria-label={t(paused ? "Oyuna davam et" : "Oyunu dayandır")}>{paused ? <Play size={18} /> : <Pause size={18} />}</button></div>
      </div>
      <aside className={styles.questCard}>
        <span className={styles.questLabel}><Compass size={13} />{t("Aktiv missiya")}</span>
        <h2>{t("Qədim işığı tap")}</h2>
        <p>{t("İçərişəhərin küçələrində parlayan artefaktı axtar.")}</p>
        <div className={styles.questProgress}><span className={artifactCollected ? styles.done : ""} />{t(artifactCollected ? "Artefakt tapıldı" : "Artefakt hələ tapılmayıb")}</div>
      </aside>
      {canInteract && !artifactCollected && <div className={styles.interactPrompt}><kbd>E</kbd><span>{t("Artefaktla qarşılıqlı əlaqə")}</span></div>}
    </>
  );
}
