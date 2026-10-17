import { Lock, Map, Sparkles, Trophy, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import WorldMap from "../components/WorldMap";
import { getGameProgress, isLevelUnlocked } from "../state/gameStore";
import { levelRegistry } from "./levelRegistry";
import styles from "./LevelSelect.module.scss";

export default function LevelSelect() {
  const progress = getGameProgress();
  const [selectedId, setSelectedId] = useState(levelRegistry[0].id);
  const selectedLevel = levelRegistry.find((level) => level.id === selectedId) ?? levelRegistry[0];
  const selectedUnlocked = isLevelUnlocked(selectedLevel);
  const selectedComplete = progress.completedLevels.includes(selectedLevel.id);
  const levelNumber = String(levelRegistry.findIndex((level) => level.id === selectedLevel.id) + 1).padStart(2, "0");

  return (
    <section className={styles.overworld}>
      <WorldMap levels={levelRegistry} progress={progress} selectedId={selectedId} onSelect={setSelectedId} />
      <div className={styles.hud}>
        <header className={styles.heroHud}>
          <div className={styles.worldTitle}>
            <span className={styles.eyebrow}><Map size={14} /> Kəşf xəritəsi</span>
            <h1>Azərbaycanın canlı xəritəsi</h1>
            <p>Şəhərlərin hekayəsini aç, növbəti səviyyəyə yol sal.</p>
          </div>
          <div className={styles.progressHud}>
            <span className={styles.avatar}>A</span>
            <div><b>Səyyah · Səviyyə 1</b><span className={styles.xpLine}><Zap size={12} /> {progress.xp} XP <i><em style={{ width: `${Math.min(100, (progress.xp / 1000) * 100)}%` }} /></i></span></div>
          </div>
        </header>
        {selectedId && <aside className={styles.missionPanel} aria-live="polite">
          <button type="button" className={styles.closePanel} aria-label="Məkan seçimini bağla" onClick={() => setSelectedId(null)}><X size={16} /></button>
          <span className={styles.missionNumber}>{levelNumber} / 04</span>
          <span className={styles.panelKicker}><Sparkles size={13} /> Seçilmiş məkan</span>
          <h2>{selectedLevel.title}</h2>
          <p className={styles.panelSubtitle}>{selectedLevel.subtitle}</p>
          <p className={styles.panelDescription}>{selectedLevel.description}</p>
          <div className={styles.panelMeta}><span><Zap size={13} /> +{selectedLevel.xp} XP</span><span>{selectedLevel.difficulty}</span>{selectedComplete && <span className={styles.complete}><Trophy size={13} /> Tamamlandı</span>}</div>
          {selectedUnlocked ? <Link to={`/game/${selectedLevel.id}`} className={styles.enterButton}>{selectedComplete ? "Yenidən oyna" : "Səviyyəyə daxil ol"}<span>↗</span></Link> : <div className={styles.lockedButton}><Lock size={15} /> Əvvəlki səviyyəni tamamla</div>}
        </aside>}
        <footer className={styles.bottomHud}><span className={styles.controlHint}><b>DRAG</b> dünyanı fırlat <b>SCROLL</b> yaxınlaş</span><span className={styles.worldStatus}><i /> {progress.completedLevels.length} / {levelRegistry.length} məkan açılıb</span></footer>
      </div>
    </section>
  );
}
