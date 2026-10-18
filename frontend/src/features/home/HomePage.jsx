import { lazy, Suspense, useState } from "react";
import { ArrowRight, Gem, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import useApiResource from "../../services/useApiResource";
import heroBackdrop from "../../assets/icherisheher-hero.png";
import GameHUD from "./components/GameHUD";
import LandmarkPanel from "./components/LandmarkPanel";
import LanternJourney from "./LanternJourney";
import styles from "./HomePage.module.scss";

const AdventureWorld = lazy(() => import("./components/AdventureWorld"));

function MascotTip() {
  return (
    <div className={styles.mascotTip}>
      <span className={styles.mascotMini} aria-hidden="true">✦</span>
      <span><b>Çıraq deyir:</b> Qız Qalasına kliklə, ilk izi birlikdə izləyək!</span>
    </div>
  );
}

function MissionCards({ apiPlaces, loading, error }) {
  const featured = (apiPlaces || []).filter((place) => place.type === "museum").slice(0, 3).map((place, index) => ({
    id: place.slug,
    title: place.name,
    meta: `${place.district} · ${place.task_count} tapşırıq`,
    accent: "mint",
    status: place.status === "open" ? "Açıqdır" : "Bağlıdır",
    glyph: ["✦", "◈", "◇"][index],
  }));
  return (
    <section className={styles.missionSection} aria-labelledby="missions-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.sectionEyebrow}>Kəşf ediləsi yerlər</p><h2 id="missions-title">Növbəti missiyanı seç</h2></div>
        <span className={styles.sectionCount}><Gem size={14} />{apiPlaces ? `${apiPlaces.length} məkan` : "Məkanlar yüklənir…"}</span>
      </div>
      <div className={styles.missionCards}>
        {error && <p role="alert">Məkanlar yüklənmədi.</p>}
        {loading && <p role="status">Məkanlar yüklənir…</p>}
        {!loading && !error && featured.length === 0 && <p>Hazırda göstəriləcək məkan yoxdur.</p>}
        {featured.map((mission) => (
          <Link to={`/museums/${mission.id}`} className={styles.missionCard} key={mission.title}>
            <div className={styles.missionVisual + " " + styles[mission.accent]}><span>{mission.glyph}</span><MapPin size={15} /></div>
            <div className={styles.missionDetails}><span className={styles.missionStatus}><i />{mission.status}</span><h3>{mission.title}</h3><p>{mission.meta}</p></div>
            <span className={styles.missionArrow} aria-hidden="true"><ArrowRight size={17} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [selected, setSelected] = useState(null);
  const { data: apiPlaces, loading: placesLoading, error: placesError } = useApiResource("/places");
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
  const selectedPlace = apiPlaces?.find((place) => place.slug === selected);

  return (
    <div className={styles.page}>
      <section className={styles.worldHero}>
        <div className={styles.worldCanvas}>
          <img className={styles.sceneBackdrop} src={heroBackdrop} alt="İçərişəhər və Qız Qalasından ilhamlanan bədii macəra səhnəsi" />
          {webglAvailable ? (
            <Suspense fallback={<div className={styles.worldLoading}>Macəra dünyası yüklənir...</div>}>
              <AdventureWorld selected={selected} onSelect={setSelected} places={apiPlaces || []} reducedMotion={reducedMotion} />
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
          {selectedPlace && <LandmarkPanel place={selectedPlace} onClose={() => setSelected(null)} />}
          <MascotTip />
        </div>
      </section>
      <LanternJourney />
      <MissionCards apiPlaces={apiPlaces} loading={placesLoading} error={placesError} />
      <p className={styles.illustrationNote}>3D səhnə tarixi məkanlardan ilhamlanan stilizə edilmiş oyun dünyasıdır; tarixi rekonstruksiya deyil.</p>
    </div>
  );
}
