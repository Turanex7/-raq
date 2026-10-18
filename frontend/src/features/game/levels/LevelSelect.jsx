import { Lock, Map, Sparkles, Trophy, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import WorldMap from "../components/WorldMap";
import useApiResource from "../../../services/useApiResource";
import { levelRegistry } from "./levelRegistry";
import styles from "./LevelSelect.module.scss";

export default function LevelSelect() {
  const [selectedId, setSelectedId] = useState(levelRegistry[0].id);
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: user } = useApiResource("/me", hasToken);
  const { data: places, loading: placesLoading, error: placesError } = useApiResource("/places");
  const levels = levelRegistry.map((level) => {
    const place = places?.find((item) => item.slug === level.placeSlug);
    return { ...level, place, title: place?.name || (placesLoading ? "Məkan yüklənir…" : "Məkan məlumatı yoxdur"), description: place?.description || level.description };
  });
  const selectedLevel = levels.find((level) => level.id === selectedId) ?? levels[0];
  const selectedUnlocked = selectedLevel.place?.status === "open";
  const selectedStatus = selectedLevel.place?.status === "open" ? "Açıqdır" : selectedLevel.place?.status === "locked" ? "Bağlıdır" : placesLoading ? "Məkan yüklənir…" : placesError ? "Status əlçatan deyil" : "Məkan tapılmadı";
  const levelNumber = String(levelRegistry.findIndex((level) => level.id === selectedLevel.id) + 1).padStart(2, "0");

  return (
    <section className={styles.overworld}>
      <WorldMap levels={levels} selectedId={selectedId} onSelect={setSelectedId} />
      <div className={styles.hud}>
        <header className={styles.heroHud}>
          <div className={styles.worldTitle}>
            <span className={styles.eyebrow}><Map size={14} /> Kəşf xəritəsi</span>
            <h1>Azərbaycanın canlı xəritəsi</h1>
            <p>Şəhərlərin hekayəsini aç, növbəti səviyyəyə yol sal.</p>
          </div>
          {user ? <div className={styles.progressHud}>
            <span className={styles.avatar}>{user.name?.slice(0, 1) || "Ç"}</span>
            <div><b>{user.name} · Səviyyə {user.level}</b><span className={styles.xpLine}>Ümumi XP · {user.lifetimeXp}</span></div>
          </div> : <Link to="/login" className={styles.progressHud}>Daxil ol</Link>}
        </header>
        {selectedId && <aside className={styles.missionPanel} aria-live="polite">
          <button type="button" className={styles.closePanel} aria-label="Məkan seçimini bağla" onClick={() => setSelectedId(null)}><X size={16} /></button>
          <span className={styles.missionNumber}>{levelNumber} / {String(levelRegistry.length).padStart(2, "0")}</span>
          <span className={styles.panelKicker}><Sparkles size={13} /> Seçilmiş məkan</span>
          <h2>{selectedLevel.title}</h2>
          <p className={styles.panelSubtitle}>{selectedLevel.subtitle}</p>
          <p className={styles.panelDescription}>{selectedLevel.description}</p>
          <div className={styles.panelMeta}><span>{selectedStatus}</span><span>{selectedLevel.difficulty}</span></div>
          {selectedUnlocked ? <Link to={`/game/${selectedLevel.id}`} className={styles.enterButton}>Missiyaya başla<span>↗</span></Link> : <div className={styles.lockedButton}><Lock size={15} />{selectedLevel.place?.status === "locked" ? "Bu məkan bağlıdır" : selectedStatus}</div>}
        </aside>}
        <footer className={styles.bottomHud}><span className={styles.controlHint}><b>SÜRÜŞDÜR</b> dünyanı fırlat <b>YAXINLAŞDIR</b> miqyası dəyiş</span><span className={styles.worldStatus}><i />{placesError ? "Məkanları yükləmək mümkün olmadı" : placesLoading ? "Məkanlar yüklənir…" : `${places?.length || 0} məkan`}</span></footer>
        {placesError && <p className={styles.loadError} role="alert">{placesError}</p>}
      </div>
    </section>
  );
}
