import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, Flame, QrCode, Sparkles, Users, Volume2, VolumeX, Zap } from "lucide-react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiRequest, apiPost } from "../../services/api";
import ShareCardButton from "./ShareCardButton";
import styles from "./ContentPages.module.scss";
import useApiResource from "../../services/useApiResource";
import { celebrateLantern, getLanternSoundEnabled, playLanternChime, setLanternSoundEnabled } from "../home/lanternEffects";

export default function QuestDetailPage() {
  return <ApiTaskPlayer />;
}

function ApiTaskPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const { data: gameConfig } = useApiResource("/config");
  const slug = search.get("place");
  const returnedSessionId = search.get("sessionId");
  const lanternChapter = search.get("chapter") === "lantern" || location.state?.lanternChapter === true;
  const [place, setPlace] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(location.state?.completion || null);
  const [session, setSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(getLanternSoundEnabled);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const places = slug ? [await apiRequest(`/places/${encodeURIComponent(slug)}`)] : await Promise.all((await apiRequest("/places")).map((item) => apiRequest(`/places/${encodeURIComponent(item.slug)}`)));
        const found = places.find((item) => item.tasks?.some((candidate) => candidate.id === id));
        if (!found) throw new Error("Tapşırıq tapılmadı.");
        const selectedTask = found.tasks.find((candidate) => candidate.id === id);
        if (!cancelled) { setPlace(found); setTask(selectedTask); }
      } catch (loadError) { if (!cancelled) setError(loadError.message || "Tapşırıq yüklənmədi."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [id, slug]);

  useEffect(() => {
    if (!returnedSessionId) return;
    apiRequest(`/coop/${encodeURIComponent(returnedSessionId)}`).then(setSession).catch(() => {});
  }, [returnedSessionId]);

  useEffect(() => {
    if (!returnedSessionId || !session || session.completed) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try { const next = await apiRequest(`/coop/${returnedSessionId}`); if (!cancelled) setSession(next); }
      catch { /* Keep the lobby state visible and let the next poll retry. */ }
    }, 2000);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [returnedSessionId, session]);

  async function complete(value = answer) {
    if (!task || submitting) return;
    setSubmitting(true); setError("");
    try {
      const response = await apiPost(`/tasks/${encodeURIComponent(task.id)}/complete`, { answer: value });
      setResult(response);
      celebrateLantern();
      window.dispatchEvent(new Event("chiraq:xp-updated"));
      const refreshed = await apiRequest(`/places/${encodeURIComponent(place.slug)}`);
      setTask(refreshed.tasks.find((item) => item.id === task.id));
    } catch (submitError) { setError(submitError.message || "Tapşırıq tamamlanmadı."); }
    finally { setSubmitting(false); }
  }

  async function joinCoop() {
    navigate(`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}&coop=1`);
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setLanternSoundEnabled(next);
    if (next) playLanternChime();
  }

  if (loading) return <section className={styles.page}><p role="status">Tapşırıq yüklənir…</p></section>;
  if (error && !task) return <section className={styles.page}><p role="alert">{error}</p><Link to="/map" className={styles.action}>Xəritəyə qayıt</Link></section>;
  if (!task || !place) return null;
  if (task.completed && !result) return <section className={styles.page}><Link to={`/museums/${place.slug}`} className={styles.back}><ArrowLeft size={16}/>Məkan tapşırıqları</Link><h1>Tapşırıq tamamlanıb</h1><p>XP təkrar verilməyib. Davam etmək üçün başqa tapşırıq seç.</p></section>;

  return <section className={styles.page}>
    <Link to={`/museums/${place.slug}`} className={styles.back}><ArrowLeft size={16}/>{place.name}</Link>
    <article className={styles.hero}><p className={styles.kicker}><Sparkles size={14}/>{difficultyName(task.difficulty)} · {place.district}</p><h1>{task.title}</h1><p>{task.description}</p><p className={styles.reward}><Zap size={16}/>{task.xp} XP · {typeName(task.type)}</p></article>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {!result && task.type === "quiz" && <div className={styles.contentCard}><h2>{task.payload?.question || "Suala cavab ver"}</h2><p>Səhv cavab cərimə yaratmır; mümkün XP-nin 40%-i verilir.</p><form onSubmit={(event) => { event.preventDefault(); complete(); }}><label className={styles.answerLabel}>Cavabın<input value={answer} onChange={(event) => setAnswer(event.target.value)} required maxLength={100} placeholder="Cavabını yaz"/></label><button className={styles.action} disabled={submitting} type="submit">{submitting ? "Yoxlanılır…" : "Cavabı təsdiqlə"}</button></form></div>}
    {!result && task.type === "vote" && <div className={styles.contentCard}><h2>{task.payload?.question || "Seçimini et"}</h2><div className={styles.voteOptions}>{(task.payload?.choices || ["Memarlıq", "Tarix", "İncəsənət"]).map((choice) => <button key={choice} disabled={submitting} type="button" onClick={() => { setAnswer(choice); complete(choice); }}>{choice}</button>)}</div><p>Bu subyektiv seçimdir; hər cavaba tam XP verilir.</p></div>}
    {!result && task.type === "qr_scan" && <div className={styles.contentCard}><h2>Eksponatdakı QR kodu oxut</h2><p>Kameranı muzeydə yerləşən kodun üzərinə yönəlt.</p><Link className={styles.action} to={`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}${lanternChapter ? "&chapter=lantern" : ""}`}><QrCode size={16}/>Skaneri aç</Link></div>}
    {!result && task.type === "coop" && <div className={styles.contentCard}><h2>3 dostla eyni məkanda</h2><p>QR kodunu iki dəqiqə ərzində skan edin. Eyni universitetin və ya qrupun iştirakçıları qoşula bilər.</p><button className={styles.action} type="button" onClick={joinCoop}><Users size={16}/>Ko-op-a qoşul</button>{session && <div className={styles.lobby} role="status"><b>{session.joined}/{session.needed} dost qoşuldu</b><span><Clock3 size={14}/>Sessiya vaxtı: 2 dəqiqə</span><ul>{session.participants.map((member) => <li key={member.id}>{member.name}</li>)}</ul></div>}</div>}
    {!result && task.type === "find" && place.type === "museum" && <div className={styles.contentCard}><h2>Tapdığın detalı bölüş</h2><p>Subyektiv tapşırıqdır; istənilən səmimi cavab tam XP qazandırır.</p><form onSubmit={(event) => { event.preventDefault(); complete(); }}><label className={styles.answerLabel}>Məkanda hansı detalı tapdın?<input value={answer} onChange={(event) => setAnswer(event.target.value)} required maxLength={240} placeholder="Məsələn, fasaddakı naxış"/></label><button className={styles.action} type="submit" disabled={submitting}>Tapşırığı tamamla</button></form></div>}
    {!result && task.type === "find" && place.type === "outdoor" && <div className={styles.contentCard}><h2>Məkanın radiusunda ol</h2><p>GPS icazəsi olmadan açıq hava yoxlaması mümkün deyil. Lokasiya məlumatı yalnız yoxlama zamanı istifadə olunur.</p><Link className={styles.action} to={`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}&checkin=1`}>Yoxlamaya başla</Link></div>}
    {result && <div className={styles.contentCard}>
      <p className={styles.kicker}><Check size={15}/>Tapşırıq tamamlandı</p>
      <div className={styles.xpGain} aria-live="polite"><strong>+{result.xp_awarded} XP</strong><span>Qazanılan XP</span></div>
      <div className={styles.xpTotals}><p><span>Ümumi XP</span><b>{result.new_total}</b></p><p><span>Həftəlik XP</span><b>{result.weekly_total ?? "—"}</b></p></div>
      <div className={styles.breakdown}><b>XP bölgüsü</b><ul>
        <li>Əsas XP: {result.breakdown.base_xp}</li>
        <li>İlk muzey ziyarəti: {result.breakdown.first_visit}</li>
        <li>Dəstə bonusu: {result.breakdown.group_bonus}</li>
        <li>Həftəlik liqa əlavəsi: {result.breakdown.multiplier}</li>
      </ul></div>
      {result.correct === false && <p>Düzgün cavab: <b>{result.correct_answer}</b>. {result.fact}</p>}
      {result.level_up && <p className={styles.levelMoment}>Yeni səviyyə açıldı: <b>{result.level}</b></p>}
      {result.avatar_unlocked?.length > 0 && <p className={styles.levelMoment}>Açılan avatar: <b>{result.avatar_unlocked.map((avatar) => avatar.name).join(", ")}</b></p>}
      {result.souvenir_drop && <p>Suvenir kolleksiyaya əlavə olundu: <b>{result.souvenir_drop.name}</b> · {rarityName(result.souvenir_drop.rarity)}</p>}
      {result.territory_change && <p>{result.territory_change.message}</p>}
      {lanternChapter && <div className={styles.flameMoment} role="status"><span className={styles.flameIcon}><Flame size={24} fill="currentColor"/></span><div><b>{result.lantern?.lit ?? "—"}/{result.lantern?.total ?? "—"} alov işıqlanıb</b><p>{gameConfig?.story_chapter?.flame_lit || "Bir alov parçası işıqlandı."}</p><p className={styles.cliffhanger}>{gameConfig?.story_chapter?.cliffhanger || "Növbəti alov başqa yerdədir..."}</p><button type="button" className={styles.soundToggle} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}Səs {soundEnabled ? "açıqdır" : "bağlıdır"}</button></div></div>}
      {lanternChapter && place.type === "museum" && <div className={styles.nextChapter}><b>İndi eksponata bax</b><p>Yaxınlıqda tamamlanmamış asan və orta tapşırıqlar:</p>{(place.tasks || []).filter((candidate) => !candidate.completed && ["easy", "medium"].includes(candidate.difficulty) && candidate.type !== "qr_scan" && candidate.type !== "coop").slice(0, 2).map((candidate) => <Link key={candidate.id} to={`/quests/${candidate.id}?place=${encodeURIComponent(place.slug)}&chapter=lantern`}>{candidate.title} →</Link>)}</div>}
      <ShareCardButton placeId={place.slug}/><Link className={styles.secondary} to={`/museums/${place.slug}`}>Başqa tapşırıq seç</Link>
    </div>}
  </section>;
}

function difficultyName(value) { return ({ easy: "Asan", medium: "Orta", hard: "Usta" })[value] || "Asan"; }
function typeName(value) { return ({ qr_scan: "QR", quiz: "Bilik sualı", vote: "Səsvermə", coop: "Ko-op", find: "Məkan kəşfi" })[value] || "Tapşırıq"; }
function rarityName(value) { return ({ adi: "Adi", nadir: "Nadir", epik: "Epik" })[value] || value; }
