import { ArrowLeft, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useApiResource from "../../services/useApiResource";
import { useMocks } from "../../services/api";
import { MUSEUM_DETAILS } from "./contentData";
import TerritorySummary from "./components/TerritorySummary";
import styles from "./ContentPages.module.scss";

export default function MuseumDetailPage() {
  const { id } = useParams();
  if (!useMocks) return <ApiMuseumDetail slug={id} />;
  const museum = MUSEUM_DETAILS[id];
  if (!museum) return <section className={styles.page}><h1>Məkan tapılmadı</h1><p>Bu məkan kataloqda yoxdur.</p><Link to="/map" className={styles.action}><ArrowLeft size={16}/>Xəritəyə qayıt</Link></section>;
  return <section className={styles.page}><Link to="/" className={styles.back}><ArrowLeft size={16}/>Ana səhifə</Link><article className={styles.hero}><span>{museum.art}</span><p className={styles.kicker}><Sparkles size={14}/>Muzey bələdçisi</p><h1>{museum.name}</h1><p className={styles.location}><MapPin size={15}/>{museum.area} · Bakı</p><p>{museum.description}</p></article><div className={styles.contentCard}><h2>Kəşf ediləcək tapşırıqlar</h2><ul>{museum.quests.map((quest) => <li key={quest}>{quest}</li>)}</ul>{museum.pinId && <Link to={`/quests/${museum.pinId}`} className={styles.action}>Həftəlik tapşırığa başla<ArrowRight size={16}/></Link>}{museum.pinId && <Link to="/scanner" className={styles.secondary}>QR kodu skan et</Link>}<Link to="/map" className={styles.secondary}>Həftəlik xəritəyə bax</Link></div></section>;
}

function ApiMuseumDetail({ slug }) {
  const [route, setRoute] = useState(false);
  const { data: place, loading, error, retry } = useApiResource(`/places/${encodeURIComponent(slug || "")}`);
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: me } = useApiResource("/me", hasToken);
  if (loading) return <section className={styles.page}><p role="status">Məkan məlumatları yüklənir…</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{error}</p><button type="button" onClick={retry}>Yenidən yoxla</button></section>;
  if (!place) return <section className={styles.page}><h1>Məkan tapılmadı</h1><Link to="/map" className={styles.action}>Xəritəyə qayıt</Link></section>;
  const tasks = place.tasks || [];
  const owner = place.territory || null;
  const firstAvailableTask = tasks.find((task) => !task.completed);
  const routeTasks = route ? tasks.slice(0, 4) : tasks;
  return <section className={styles.page}>
    <Link to="/map" className={styles.back}><ArrowLeft size={16}/>Xəritəyə qayıt</Link>
    <article className={styles.hero}><span aria-hidden="true">{place.type === "museum" ? "⌂" : "⌖"}</span><p className={styles.kicker}><Sparkles size={14}/>{place.status === "open" ? "Bu həftə açıqdır" : "Bu həftə bağlıdır"} · {place.district}</p><h1>{place.name}</h1><p className={styles.location}><MapPin size={15}/>{place.district} · {place.radiusMeters} m radius</p><p>{place.description}</p>
      {owner ? <TerritorySummary owner={owner} universityId={me?.universityId}/> : <div className={styles.reward}>Bu həftə ərazi xalı hələ qazanılmayıb.</div>}
    </article>
    <div className={styles.contentCard}>
      <div className={styles.taskHeading}><div><h2>Tapşırıqlar</h2><p>Tapşırıq XP-si serverdə hesablanır.</p></div><button type="button" className={styles.action} onClick={() => setRoute((value) => !value)}>{route ? "Bütün tapşırıqlar" : "20 dəqiqəlik marşrut"}</button></div>
      {place.status === "open" && firstAvailableTask && <Link className={styles.action} to={`/quests/${firstAvailableTask.id}?place=${encodeURIComponent(place.slug)}`}>Fəth et · tapşırığa başla<ArrowRight size={15}/></Link>}
      {tasks.length === 0 && <p>Bu məkanda hazırda tapşırıq yoxdur.</p>}
      <div className={styles.taskList}>{routeTasks.map((task) => <article className={styles.taskCard} key={task.id}>
        <div><span className={styles.difficulty}>{difficultyLabel(task.difficulty)}</span>{task.completed && <span className={styles.completed}>Tamamlandı</span>}<h3>{task.title}</h3><p>{task.description}</p><small>+{task.xp} XP · {task.needsReview ? "Məzmun yoxlanış növbəsindədir" : ""}</small></div>
        {!task.completed && <Link className={styles.secondary} to={`/quests/${task.id}?place=${encodeURIComponent(place.slug)}`}>{task.type === "coop" ? "Komanda qur" : task.type === "qr_scan" ? "QR skan et" : "Tapşırığa başla"}<ArrowRight size={15}/></Link>}
      </article>)}</div>
      <p className={styles.routeNote}>Marşrut {Math.min(routeTasks.length, 4)} tapşırıqdan ibarətdir. Tapşırıqlar məkana görə qruplaşdırılıb.</p>
    </div>
  </section>;
}

function difficultyLabel(value) {
  return ({ easy: "Asan", medium: "Orta", hard: "Usta" })[value] || "Asan";
}
