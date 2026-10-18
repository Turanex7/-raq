import { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import TicketLinkList from "../../components/TicketLinkList.jsx";
import useApiResource from "../../services/useApiResource";
import TerritorySummary from "./components/TerritorySummary";
import GroupBonusInfo from "./components/GroupBonusInfo";
import styles from "./ContentPages.module.scss";
import { translate as t } from "../../i18n/i18n";
import { journeyChapters, isJourneyPlaceComplete } from "../game/levels/journeyChapters";

export default function MuseumDetailPage() {
  const { id } = useParams();
  return <ApiMuseumDetail slug={id} />;
}

function ApiMuseumDetail({ slug }) {
  const [route, setRoute] = useState(false);
  const [searchParams] = useSearchParams();
  const journeyId = searchParams.get("journey");
  const journeyChapter = journeyChapters.find((chapter) => chapter.id === journeyId && chapter.placeSlug === slug);
  const { data: place, loading, error, retry } = useApiResource(`/places/${encodeURIComponent(slug || "")}`);
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: me } = useApiResource("/me", hasToken);
  if (loading) return <section className={styles.page}><p role="status">{t("Məkan məlumatları yüklənir…")}</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{t(error)}</p><button type="button" onClick={retry}>{t("Yenidən yoxla")}</button></section>;
  if (!place) return <section className={styles.page}><h1>{t("Məkan tapılmadı")}</h1><Link to="/map" className={styles.action}>{t("Xəritəyə qayıt")}</Link></section>;
  const tasks = place.tasks || [];
  const owner = place.territory || null;
  const firstAvailableTask = tasks.find((task) => !task.completed);
  const journeyVisitTask = tasks.find((task) => task.code === "visit");
  const journeyQuestionTask = tasks.find((task) => task.code === "quiz");
  const journeyNextTask = journeyChapter
    ? (journeyVisitTask?.completed ? (journeyQuestionTask?.completed ? null : journeyQuestionTask) : journeyVisitTask)
    : firstAvailableTask;
  const routeTasks = route ? tasks.slice(0, 4) : tasks;
  const journeyComplete = journeyChapter ? isJourneyPlaceComplete(place) : false;
  const journeyQuery = journeyChapter ? `&journey=${encodeURIComponent(journeyChapter.id)}` : "";
  return <section className={styles.page}>
    <Link to="/map" className={styles.back}><ArrowLeft size={16}/>{t("Xəritəyə qayıt")}</Link>
    <article className={styles.hero}><span aria-hidden="true">{place.type === "museum" ? "⌂" : "⌖"}</span><p className={styles.kicker}><Sparkles size={14}/>{t(place.status === "open" ? "Bu həftə açıqdır" : "Bu həftə bağlıdır")} · {t(place.district)}</p><h1>{t(place.name)}</h1><p className={styles.location}><MapPin size={15}/>{t(place.district)} · {place.radiusMeters} m {t("radius")}</p><p>{t(place.description)}</p>{place.is_ticketed && <p className={styles.reward}>{t("Biletli məkan · hər tapşırığa əlavə +{xp} XP", { xp: place.ticketed_place_bonus_xp })}</p>}<TicketLinkList place={place}/>
      {owner ? <TerritorySummary owner={owner} universityId={me?.universityId}/> : <div className={styles.reward}>{t("Bu həftə ərazi xalı hələ qazanılmayıb.")}</div>}
    </article>
    {journeyChapter && <article className={styles.journeyCard} aria-live="polite">
      <span className={styles.kicker}>{t("Səviyyə tapşırığı")}</span>
      <h2>{t(journeyChapter.title)}</h2>
      {journeyComplete ? <><p>{t("Muzey izi tamamlandı! Növbəti mərhələ xəritədə açıldı.")}</p><Link to="/game" className={styles.action}>{t("Macəraya davam et")}<ArrowRight size={15}/></Link></> : <>
        <p>{t("Mərhələ üçün əvvəl muzeyin QR ziyarətini, sonra isə muzey sualını tamamla.")}</p>
        <div className={styles.journeySteps}><span className={journeyVisitTask?.completed ? styles.journeyStepDone : ""}>{t("QR ziyarəti")}</span><span className={journeyQuestionTask?.completed ? styles.journeyStepDone : ""}>{t("Muzey sualı")}</span></div>
      </>}
    </article>}
    <GroupBonusInfo status={place.group_bonus}/>
    <div className={styles.contentCard}>
      <div className={styles.taskHeading}><div><h2>{t("Tapşırıqlar")}</h2><p>{t("Tapşırıq XP-si serverdə hesablanır.")}</p></div><button type="button" className={styles.action} onClick={() => setRoute((value) => !value)}>{t(route ? "Bütün tapşırıqlar" : "20 dəqiqəlik marşrut")}</button></div>
      {journeyChapter && journeyComplete && <Link className={styles.action} to="/game">{t("Macəraya davam et")}<ArrowRight size={15}/></Link>}
      {place.status === "open" && journeyNextTask && <Link className={styles.action} to={`/quests/${journeyNextTask.id}?place=${encodeURIComponent(place.slug)}${journeyQuery}`}>{t(journeyChapter ? journeyNextTask.code === "visit" ? "Ziyarət QR-ını oxut" : "Muzey sualına cavab ver" : "Fəth et · tapşırığa başla")}<ArrowRight size={15}/></Link>}
      {tasks.length === 0 && <p>{t("Bu məkanda hazırda tapşırıq yoxdur.")}</p>}
      <div className={styles.taskList}>{routeTasks.map((task) => <article className={styles.taskCard} key={task.id}>
        <div><span className={styles.difficulty}>{difficultyLabel(task.difficulty)}</span>{task.completed && <span className={styles.completed}>{t("Tamamlandı")}</span>}<h3>{t(task.title)}</h3><p>{t(task.description)}</p><small>+{task.xp} XP{task.ticketed_place_bonus_xp > 0 ? ` + ${task.ticketed_place_bonus_xp} XP ${t("bilet bonusu")}` : ""} · {task.needsReview ? t("Məzmun yoxlanış növbəsindədir") : ""}</small></div>
        {!task.completed && <Link className={styles.secondary} to={`/quests/${task.id}?place=${encodeURIComponent(place.slug)}${journeyQuery}`}>{t(task.type === "coop" ? "Komanda qur" : task.type === "qr_scan" ? "QR skan et" : "Tapşırığa başla")}<ArrowRight size={15}/></Link>}
      </article>)}</div>
      <p className={styles.routeNote}>{t("Marşrut {count} tapşırıqdan ibarətdir. Tapşırıqlar məkana görə qruplaşdırılıb.", { count: Math.min(routeTasks.length, 4) })}</p>
    </div>
  </section>;
}

function difficultyLabel(value) {
  return t(({ easy: "Asan", medium: "Orta", hard: "Usta" })[value] || "Asan");
}
