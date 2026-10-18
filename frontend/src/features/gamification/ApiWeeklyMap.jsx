import { Fragment, useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Compass, MapPin, RefreshCw, Sparkles, Trophy, Zap } from "lucide-react";
import useApiResource from "../../services/useApiResource";
import WeeklyResetCountdown from "./components/WeeklyResetCountdown";
import TerritorySummary from "./components/TerritorySummary";
import styles from "./ApiWeeklyMap.module.scss";

const BAKU = [40.382, 49.858];

function MapResize({ revision }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    window.addEventListener("resize", refresh);
    refresh();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      window.cancelAnimationFrame(frame);
    };
  }, [map, revision]);
  return null;
}

function MapContents({ places, onTileError, userUniversityId, universityLamps }) {
  return <MapContainer center={BAKU} zoom={12} minZoom={10} maxZoom={18} scrollWheelZoom zoomControl={false} className={styles.map}>
    <MapResize revision={places.length}/><ZoomControl position="bottomright"/>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: onTileError }}/>
    {places.map((place) => <Fragment key={place.id}>
      <Circle center={[place.lat, place.lng]} radius={place.radius_m} pathOptions={{ color: place.status === "open" ? "#84d9b8" : "#7c7895", fillColor: place.status === "open" ? "#84d9b8" : "#7c7895", fillOpacity: 0.08, weight: 1 }}/>
      <CircleMarker center={[place.lat, place.lng]} radius={place.type === "museum" ? 10 : 7} pathOptions={{ color: place.status === "open" ? "#a0e4c9" : "#87839b", fillColor: place.status === "open" ? "#39ac83" : "#45425a", fillOpacity: 1, weight: 2 }}>
        <Popup><div className={styles.popup}><b>{place.name}</b><span>{place.status === "open" ? "Açıqdır" : "Bağlıdır"} · {place.radius_m} m</span><TerritorySummary owner={place.territory_owner} universityId={userUniversityId} universityLamp={universityLamps[place.territory_owner?.university_id]} compact/>{!place.territory_owner && <span>Bu həftə ərazi xalı hələ qazanılmayıb.</span>}<Link to={`/museums/${place.slug}`}>{place.status === "open" ? "Fəth et →" : "Məkan detallarına bax →"}</Link></div></Popup>
      </CircleMarker>
    </Fragment>)}
  </MapContainer>;
}

function Retry({ message, onRetry }) {
  return <div className={styles.state} role="alert"><p>{message}</p><button type="button" onClick={onRetry}><RefreshCw size={15}/>Yenidən yoxla</button></div>;
}

export default function ApiWeeklyMap() {
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const placesResult = useApiResource("/places");
  const seasonResult = useApiResource("/seasons/current");
  const leagueResult = useApiResource("/leaderboard?scope=league", hasToken);
  const { data: me } = useApiResource("/me", hasToken);
  const [tilesFailed, setTilesFailed] = useState(false);
  const places = Array.isArray(placesResult.data) ? placesResult.data : [];
  const leagueRows = Array.isArray(leagueResult.data?.rows) ? leagueResult.data.rows : [];
  const maxFairScore = Math.max(0, ...leagueRows.filter((row) => row.eligible !== false).map((row) => Number(row.fairScore ?? row.fair_score ?? 0)));
  const universityLamps = Object.fromEntries(leagueRows.map((row) => [row.universityId ?? row.university_id, { score: Number(row.fairScore ?? row.fair_score ?? 0), maxScore: maxFairScore }]));
  return <section className={styles.page}>
    <header className={styles.heading}><div><p><Sparkles size={14}/>Həftəlik mövsüm · {seasonResult.data?.theme || "Çıraq kəşfi"}</p><h1>Bakı xəritəsi</h1><span>Muzeyə gedib tapşırıq tamamla, universitetin üçün xal və ərazi qazan.</span></div>{seasonResult.data && <WeeklyResetCountdown secondsRemaining={seasonResult.data.seconds_remaining} className={styles.timer}/>}</header>
    {placesResult.loading && <div className={styles.state} role="status">Xəritə yüklənir…</div>}
    {placesResult.error && <Retry message={placesResult.error} onRetry={placesResult.retry}/>}
    {Array.isArray(placesResult.data) && <>
      <div className={styles.stats}><span><MapPin size={16}/>{places.filter((p) => p.status === "open").length} açıq məkan</span><span><Trophy size={16}/>{places.filter((p) => p.territory_owner).length} fəth uğrunda</span><span><Zap size={16}/>Xal tapşırıqlar tamamlandıqca hesablanır</span></div>
      <div className={styles.mapWrap}>
        {tilesFailed && <div className={styles.tileNotice} role="status">Xəritə plitələri yüklənmədi. Məkanların siyahısından davam edə bilərsən.</div>}
        <MapContents places={places} onTileError={() => setTilesFailed(true)} userUniversityId={me?.universityId} universityLamps={universityLamps}/>
      </div>
      <div className={styles.listHeading}><div><p>Bu həftənin məkanları</p><h2>Kəşf et və fəth et</h2></div><Compass size={20}/></div>
      {places.length === 0 && <p className={styles.empty}>Bu həftə üçün məkan tapılmadı.</p>}
      <div className={styles.places}>{places.map((place) => <article className={styles.place} key={place.id}>
        <div className={`${styles.placeMark} ${place.status === "locked" ? styles.locked : ""}`}><MapPin size={18}/></div>
        <div className={styles.placeBody}><div className={styles.placeTitle}><h3>{place.name}</h3><span className={place.status === "open" ? styles.open : styles.closed}>{place.status === "open" ? "Açıqdır" : "Bağlıdır"}</span></div><p>{place.district} · {place.task_count} tapşırıq · {place.radius_m} m radius</p>{place.territory_owner ? <TerritorySummary owner={place.territory_owner} universityId={me?.universityId} universityLamp={universityLamps[place.territory_owner?.university_id]} compact/> : <div className={styles.territory}>Bu həftə ərazi xalı hələ qazanılmayıb.</div>}</div>
        <Link className={styles.action} to={`/museums/${place.slug}`}>{place.status === "open" ? "Fəth et" : "Bax"} →</Link>
      </article>)}</div>
    </>}
  </section>;
}
