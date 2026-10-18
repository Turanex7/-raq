import { Map, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import WorldMap from "../components/WorldMap";
import useApiResource from "../../../services/useApiResource";
import { apiRequest } from "../../../services/api";
import { levelRegistry } from "./levelRegistry";
import { isJourneyChapterComplete, journeyChapters, journeyMapOrder } from "./journeyChapters";
import Avatar from "../../gamification/components/Avatar";
import { miniGameRegistry } from "../minigames/miniGameRegistry";
import TicketLinkList from "../../../components/TicketLinkList.jsx";
import styles from "./LevelSelect.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function LevelSelect() {
  const [selectedId, setSelectedId] = useState(levelRegistry[0].id);
  const [journeyPlaces, setJourneyPlaces] = useState({});
  const [journeyError, setJourneyError] = useState("");
  const [journeyRevision, setJourneyRevision] = useState(0);
  const [answerState, setAnswerState] = useState({ chapterId: "", correct: null });
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: user } = useApiResource("/me", hasToken);
  const { data: places, loading: placesLoading, error: placesError } = useApiResource("/places");
  useEffect(() => {
    let cancelled = false;
    Promise.all(journeyChapters.map((chapter) => apiRequest(`/places/${encodeURIComponent(chapter.placeSlug)}`)))
      .then((details) => {
        if (!cancelled) {
          setJourneyPlaces(Object.fromEntries(details.map((place) => [place.slug, place])));
          setJourneyError("");
        }
      })
      .catch((error) => { if (!cancelled) setJourneyError(error.message || "Mərhələ məlumatı yüklənmədi."); });
    return () => { cancelled = true; };
  }, [journeyRevision]);
  useEffect(() => {
    const refresh = () => setJourneyRevision((value) => value + 1);
    window.addEventListener("chiraq:xp-updated", refresh);
    return () => window.removeEventListener("chiraq:xp-updated", refresh);
  }, []);
  const currentChapter = journeyChapters.find((chapter) => !isJourneyChapterComplete(chapter, journeyPlaces)) || null;
  const completedChapters = journeyChapters.filter((chapter) => isJourneyChapterComplete(chapter, journeyPlaces));
  const activeMapLevelId = currentChapter?.mapLevelId || journeyMapOrder[completedChapters.length] || journeyMapOrder.at(-1);
  const activeChapterIndex = journeyChapters.findIndex((chapter) => chapter.id === currentChapter?.id);
  const previousActiveLevelId = useRef(activeMapLevelId);
  const journeyFinished = completedChapters.length === journeyChapters.length;
  const levels = levelRegistry.map((level) => {
    const place = places?.find((item) => item.slug === level.placeSlug);
    const mapIndex = journeyMapOrder.indexOf(level.id);
    const activeMapIndex = journeyMapOrder.indexOf(activeMapLevelId);
    const storyLocked = mapIndex > activeMapIndex;
    return { ...level, place, storyLocked, title: place?.name || (placesLoading ? "Məkan yüklənir…" : "Məkan məlumatı yoxdur"), description: place?.description || level.description };
  });
  useEffect(() => {
    if (activeMapLevelId && previousActiveLevelId.current !== activeMapLevelId) {
      previousActiveLevelId.current = activeMapLevelId;
      setSelectedId(activeMapLevelId);
      setAnswerState({ chapterId: "", correct: null });
    }
  }, [activeMapLevelId]);
  const selectedLevel = levels.find((level) => level.id === selectedId) ?? levels[0];
  const qrStatus = selectedLevel.place?.status === "open" ? "QR tapşırığı açıqdır" : selectedLevel.place?.status === "locked" ? "QR tapşırığı bağlıdır" : placesLoading ? "Məkan yüklənir…" : placesError ? "QR statusu əlçatan deyil" : "Məkan tapılmadı";
  const hasMiniGame = Boolean(selectedLevel.place && miniGameRegistry[selectedLevel.place.id]);
  const isCurrentChapter = Boolean(currentChapter && selectedId === currentChapter.mapLevelId);
  const levelNumber = String(Math.max(1, activeChapterIndex + 1)).padStart(2, "0");
  const targetPlace = places?.find((place) => place.slug === currentChapter?.placeSlug);
  const targetDetails = journeyPlaces[currentChapter?.placeSlug];
  const chapterProgress = targetDetails ? isJourneyChapterComplete(currentChapter, journeyPlaces) : false;
  const targetVisitDone = targetDetails?.tasks?.some((task) => task.code === "visit" && task.completed);
  const targetQuestionDone = targetDetails?.tasks?.some((task) => task.code === "quiz" && task.completed);

  function chooseAnswer(slug) {
    setAnswerState({ chapterId: currentChapter.id, correct: slug === currentChapter.placeSlug });
  }

  function selectLevel(id) {
    const level = levels.find((item) => item.id === id);
    if (level?.storyLocked) return;
    setSelectedId(id);
    setAnswerState({ chapterId: "", correct: null });
  }

  return (
    <section className={styles.overworld}>
      <WorldMap levels={levels} selectedId={selectedId} onSelect={selectLevel} />
      <div className={styles.hud}>
        <header className={styles.heroHud}>
          <div className={styles.worldTitle}>
            <span className={styles.eyebrow}><Map size={14} /> {t("Kəşf xəritəsi")}</span>
            <h1>{t("Azərbaycanın canlı xəritəsi")}</h1>
            <p>{t("İpucunu tap, muzeyə get, QR ziyarətini və sualı tamamla.")}</p>
          </div>
          {user ? <div className={styles.progressHud}>
            <Avatar avatarId={user.avatarId} size={30} className={styles.avatar}/>
            <div><b>{user.name} · {t("Səviyyə {level}", { level: user.level })}</b><span className={styles.xpLine}>{t("Ümumi XP")} · {user.lifetimeXp}</span></div>
          </div> : <Link to="/login" className={styles.progressHud}>{t("Daxil ol")}</Link>}
        </header>
        {selectedId && <aside className={styles.missionPanel} aria-live="polite">
          <button type="button" className={styles.closePanel} aria-label={t("Məkan seçimini bağla")} onClick={() => setSelectedId(null)}><X size={16} /></button>
          {journeyFinished && selectedId === journeyMapOrder[journeyMapOrder.length - 1] ? <>
            <span className={styles.missionNumber}>{String(journeyMapOrder.length).padStart(2, "0")} / {String(journeyMapOrder.length).padStart(2, "0")}</span>
            <span className={styles.panelKicker}><Sparkles size={13} /> {t("Macəra tamamlandı")}</span>
            <h2>{t("Bakı kəşfi başa çatdı")}</h2>
            <p className={styles.journeyClue}>{t("Növbəti muzeyləri xəritədə seç, ziyarət et və yeni izlər aç.")}</p>
            <Link to="/map" className={styles.enterButton}>{t("Muzey xəritəsini aç")}<span>↗</span></Link>
          </> : isCurrentChapter ? <>
            <span className={styles.missionNumber}>{levelNumber} / {String(journeyChapters.length).padStart(2, "0")}</span>
            <span className={styles.panelKicker}><Sparkles size={13} /> {t("Səviyyə tapmacası")}</span>
            <h2>{t(currentChapter.title)}</h2>
            <p className={styles.panelSubtitle}>{t(selectedLevel.title)} · {t("Yol açıqdır")}</p>
            {chapterProgress ? <div className={styles.journeySuccess}>
              <b>{t("Muzey izi tamamlandı!")}</b>
              <p>{t("Növbəti mərhələni xəritədə aç.")}</p>
              <Link to="/game" className={styles.enterButton}>{t("Davam et")}<span>↗</span></Link>
            </div> : <>
              <p className={styles.journeyClue}>{t(currentChapter.clue)}</p>
              <p className={styles.journeyRule}>{t("Düzgün cavab XP vermir. Muzeydə QR ziyarətini və bilik sualını tamamla; XP-ni server hesablayır.")}</p>
              <div className={styles.journeyChoices} role="group" aria-label={t("Muzeyi seç")}>{currentChapter.choiceSlugs.map((slug) => {
                const option = places?.find((place) => place.slug === slug);
                if (!option) return null;
                return <button key={slug} type="button" onClick={() => chooseAnswer(slug)}>{t(option.name)}</button>;
              })}</div>
              {answerState.chapterId === currentChapter.id && answerState.correct === false && <p className={styles.journeyWrong} role="status">{t("Bu cavab ipucuna uyğun gəlmir. Yenidən seç.")}</p>}
              {answerState.chapterId === currentChapter.id && answerState.correct && <div className={styles.journeySuccess} role="status">
                <b>{t("Düz tapdın: {place}", { place: t(targetPlace?.name || targetDetails?.name || "Muzey") })}</b>
                <p>{t("İndi muzeyə get, QR ziyarətini təsdiqlə və oradakı bilik sualına cavab ver.")}</p>
                {targetVisitDone && !targetQuestionDone && <p>{t("QR ziyarəti qeydə alınıb. Mərhələni tamamlamaq üçün muzey sualına cavab ver.")}</p>}
                {hasToken ? <Link to={`/museums/${encodeURIComponent(currentChapter.placeSlug)}?journey=${encodeURIComponent(currentChapter.id)}`} className={styles.enterButton}>{t("Muzey tapşırığına keç")}<span>↗</span></Link> : <Link to="/login" className={styles.enterButton}>{t("Daxil ol")}<span>↗</span></Link>}
              </div>}
              {journeyError && <p className={styles.loadError} role="alert">{t(journeyError)}</p>}
            </>}
          </> : <>
            <span className={styles.missionNumber}>{String(levelRegistry.findIndex((level) => level.id === selectedLevel.id) + 1).padStart(2, "0")} / {String(levelRegistry.length).padStart(2, "0")}</span>
            <span className={styles.panelKicker}><Sparkles size={13} /> {t("Seçilmiş məkan")}</span>
            <h2>{t(selectedLevel.title)}</h2>
            <p className={styles.panelSubtitle}>{t(selectedLevel.subtitle)}</p>
            <p className={styles.panelDescription}>{t(selectedLevel.description)}</p>
            <div className={styles.panelMeta}><span>{t(qrStatus)}</span><span>{t(selectedLevel.difficulty)}</span></div>
            <TicketLinkList place={selectedLevel.place} />
            {hasMiniGame && <Link to={`/mini-game/${selectedLevel.place.id}`} className={styles.enterButton}>{t("Mini oyuna başla")}<span>↗</span></Link>}
            <p className={styles.panelDescription}>{t("Mini oyun açıqdır; muzey tapşırıqları üçün məkanın QR statusu ayrıca tətbiq olunur.")}</p>
          </>}
        </aside>}
        <footer className={styles.bottomHud}><span className={styles.controlHint}><b>{t("SÜRÜŞDÜR")}</b> {t("dünyanı fırlat")} <b>{t("YAXINLAŞDIR")}</b> {t("miqyası dəyiş")}</span><span className={styles.worldStatus}><i />{placesError ? t("Məkanları yükləmək mümkün olmadı") : placesLoading ? t("Məkanlar yüklənir…") : `${places?.length || 0} ${t("məkan")}`}</span></footer>
          {placesError && <p className={styles.loadError} role="alert">{t(placesError)}</p>}
      </div>
    </section>
  );
}
