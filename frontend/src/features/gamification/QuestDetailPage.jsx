import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, QrCode, Sparkles, Users, Zap } from "lucide-react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiRequest, apiPost } from "../../services/api";
import ShareCardButton from "./ShareCardButton";
import styles from "./ContentPages.module.scss";
import { celebrateLantern } from "../home/lanternEffects";
import { translate as t } from "../../i18n/i18n";

export default function QuestDetailPage() {
  return <ApiTaskPlayer />;
}

function ApiTaskPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const slug = search.get("place");
  const returnedSessionId = search.get("sessionId");
  const [place, setPlace] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(location.state?.completion || null);
  const [session, setSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const places = slug ? [await apiRequest(`/places/${encodeURIComponent(slug)}`)] : await Promise.all((await apiRequest("/places")).map((item) => apiRequest(`/places/${encodeURIComponent(item.slug)}`)));
        const found = places.find((item) => item.tasks?.some((candidate) => candidate.id === id));
        if (!found) throw new Error(t("Tapşırıq tapılmadı."));
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
    if (!returnedSessionId || !session || session.completed || session.expired) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try { const next = await apiRequest(`/coop/${returnedSessionId}`); if (!cancelled) setSession(next); }
      catch { /* Keep the lobby state visible and let the next poll retry. */ }
    }, 2000);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [returnedSessionId, session]);

  useEffect(() => {
    if (!session?.completed) return;
    window.dispatchEvent(new Event("chiraq:xp-updated"));
    celebrateLantern();
  }, [session?.completed]);

  async function complete(value = answer) {
    if (!task || submitting) return;
    setSubmitting(true); setError("");
    try {
      const response = await apiPost(`/tasks/${encodeURIComponent(task.id)}/complete`, { answer: value });
      setResult(response);
      window.dispatchEvent(new Event("chiraq:xp-updated"));
      const refreshed = await apiRequest(`/places/${encodeURIComponent(place.slug)}`);
      setTask(refreshed.tasks.find((item) => item.id === task.id));
    } catch (submitError) { setError(submitError.message || "Tapşırıq tamamlanmadı."); }
    finally { setSubmitting(false); }
  }

  async function joinCoop() {
    navigate(`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}&coop=1`);
  }

  async function submitCoopAnswer(event) {
    event.preventDefault();
    if (!returnedSessionId || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await apiPost(`/coop/${encodeURIComponent(returnedSessionId)}/answer`, { answer });
      setSession(response);
      setAnswer("");
    } catch (answerError) {
      setError(answerError.message || "Cavab göndərilmədi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className={styles.page}><p role="status">{t("Tapşırıq yüklənir…")}</p></section>;
  if (error && !task) return <section className={styles.page}><p role="alert">{t(error)}</p><Link to="/map" className={styles.action}>{t("Xəritəyə qayıt")}</Link></section>;
  if (!task || !place) return null;
  if (task.completed && !result) return <section className={styles.page}><Link to={`/museums/${place.slug}`} className={styles.back}><ArrowLeft size={16}/>{t("Məkan tapşırıqları")}</Link><h1>{t("Tapşırıq tamamlanıb")}</h1><p>{t("XP təkrar verilməyib. Davam etmək üçün başqa tapşırıq seç.")}</p></section>;

  return <section className={styles.page}>
    <Link to={`/museums/${place.slug}`} className={styles.back}><ArrowLeft size={16}/>{t(place.name)}</Link>
    <article className={styles.hero}><p className={styles.kicker}><Sparkles size={14}/>{difficultyName(task.difficulty)} · {t(place.district)}</p><h1>{t(task.title)}</h1><p>{t(task.description)}</p><p className={styles.reward}><Zap size={16}/>{task.xp} XP{task.ticketed_place_bonus_xp > 0 ? ` + ${task.ticketed_place_bonus_xp} XP ${t("bilet bonusu")}` : ""} · {typeName(task.type)}</p></article>
    {error && <p role="alert" className={styles.error}>{t(error)}</p>}
    {!result && task.type === "quiz" && <div className={styles.contentCard}><h2>{t(task.payload?.question || "Suala cavab ver")}</h2><p>{t("Səhv cavab cərimə yaratmır; mümkün XP-nin 40%-i verilir.")}</p><form onSubmit={(event) => { event.preventDefault(); complete(); }}><label className={styles.answerLabel}>{t("Cavabın")}<input value={answer} onChange={(event) => setAnswer(event.target.value)} required maxLength={100} placeholder={t("Cavabını yaz")}/></label><button className={styles.action} disabled={submitting} type="submit">{submitting ? t("Yoxlanılır…") : t("Cavabı təsdiqlə")}</button></form></div>}
    {!result && task.type === "vote" && <div className={styles.contentCard}><h2>{t(task.payload?.question || "Seçimini et")}</h2><div className={styles.voteOptions}>{(task.payload?.choices || ["Memarlıq", "Tarix", "İncəsənət"]).map((choice) => <button key={choice} disabled={submitting} type="button" onClick={() => { setAnswer(choice); complete(choice); }}>{t(choice)}</button>)}</div><p>{t("Bu subyektiv seçimdir; hər cavaba tam XP verilir.")}</p></div>}
    {!result && task.type === "qr_scan" && <div className={styles.contentCard}><h2>{t("Eksponatdakı QR kodu oxut")}</h2><p>{t("Kameranı muzeydə yerləşən kodun üzərinə yönəlt.")}</p><Link className={styles.action} to={`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}`}><QrCode size={16}/>{t("Skaneri aç")}</Link></div>}
    {!result && task.type === "coop" && <div className={styles.contentCard}><h2>{t("Üçlü alov")}</h2><p>{t("Üç iştirakçı QR kodunu skan edib ayrı rollarını seçir. Hər kəs cavabını 60 dəqiqə ərzində göndərməlidir; tapşırıq tamamlananda XP-ni server verir.")}</p><button className={styles.action} type="button" onClick={joinCoop}><Users size={16}/>{t("QR skan et və rolunu al")}</button>{session && <div className={styles.lobby} role="status"><b>{t("{joined}/{needed} iştirakçı qoşulub", { joined: session.joined, needed: session.needed })}</b><span><Clock3 size={14}/>{session.expired ? t("Sessiyanın vaxtı bitib") : t("Cavab üçün 60 dəqiqə")}</span><ul>{session.participants.map((member) => <li key={member.id}>{t(member.role)} · {member.answered ? t("Cavab verdi") : t("Gözləyir")}</li>)}</ul>{session.my_role && !session.completed && !session.expired && <div className={styles.roleQuestion}><b>{t("Sənin rolun: {role}", { role: t(session.my_role) })}</b><p>{t(session.role_question?.text || "")}</p>{session.role_question?.needs_review && <small>{t("Mətn yoxlama növbəsindədir.")}</small>}{!session.answered && <form onSubmit={submitCoopAnswer}><label className={styles.answerLabel}>{t("Müşahidən")}<input value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={240} minLength={2} required placeholder={t("Məkanda gördüyün detalı yaz")}/></label><button className={styles.action} type="submit" disabled={submitting}>{submitting ? t("Göndərilir…") : t("Cavabı göndər")}</button></form>}{session.answered && !session.completed && <p>{t("Cavabın qeydə alındı. Digər rolların cavablarını gözlə.")}</p>}</div>}{session.completed && <div className={styles.roleComplete}><b>{t("Üçlü alov tamamlandı.")}</b><p>{t("XP serverdə hesablandı:")} <strong>+{session.xp_awarded} XP</strong></p><span>{t("Əsas XP:")} {session.breakdown?.base_xp ?? 0}{session.breakdown?.ticketed_place_bonus > 0 ? ` · ${t("Bilet bonusu:")} ${session.breakdown.ticketed_place_bonus}` : ""} · {t("Dəstə bonusu:")} {session.breakdown?.group_bonus ?? 0}</span><ShareCardButton placeId={place.slug}/></div>}</div>}</div>}
    {!result && task.type === "find" && place.type === "museum" && <div className={styles.contentCard}><h2>{t("Tapdığın detalı bölüş")}</h2><p>{t("Subyektiv tapşırıqdır; istənilən səmimi cavab tam XP qazandırır.")}</p><form onSubmit={(event) => { event.preventDefault(); complete(); }}><label className={styles.answerLabel}>{t("Məkanda hansı detalı tapdın?")}<input value={answer} onChange={(event) => setAnswer(event.target.value)} required maxLength={240} placeholder={t("Məsələn, fasaddakı naxış")}/></label><button className={styles.action} type="submit" disabled={submitting}>{t("Tapşırığı tamamla")}</button></form></div>}
    {!result && task.type === "find" && place.type === "outdoor" && <div className={styles.contentCard}><h2>{t("Məkanın radiusunda ol")}</h2><p>{t("GPS icazəsi olmadan açıq hava yoxlaması mümkün deyil. Lokasiya məlumatı yalnız yoxlama zamanı istifadə olunur.")}</p><Link className={styles.action} to={`/scanner?taskId=${encodeURIComponent(task.id)}&place=${encodeURIComponent(place.slug)}&checkin=1`}>{t("Yoxlamaya başla")}</Link></div>}
    {result && <div className={styles.contentCard}>
      <p className={styles.kicker}><Check size={15}/>{t("Tapşırıq tamamlandı")}</p>
      <div className={styles.xpGain} aria-live="polite"><strong>+{result.xp_awarded} XP</strong><span>{t("Qazanılan XP")}</span></div>
      <div className={styles.xpTotals}><p><span>{t("Ümumi XP")}</span><b>{result.new_total}</b></p><p><span>{t("Həftəlik XP")}</span><b>{result.weekly_total ?? "—"}</b></p></div>
      <div className={styles.breakdown}><b>{t("XP bölgüsü")}</b><ul>
        <li>{t("Əsas XP:")} {result.breakdown.base_xp}</li>
        {result.breakdown.ticketed_place_bonus > 0 && <li>{t("Biletli məkan bonusu:")} {result.breakdown.ticketed_place_bonus}</li>}
        <li>{t("İlk muzey ziyarəti:")} {result.breakdown.first_visit}</li>
        <li>{t("Dəstə bonusu:")} {result.breakdown.group_bonus}</li>
        <li>{t("Həftəlik liqa əlavəsi:")} {result.breakdown.multiplier}</li>
      </ul></div>
      {result.correct === false && <p>{t("Düzgün cavab:")} <b>{t(result.correct_answer)}</b>. {t(result.fact)}</p>}
      {result.level_up && <p className={styles.levelMoment}>{t("Yeni səviyyə açıldı:")} <b>{result.level}</b></p>}
      {result.avatar_unlocked?.length > 0 && <p className={styles.levelMoment}>{t("Açılan avatar:")} <b>{result.avatar_unlocked.map((avatar) => t(avatar.name)).join(", ")}</b></p>}
      {result.souvenir_drop && <p>{t("Suvenir kolleksiyaya əlavə olundu:")} <b>{t(result.souvenir_drop.name)}</b> · {rarityName(result.souvenir_drop.rarity)}</p>}
      {result.rare_flame_drop && <p className={styles.levelMoment}>{t("Nadir alov kolleksiyaya əlavə olundu:")} <b>{t(result.rare_flame_drop.name)}</b> · {rarityName(result.rare_flame_drop.rarity)} · {t("XP qazandırmır.")}</p>}
      {result.territory_change && <p>{t(result.territory_change.message)}</p>}
      <ShareCardButton placeId={place.slug}/><Link className={styles.secondary} to={`/museums/${place.slug}`}>{t("Başqa tapşırıq seç")}</Link>
    </div>}
  </section>;
}

function difficultyName(value) { return t(({ easy: "Asan", medium: "Orta", hard: "Usta" })[value] || "Asan"); }
function typeName(value) { return t(({ qr_scan: "QR", quiz: "Bilik sualı", vote: "Səsvermə", coop: "Ko-op", find: "Məkan kəşfi" })[value] || "Tapşırıq"); }
function rarityName(value) { return t(({ adi: "Adi", nadir: "Nadir", epik: "Epik" })[value] || value); }
