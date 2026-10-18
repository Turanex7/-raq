import { lazy, Suspense, useState } from "react";
import { ArrowRight, Gem, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import useApiResource from "../../services/useApiResource";
import heroBackdrop from "../../assets/icherisheher-hero.png";
import GameHUD from "./components/GameHUD";
import LandmarkPanel from "./components/LandmarkPanel";
import LanternJourney from "./LanternJourney";
import styles from "./HomePage.module.scss";
import { translate as t } from "../../i18n/i18n";

const AdventureWorld = lazy(() => import("./components/AdventureWorld"));

function MascotTip() {
  return (
    <div className={styles.mascotTip}>
      <span className={styles.mascotMini} aria-hidden="true">✦</span>
      <span><b>{t("Çıraq deyir:")}</b> {t("Qız Qalasına kliklə, ilk izi birlikdə izləyək!")}</span>
    </div>
  );
}

function MissionCards({ apiPlaces, loading, error }) {
  const featured = (Array.isArray(apiPlaces) ? apiPlaces : []).filter((place) => place.type === "museum").slice(0, 3).map((place, index) => ({
    id: place.slug,
    title: t(place.name),
    meta: `${t(place.district)} · ${place.task_count} ${t("tapşırıq")}`,
    accent: "mint",
    status: t(place.status === "open" ? "Açıq" : "Bağlıdır"),
    glyph: ["✦", "◈", "◇"][index],
  }));
  return (
    <section className={styles.missionSection} aria-labelledby="missions-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.sectionEyebrow}>{t("Kəşf ediləsi yerlər")}</p><h2 id="missions-title">{t("Növbəti missiyanı seç")}</h2></div>
        <span className={styles.sectionCount}><Gem size={14} />{apiPlaces ? `${apiPlaces.length} ${t("məkan")}` : t("Məkanlar yüklənir…")}</span>
      </div>
      <div className={styles.missionCards}>
        {error && <p role="alert">{t("Məkanlar yüklənmədi.")}</p>}
        {loading && <p role="status">{t("Məkanlar yüklənir…")}</p>}
        {!loading && !error && featured.length === 0 && <p>{t("Hazırda göstəriləcək məkan yoxdur.")}</p>}
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
  const selectedPlace = Array.isArray(apiPlaces) ? apiPlaces.find((place) => place.slug === selected) : null;

  return (
    <div className={styles.page}>
      <section className={styles.worldHero}>
        <div className={styles.worldCanvas}>
          <img className={styles.sceneBackdrop} src={heroBackdrop} alt={t("İçərişəhər və Qız Qalasından ilhamlanan bədii macəra səhnəsi")} />
          {webglAvailable ? (
            <Suspense fallback={<div className={styles.worldLoading}>{t("Macəra dünyası yüklənir...")}</div>}>
              <AdventureWorld selected={selected} onSelect={setSelected} places={apiPlaces || []} reducedMotion={reducedMotion} />
            </Suspense>
          ) : (
            <div className={styles.webglFallback}><Sparkles size={25} /><h2>{t("Macəra dünyası hazır deyil")}</h2><p>{t("Bu cihazda WebGL dəstəyi yoxdur. Xəritədən kəşfə davam edə bilərsən.")}</p></div>
          )}
        </div>
        <div className={styles.heroOverlay}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}><Sparkles size={14} />{t("Azərbaycanın macəra dünyası")}</p>
            <h1>{t("Azərbaycanı kəşf et.")}<span>{t("Əfsanəni yaşa.")}</span></h1>
            <p>{t("Muzeyləri kəşf et, tarixin sirlərini aç və macəranın qəhrəmanına çevril!")}</p>
            <Link to="/game" className={styles.startAdventure}>{t("Oyuna başla")} <ArrowRight size={17} /></Link>
          </div>
          <GameHUD />
          {selectedPlace && <LandmarkPanel place={selectedPlace} onClose={() => setSelected(null)} />}
          <MascotTip />
        </div>
      </section>
      <LanternJourney />
      <MissionCards apiPlaces={apiPlaces} loading={placesLoading} error={placesError} />
      <p className={styles.illustrationNote}>{t("3D səhnə tarixi məkanlardan ilhamlanan stilizə edilmiş oyun dünyasıdır; tarixi rekonstruksiya deyil.")}</p>
    </div>
  );
}
