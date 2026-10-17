import { Link } from "react-router-dom";
import { Compass, MapPinned, Sparkles, Trophy, Zap } from "lucide-react";
import { useGame } from "../gamification/gameStore";
import { GAME_CONFIG } from "../gamification/gameConfig";
import MuseumMap from "./MuseumMap";
import styles from "./MapPage.module.scss";
import { useMocks } from "../../services/api";
import ApiWeeklyMap from "../gamification/ApiWeeklyMap";

const mockMuseums = [
  { id: "national-history", name: "Milli Tarix Muzeyi", description: "Qədim dövrlərdən bu günə Azərbaycanın zəngin tarixini kəşf et.", location: [40.3697, 49.8352], category: "Tarix", accent: "gold", quests: 2, xp: GAME_CONFIG.xp.museum },
  { id: "carpet-museum", name: "Xalça Muzeyi", description: "Azərbaycanın ən simvolik sənət formalarından birinin hekayəsini dinlə.", location: [40.3657, 49.8366], category: "Mədəniyyət", accent: "mint", quests: 2, xp: GAME_CONFIG.xp.museum },
  { id: "heydar-aliyev", name: "Heydər Əliyev Mərkəzi", description: "Müasir memarlığın və mədəniyyətin axıcı dünyasına daxil ol.", location: [40.3953, 49.8671], category: "Memarlıq", accent: "purple", quests: 2, xp: GAME_CONFIG.xp.museum },
  { id: "modern-art", name: "Müasir İncəsənət Muzeyi", description: "Azərbaycanın müasir rəssamları ilə cəsarətli bir kolleksiyada tanış ol.", location: [40.3805, 49.8545], category: "İncəsənət", accent: "green", quests: 2, xp: GAME_CONFIG.xp.museum },
];

export default function MapPage() {
  const game = useGame();
  const user = game.users.find((item) => item.id === game.currentUserId);
  if (!useMocks) return <ApiWeeklyMap/>;
  // API hazır olduqda bu lokal mənbə servis çağırışı ilə əvəz olunacaq.
  const museums = mockMuseums;
  const status = "ready";

  return (
    <section className={styles.page}>
      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" />Kəşf xəritəsi</p>
          <h1>Bakı macərası</h1>
          <p className={styles.subtitle}>Xəritədə bir iz seç, muzeyə get və şəhərin gizli hekayəsini aç.</p>
        </div>
        <div className={styles.locationBadge}><MapPinned size={16} aria-hidden="true" /><span>Bakı, Azərbaycan</span></div>
      </header>

      <div className={styles.progressStrip}>
        <div><span className={styles.stripIcon}><Zap size={16} /></span><span><b>{user.xp.toLocaleString("az-AZ")} XP</b><small>Sənin xəzinən</small></span></div>
        <div><span className={styles.stripIcon}><Trophy size={16} /></span><span><b>{game.completed.length} / {game.pins.length}</b><small>Tamamlanan pin</small></span></div>
        <div><span className={styles.stripIcon}><Compass size={16} /></span><span><b>{Math.max(0, game.pins.length - game.completed.length)}</b><small>Qalan pin</small></span></div>
      </div>

      <div className={styles.mapShell}>
        {status === "loading" && <div className={styles.state} role="status"><Compass className={styles.spin} size={25} aria-hidden="true" /><span>Xəritə hazırlanır...</span></div>}
        {status === "error" && <div className={styles.state} role="alert"><span>Muzey xəritəsini yükləmək mümkün olmadı.</span><button type="button" onClick={() => window.location.reload()}>Yenidən yoxla</button></div>}
        {status === "ready" && <MuseumMap museums={museums} />}
        <div className={styles.mapLegend}><span className={styles.legendPin}>✦</span><span>Muzey macərası</span><span className={styles.legendMe} /> <span>Sən buradasan</span></div>
      </div>

      <div className={styles.missionHeading}><div><p className={styles.eyebrow}>Yaxınlıqdakı izlər</p><h2>Macəra seç</h2></div><span>{museums.length} məkan</span></div>
      <div className={styles.missionRail}>
        {museums.map((museum) => (
          <Link to={`/museums/${museum.id}`} className={styles.missionCard} key={museum.id}>
            <div className={styles.missionArt + " " + styles[museum.accent]}><span>✦</span><small>{museum.category}</small></div>
            <div className={styles.missionCopy}><h3>{museum.name}</h3><p>{museum.quests} tapşırıq · <strong>+{museum.xp} XP</strong></p></div>
            <span className={styles.statusDot} title="Macəra açıqdır" />
          </Link>
        ))}
      </div>
      <p className={styles.mapNote}><span className={styles.noteDot} aria-hidden="true" />Koordinatlar API inteqrasiyasına qədər demo məlumatıdır.</p>
    </section>
  );
}
