import { ArrowLeft, Lock, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../GamePage.module.scss";

export default function CarpetMuseumLevel() {
  return (
    <section className={styles.levelPreview}>
      <Link to="/game" className={styles.backLink}><ArrowLeft size={16} /> Səviyyə xəritəsinə qayıt</Link>
      <div className={styles.previewArt}><span className={styles.previewOrb}>✦</span><span className={styles.previewPattern}>◇ ◇ ◇</span></div>
      <p className={styles.kicker}><Lock size={14} />Növbəti səviyyə</p>
      <h1>Xalça Muzeyi</h1>
      <p className={styles.previewText}>Naxışların sirri səni gözləyir. Bu məkanın oynanıla bilən səviyyəsi növbəti yeniləmədə açılacaq.</p>
      <div className={styles.previewMeta}><span><Zap size={14} />+320 XP</span><span><Sparkles size={14} />Orta çətinlik</span></div>
      <div className={styles.previewNotice}><Lock size={16} /><span>Bu, hazırda yalnız önizləmədir. İçərişəhər səviyyəsini tamamla.</span></div>
    </section>
  );
}
