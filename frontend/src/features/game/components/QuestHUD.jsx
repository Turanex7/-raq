import { Compass, HelpCircle, Pause, Play } from "lucide-react";
import styles from "../GamePage.module.scss";

export default function QuestHUD({ level, artifactCollected, canInteract, paused, onPause, onHelp }) {
  return (
    <>
      <div className={styles.gameTopBar}>
        <div className={styles.gameBrand}><span>✦</span><b>Çıraq</b><small>{level.title}</small></div>
        <div className={styles.gameActions}><button type="button" onClick={onHelp} aria-label="İdarəetmə köməyi"><HelpCircle size={18} /></button><button type="button" onClick={onPause} aria-label={paused ? "Oyuna davam et" : "Oyunu dayandır"}>{paused ? <Play size={18} /> : <Pause size={18} />}</button></div>
      </div>
      <aside className={styles.questCard}>
        <span className={styles.questLabel}><Compass size={13} />Aktiv missiya</span>
        <h2>Qədim işığı tap</h2>
        <p>İçərişəhərin küçələrində parlayan artefaktı axtar.</p>
        <div className={styles.questProgress}><span className={artifactCollected ? styles.done : ""} />{artifactCollected ? "Artefakt tapıldı" : "Artefakt hələ tapılmayıb"}</div>
      </aside>
      {canInteract && !artifactCollected && <div className={styles.interactPrompt}><kbd>E</kbd><span>Artefaktla qarşılıqlı əlaqə</span></div>}
    </>
  );
}
