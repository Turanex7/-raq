import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import useApiResource from "../../../services/useApiResource";
import { levelRegistry } from "./levelRegistry";
import styles from "../GamePage.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function CarpetMuseumLevel({ levelId }) {
  const { data: places, loading } = useApiResource("/places");
  const level = levelRegistry.find((item) => item.id === levelId) || levelRegistry[1];
  const place = places?.find((item) => item.slug === level.placeSlug);
  return (
    <section className={styles.levelPreview}>
      <Link to="/game" className={styles.backLink}><ArrowLeft size={16} /> {t("Səviyyə xəritəsinə qayıt")}</Link>
      <div className={styles.previewArt}><span className={styles.previewOrb}>✦</span><span className={styles.previewPattern}>◇ ◇ ◇</span></div>
      <p className={styles.kicker}><Lock size={14} />{t(place?.status === "open" ? "Açıq məkan" : loading ? "Məkan yüklənir…" : "Bağlı məkan")}</p>
      <h1>{t(place?.name || "Məkan məlumatı əlçatan deyil")}</h1>
      <p className={styles.previewText}>{t(place?.description || "Məkan məlumatı yükləndikdən sonra burada görünəcək.")}</p>
      <div className={styles.previewMeta}><span><Sparkles size={14} />{t(level.difficulty)}</span></div>
      <div className={styles.previewNotice}><Lock size={16} /><span>{t("Bu səviyyənin oynanıla bilən hissəsi hazırda önizləmədir.")}</span></div>
    </section>
  );
}
