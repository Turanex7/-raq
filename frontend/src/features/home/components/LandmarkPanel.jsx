import { ArrowRight, MapPin, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../HomePage.module.scss";

const landmarks = {
  "maiden-tower": {
    kicker: "Əsas məkan · İçərişəhər",
    title: "Qız Qalası",
    description: "Bakı gecəsinin üzərində duran əfsanəni kəşf et. Qüllənin daşları sənə çoxdan unudulmuş bir hekayə danışır.",
    quests: "3 tapşırıq",
    xp: "+250 XP",
    action: "Məkanı kəşf et",
    href: "/museums/national-history",
  },
  "carpet-museum": {
    kicker: "Yeni iz · Xalça Muzeyi",
    title: "Naxışların sirri",
    description: "Rənglərin və simvolların arasında gizlənən ilk izi tap.",
    quests: "2 tapşırıq",
    xp: "+180 XP",
    action: "Tapşırığa başla",
    href: "/museums/carpet-museum",
  },
  history: {
    kicker: "Yeni iz · Milli Tarix Muzeyi",
    title: "Zamanın izləri",
    description: "Keçmişin səsini dinlə və tarixdən qalan parçaları birləşdir.",
    quests: "5 tapşırıq",
    xp: "+250 XP",
    action: "Məkanı kəşf et",
    href: "/museums/national-history",
  },
};

export default function LandmarkPanel({ landmarkId, onClose }) {
  const landmark = landmarks[landmarkId] ?? landmarks["maiden-tower"];
  return (
    <aside className={styles.landmarkPanel} aria-live="polite">
      <button className={styles.closePanel} type="button" onClick={onClose} aria-label="Paneli bağla"><X size={16} /></button>
      <div className={styles.panelKicker}><Sparkles size={13} />{landmark.kicker}</div>
      <h2>{landmark.title}</h2>
      <p>{landmark.description}</p>
      <div className={styles.panelMeta}>
        <span><MapPin size={13} />Bakı, Azərbaycan</span>
        <span><ShieldCheck size={13} />{landmark.quests}</span>
        <span className={styles.panelXp}><Zap size={13} />{landmark.xp}</span>
      </div>
      <Link to={landmark.href} className={styles.panelAction}>{landmark.action}<ArrowRight size={16} /></Link>
    </aside>
  );
}
