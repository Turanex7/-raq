import { lazy, Suspense, useState } from "react";
import { ArrowRight, Gem, MapPin, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import useApiResource from "../../services/useApiResource";
import { useMocks } from "../../services/api";
import { GAME_CONFIG } from "../gamification/gameConfig";
import heroBackdrop from "../../assets/icherisheher-hero.png";
import GameHUD from "./components/GameHUD";
import LandmarkPanel from "./components/LandmarkPanel";
import styles from "./HomePage.module.scss";

const AdventureWorld = lazy(() => import("./components/AdventureWorld"));

const missions = [
  { id: "carpet-museum", title: "Xalça Muzeyi", meta: "Bulvar · 2 tapşırıq", xp: `+${GAME_CONFIG.xp.museum} XP`, accent: "mint", status: "Açıqdır", glyph: "✦" },
  { id: "national-history", title: "Milli Tarix Muzeyi", meta: "Bakı · 2 tapşırıq", xp: `+${GAME_CONFIG.xp.museum} XP`, accent: "gold", status: "Açıqdır", glyph: "◈" },
  { id: "heydar-aliyev", title: "Heydər Əliyev Mərkəzi", meta: "Nərimanov · 2 tapşırıq", xp: `+${GAME_CONFIG.xp.museum} XP`, accent: "purple", status: "Açıqdır", glyph: "◇" },
];

function MascotTip() {
  return (
    <div className={styles.mascotTip}>
      <span className={styles.mascotMini} aria-hidden="true">✦</span>
      <span><b>Çıraq deyir:</b> Qız Qalasına kliklə, ilk izi birlikdə izləyək!</span>
    </div>
  );
}

function MissionCards({ apiPlaces, loading, error }) {
  const featured = useMocks ? missions : (apiPlaces || []).filter((place) => place.type === "museum").slice(0, 3).map((place) => ({
    id: place.slug,
    title: place.name,
    meta: `${place.district} · ${place.task_count} tapşırıq`,
    xp: `${place.xp_total} XP`,
    accent: "mint",
    status: place.status === "open" ? "Açıqdır" : "Bağlıdır",
    glyph: "✦",
  }));
  return (
    <section className={styles.missionSection} aria-labelledby="missions-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.sectionEyebrow}>Kəşf ediləsi yerlər</p><h2 id="missions-title">Növbəti missiyanı seç</h2></div>
        <span className={styles.sectionCount}><Gem size={14} />{useMocks ? "3 məkan" : `${apiPlaces?.length ?? "…"} məkan`}</span>
      </div>
      <div className={styles.missionCards}>
        {error && <p role="alert">Məkanlar yüklənmədi.</p>}
        {loading && <p role="status">Məkanlar yüklənir…</p>}
        {featured.map((mission) => (
          <Link to={`/museums/${mission.id}`} className={styles.missionCard} key={mission.title}>
            <div className={styles.missionVisual + " " + styles[mission.accent]}><span>{mission.glyph}</span><MapPin size={15} /></div>
            <div className={styles.missionDetails}><span className={styles.missionStatus}><i />{mission.status}</span><h3>{mission.title}</h3><p>{mission.meta}</p></div>
            <div className={styles.missionReward}><Zap size={13} />{mission.xp}</div>
            <span className={styles.missionArrow} aria-hidden="true"><ArrowRight size={17} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [selected, setSelected] = useState("maiden-tower");
  const { data: apiPlaces, loading: placesLoading, error: placesError } = useApiResource("/places", !useMocks);
  const [webglAvailable] = useState(() => {
    try {
      if (typeof document === "undefined") return true;
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  });
  const [reducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <div className={styles.page}>
      <section className={styles.worldHero}>
        <div className={styles.worldCanvas}>
          <img className={styles.sceneBackdrop} src={heroBackdrop} alt="İçərişəhər və Qız Qalasından ilhamlanan bədii macəra səhnəsi" />
          {webglAvailable ? (
            <Suspense fallback={<div className={styles.worldLoading}>Macəra dünyası yüklənir...</div>}>
              <AdventureWorld selected={selected} onSelect={setSelected} reducedMotion={reducedMotion} />
            </Suspense>
          ) : (
            <div className={styles.webglFallback}><Sparkles size={25} /><h2>Macəra dünyası hazır deyil</h2><p>Bu cihazda WebGL dəstəyi yoxdur. Xəritədən kəşfə davam edə bilərsən.</p></div>
          )}
        </div>
        <div className={styles.heroOverlay}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}><Sparkles size={14} />Azərbaycanın macəra dünyası</p>
            <h1>Azərbaycanı kəşf et.<span>Əfsanəni yaşa.</span></h1>
            <p>Muzeyləri kəşf et, tarixin sirlərini aç və macəranın qəhrəmanına çevril!</p>
            <Link to="/game" className={styles.startAdventure}>Oyuna başla <ArrowRight size={17} /></Link>
          </div>
          <GameHUD />
          <LandmarkPanel landmarkId={selected} places={apiPlaces} onClose={() => setSelected(null)} />
          <MascotTip />
        </div>
      </section>
      <MissionCards apiPlaces={apiPlaces} loading={placesLoading} error={placesError} />
      <p className={styles.illustrationNote}>3D səhnə tarixi məkanlardan ilhamlanan stilizə edilmiş oyun dünyasıdır; tarixi rekonstruksiya deyil.</p>
    </div>
  );
}
