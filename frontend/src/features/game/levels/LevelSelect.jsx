import { Map, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import WorldMap from "../components/WorldMap";
import useApiResource from "../../../services/useApiResource";
import { levelRegistry } from "./levelRegistry";
import Avatar from "../../gamification/components/Avatar";
import { miniGameRegistry } from "../minigames/miniGameRegistry";
import TicketLinkList from "../../../components/TicketLinkList.jsx";
import styles from "./LevelSelect.module.scss";
import { translate as t } from "../../../i18n/i18n";

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
  const qrStatus = selectedLevel.place?.status === "open" ? "QR tapşırığı açıqdır" : selectedLevel.place?.status === "locked" ? "QR tapşırığı bağlıdır" : placesLoading ? "Məkan yüklənir…" : placesError ? "QR statusu əlçatan deyil" : "Məkan tapılmadı";
  const hasMiniGame = Boolean(selectedLevel.place && miniGameRegistry[selectedLevel.place.id]);
  const levelNumber = String(levelRegistry.findIndex((level) => level.id === selectedLevel.id) + 1).padStart(2, "0");

  return (
    <section className={styles.overworld}>
      <WorldMap levels={levels} selectedId={selectedId} onSelect={setSelectedId} />
      <div className={styles.hud}>
        <header className={styles.heroHud}>
          <div className={styles.worldTitle}>
            <span className={styles.eyebrow}><Map size={14} /> {t("Kəşf xəritəsi")}</span>
            <h1>{t("Azərbaycanın canlı xəritəsi")}</h1>
            <p>{t("Şəhərlərin hekayəsini aç, növbəti səviyyəyə yol sal.")}</p>
          </div>
          {user ? <div className={styles.progressHud}>
            <Avatar avatarId={user.avatarId} size={30} className={styles.avatar}/>
            <div><b>{user.name} · {t("Səviyyə {level}", { level: user.level })}</b><span className={styles.xpLine}>{t("Ümumi XP")} · {user.lifetimeXp}</span></div>
          </div> : <Link to="/login" className={styles.progressHud}>{t("Daxil ol")}</Link>}
        </header>
        {selectedId && <aside className={styles.missionPanel} aria-live="polite">
          <button type="button" className={styles.closePanel} aria-label={t("Məkan seçimini bağla")} onClick={() => setSelectedId(null)}><X size={16} /></button>
          <span className={styles.missionNumber}>{levelNumber} / {String(levelRegistry.length).padStart(2, "0")}</span>
          <span className={styles.panelKicker}><Sparkles size={13} /> {t("Seçilmiş məkan")}</span>
          <h2>{t(selectedLevel.title)}</h2>
          <p className={styles.panelSubtitle}>{t(selectedLevel.subtitle)}</p>
          <p className={styles.panelDescription}>{t(selectedLevel.description)}</p>
          <div className={styles.panelMeta}><span>{t(qrStatus)}</span><span>{t(selectedLevel.difficulty)}</span></div>
          <TicketLinkList place={selectedLevel.place} />
          {hasMiniGame && <Link to={`/mini-game/${selectedLevel.place.id}`} className={styles.enterButton}>{t("Mini oyuna başla")}<span>↗</span></Link>}
          <p className={styles.panelDescription}>{t("Mini oyun açıqdır; muzey tapşırıqları üçün məkanın QR statusu ayrıca tətbiq olunur.")}</p>
        </aside>}
        <footer className={styles.bottomHud}><span className={styles.controlHint}><b>{t("SÜRÜŞDÜR")}</b> {t("dünyanı fırlat")} <b>{t("YAXINLAŞDIR")}</b> {t("miqyası dəyiş")}</span><span className={styles.worldStatus}><i />{placesError ? t("Məkanları yükləmək mümkün olmadı") : placesLoading ? t("Məkanlar yüklənir…") : `${places?.length || 0} ${t("məkan")}`}</span></footer>
          {placesError && <p className={styles.loadError} role="alert">{t(placesError)}</p>}
      </div>
    </section>
  );
}
