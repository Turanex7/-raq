import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { apiRequest } from "../../services/api";
import PlaceholderPage from "../../app/PlaceholderPage";
import styles from "./DevDemoPage.module.scss";
import { translate as t, useI18n } from "../../i18n/i18n";

export default function DevDemoPage() {
  if (!import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE !== "true") {
    return <PlaceholderPage title="Səhifə tapılmadı"/>;
  }
  return <DemoPanel/>;
}

function DemoPanel() {
  const { language } = useI18n();
  const [token, setToken] = useState("");
  const [season, setSeason] = useState(null);
  const [places, setPlaces] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState("");
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const carpet = places.find((place) => place.slug === "carpet-museum");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [seasonData, placeData] = await Promise.all([apiRequest("/seasons/current"), apiRequest("/places")]);
      setSeason(seasonData);
      setPlaces(Array.isArray(placeData) ? placeData : []);
    } catch (requestError) {
      setError(requestError.message || "Demo məlumatları yüklənmədi.");
    }
  }, []);

  useEffect(() => { document.title = `${t("Demo paneli")} · Çıraq`; }, [language]);

  useEffect(() => {
    const timer = window.setTimeout(() => { refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function runAction(path, body, title) {
    if (!token.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const data = await apiRequest(path, {
        method: "POST",
        headers: { "X-Admin-Token": token.trim() },
        body: JSON.stringify(body),
      });
      setResult({ title, data });
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Demo əməliyyatı alınmadı.");
    } finally {
      setBusy(false);
    }
  }

  async function loadMetrics() {
    if (!token.trim()) return;
    setMetricsLoading(true);
    setMetricsError("");
    setMetrics(null);
    try {
      setMetrics(await apiRequest("/admin/metrics", { headers: { "X-Admin-Token": token.trim() } }));
    } catch (requestError) {
      setMetricsError(requestError.message || "Göstəricilər yüklənmədi.");
    } finally {
      setMetricsLoading(false);
    }
  }

  function simulateCapture() {
    runAction("/admin/demo/simulate-activity", { count: 1, placeSlug: "carpet-museum" }, "Xalça Muzeyi fəaliyyəti");
  }

  function advanceWeek() {
    if (!season?.id || !window.confirm(t("Cari həftəni yekunlaşdırmaq istəyirsən? Bu əməl nəticələri saxlayacaq və yeni həftə yaradacaq."))) return;
    runAction("/admin/demo/advance-week", { seasonId: season.id }, "Həftənin yekunu");
  }

  const owner = carpet?.territory_owner;
  const positivePlaces = Array.isArray(metrics?.visits_per_place) ? metrics.visits_per_place.filter((row) => row.visits > 0) : [];
  const positiveUniversities = Array.isArray(metrics?.visits_per_university) ? metrics.visits_per_university.filter((row) => row.visits > 0) : [];
  const hasRealActivity = Boolean(metrics && (metrics.new_users > 0 || metrics.users_with_museum_completion > 0 || metrics.first_time_museum_visitors > 0 || positivePlaces.length > 0 || positiveUniversities.length > 0));
  return <section className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.kicker}>{t("Yalnız lokal development rejimində")}</p><h1>{t("Demo paneli")}</h1><p>{t("Ərazi dəyişikliyini və həftəlik nəticələrin yekunlaşmasını canlı göstər.")}</p></div>
      <button className={styles.refresh} type="button" onClick={refresh} disabled={busy}><RefreshCw size={16}/> {t("Yenilə")}</button>
    </header>

    <form className={styles.tokenForm} onSubmit={(event) => event.preventDefault()}>
      <label>{t("Demo admin açarı")}<input type="password" autoComplete="off" minLength={24} value={token} onChange={(event) => setToken(event.target.value)} placeholder={t("Admin açarını daxil et")}/></label>
      <small>{t("Açar yalnız bu səhifə açıq olduğu müddətdə yaddaşda qalır və qorunan sorğu ilə göndərilir.")}</small>
    </form>

    <article className={styles.metrics}>
      <div className={styles.metricsHead}><div><h2>{t("Real istifadəçi göstəriciləri")}</h2><p>{t("Nümunə demo profilləri bu saylara daxil edilmir.")}</p></div><button className={styles.metricsButton} type="button" onClick={loadMetrics} disabled={metricsLoading || token.trim().length < 24}>{metricsLoading ? t("Yüklənir…") : t("Göstəriciləri yenilə")}</button></div>
      {metricsError && <p className={styles.error} role="alert">{t(metricsError)}</p>}
      {!metrics && !metricsError && <p className={styles.metricEmpty}>{t("Göstəricilərə baxmaq üçün demo admin açarını daxil et.")}</p>}
      {metrics && !hasRealActivity && <p className={styles.metricEmpty}>{t("Hələ real istifadəçi fəaliyyəti yoxdur. Fəaliyyət qeydə alındıqca göstəricilər burada görünəcək.")}</p>}
      {metrics && hasRealActivity && <>
        <div className={styles.metricCounts}><div><b>{metrics.new_users}</b><span>{t("Yeni istifadəçi")}</span></div><div><b>{metrics.users_with_museum_completion}</b><span>{t("Muzey tapşırığı tamamlayan")}</span></div><div><b>{metrics.first_time_museum_visitors}</b><span>{t("İlk muzey ziyarəti")}</span></div></div>
        <div className={styles.metricBreakdowns}><section><h3>{t("Məkanlar üzrə ziyarət")}</h3>{positivePlaces.length ? <ul className={styles.metricList}>{positivePlaces.map((row) => <li key={row.place}><span>{t(row.place)}</span><b>{row.visits}</b></li>)}</ul> : <p className={styles.metricEmpty}>{t("Hələ ziyarət qeydə alınmayıb.")}</p>}</section><section><h3>{t("Universitetlər üzrə ziyarət")}</h3>{positiveUniversities.length ? <ul className={styles.metricList}>{positiveUniversities.map((row) => <li key={row.university}><span>{row.university}</span><b>{row.visits}</b></li>)}</ul> : <p className={styles.metricEmpty}>{t("Hələ ziyarət qeydə alınmayıb.")}</p>}</section></div>
      </>}
    </article>

    {error && <p className={styles.error} role="alert">{t(error)}</p>}
    <article className={styles.status}>
      <div><span>{t("Cari həftə")}</span><b>{t(season?.theme || "Yüklənir…")}</b><small>{season?.id || t("Mövsüm məlumatı gözlənilir")}</small></div>
      <div><span>{t("Xalça Muzeyi ərazisi")}</span><b>{owner?.university || t("Hələ sahibi yoxdur")}</b><small>{owner ? t("{score} xal · {gap} xal fərq", { score: owner.score, gap: owner.gap }) : t("Xalça Muzeyi məlumatı gözlənilir")}</small></div>
    </article>

    <div className={styles.actions}>
      <article className={styles.actionCard}><Activity aria-hidden="true"/><h2>{t("Ərazi dəyişikliyi")}</h2><p>{t("Rəqib universitet üçün Xalça Muzeyində uyğun demo tapşırığını tamamla; cari xal və sahib dərhal yenilənəcək.")}</p><button type="button" onClick={simulateCapture} disabled={busy || !token.trim()}>{busy ? t("İcra olunur…") : t("Xalça Muzeyində fəth et")}</button></article>
      <article className={styles.actionCard}><Trophy aria-hidden="true"/><h2>{t("Həftəlik yekun")}</h2><p>{t("Cari mövsümü bağla, yekun reytinqi və ərazi nəticələrini saxla, növbəti həftəni aç.")}</p><button type="button" onClick={advanceWeek} disabled={busy || !token.trim() || !season?.id}><RotateCcw size={15}/>{busy ? t("İcra olunur…") : t("Həftəni yekunlaşdır")}</button></article>
    </div>

    {result && <article className={styles.result} role="status"><b>{t(result.title)}</b>{result.title === "Xalça Muzeyi fəaliyyəti" ? <p>{t(result.data.captured ? "Xalça Muzeyinin sahibi dəyişdi." : "Fəaliyyət qeydə alındı; ərazi sahibi bu addımda dəyişmədi.")} · {t("{count} tapşırıq tamamlandı.", { count: result.data.simulated })}</p> : <p>{t("Həftə yekunlaşdı · {ranked} iştirakçı sıralandı · {snapshots} ərazi nəticəsi saxlanıldı.", { ranked: result.data.users_ranked, snapshots: result.data.territory_snapshots })}</p>}</article>}
  </section>;
}
