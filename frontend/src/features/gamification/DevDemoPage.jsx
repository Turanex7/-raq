import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { apiRequest } from "../../services/api";
import PlaceholderPage from "../../app/PlaceholderPage";
import styles from "./DevDemoPage.module.scss";

export default function DevDemoPage() {
  if (!import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE !== "true") {
    return <PlaceholderPage title="Səhifə tapılmadı"/>;
  }
  return <DemoPanel/>;
}

function DemoPanel() {
  const [token, setToken] = useState("");
  const [season, setSeason] = useState(null);
  const [places, setPlaces] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const carpet = places.find((place) => place.slug === "carpet-museum");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [seasonData, placeData] = await Promise.all([apiRequest("/seasons/current"), apiRequest("/places")]);
      setSeason(seasonData);
      setPlaces(placeData);
    } catch (requestError) {
      setError(requestError.message || "Demo məlumatları yüklənmədi.");
    }
  }, []);

  useEffect(() => {
    document.title = "Demo paneli · Çıraq";
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

  function simulateCapture() {
    runAction("/admin/demo/simulate-activity", { count: 1, placeSlug: "carpet-museum" }, "Xalça Muzeyi fəaliyyəti");
  }

  function advanceWeek() {
    if (!season?.id || !window.confirm("Cari həftəni yekunlaşdırmaq istəyirsən? Bu əməl nəticələri saxlayacaq və yeni həftə yaradacaq.")) return;
    runAction("/admin/demo/advance-week", { seasonId: season.id }, "Həftənin yekunu");
  }

  const owner = carpet?.territory_owner;
  return <section className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.kicker}>Yalnız lokal development rejimində</p><h1>Demo paneli</h1><p>Ərazi dəyişikliyini və həftəlik nəticələrin yekunlaşmasını canlı göstər.</p></div>
      <button className={styles.refresh} type="button" onClick={refresh} disabled={busy}><RefreshCw size={16}/> Yenilə</button>
    </header>

    <form className={styles.tokenForm} onSubmit={(event) => event.preventDefault()}>
      <label>Demo admin açarı<input type="password" autoComplete="off" minLength={24} value={token} onChange={(event) => setToken(event.target.value)} placeholder="Admin açarını daxil et"/></label>
      <small>Açar yalnız bu səhifə açıq olduğu müddətdə yaddaşda qalır və qorunan sorğu ilə göndərilir.</small>
    </form>

    {error && <p className={styles.error} role="alert">{error}</p>}
    <article className={styles.status}>
      <div><span>Cari həftə</span><b>{season?.theme || "Yüklənir…"}</b><small>{season?.id || "Mövsüm məlumatı gözlənilir"}</small></div>
      <div><span>Xalça Muzeyi ərazisi</span><b>{owner?.university || "Hələ sahibi yoxdur"}</b><small>{owner ? `${owner.score} xal · ${owner.gap} xal fərq` : "Xalça Muzeyi məlumatı gözlənilir"}</small></div>
    </article>

    <div className={styles.actions}>
      <article className={styles.actionCard}><Activity aria-hidden="true"/><h2>Ərazi dəyişikliyi</h2><p>Rəqib universitet üçün Xalça Muzeyində uyğun demo tapşırığını tamamla; cari xal və sahib dərhal yenilənəcək.</p><button type="button" onClick={simulateCapture} disabled={busy || !token.trim()}>{busy ? "İcra olunur…" : "Xalça Muzeyində fəth et"}</button></article>
      <article className={styles.actionCard}><Trophy aria-hidden="true"/><h2>Həftəlik yekun</h2><p>Cari mövsümü bağla, yekun reytinqi və ərazi nəticələrini saxla, növbəti həftəni aç.</p><button type="button" onClick={advanceWeek} disabled={busy || !token.trim() || !season?.id}><RotateCcw size={15}/>{busy ? "İcra olunur…" : "Həftəni yekunlaşdır"}</button></article>
    </div>

    {result && <article className={styles.result} role="status"><b>{result.title}</b>{result.title === "Xalça Muzeyi fəaliyyəti" ? <p>{result.data.captured ? "Xalça Muzeyinin sahibi dəyişdi." : "Fəaliyyət qeydə alındı; ərazi sahibi bu addımda dəyişmədi."} · {result.data.simulated} tapşırıq tamamlandı.</p> : <p>Həftə yekunlaşdı · {result.data.users_ranked} iştirakçı sıralandı · {result.data.territory_snapshots} ərazi nəticəsi saxlanıldı.</p>}</article>}
  </section>;
}
