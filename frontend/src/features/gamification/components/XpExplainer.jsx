import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X, Zap } from "lucide-react";
import styles from "./XpExplainer.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function XpExplainer({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  return <>
    <button className={`${styles.trigger} ${className}`} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
      {children || <><Info size={15} aria-hidden="true"/>{t("XP necə işləyir?")}</>}
    </button>
    {open && createPortal(<div className={styles.backdrop} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="xp-explainer-title">
        <button ref={closeRef} className={styles.close} type="button" aria-label={t("Pəncərəni bağla")} onClick={() => setOpen(false)}><X size={18}/></button>
        <p className={styles.kicker}><Zap size={14}/>{t("Oyun xalları")}</p>
        <h2 id="xp-explainer-title">{t("XP necə işləyir?")}</h2>
        <ul>
          <li>{t("Tapşırıqları tamamladıqca XP qazanırsan.")}</li>
          <li>{t("Ümumi XP səviyyəni artırır və tarixi avatarları açır.")}</li>
          <li>{t("Həftəlik XP lider cədvəlini və Muzey Fəthini müəyyən edir; hər bazar ertəsi Bakı vaxtı ilə 00:00-da sıfırlanır.")}</li>
          <li>{t("Dəstə bonusu tapşırığın əsas XP-sini artıra bilər.")}</li>
          <li>{t("Biletli məkanlarda tamamlanan tapşırıqlar əlavə XP qazandırır.")}</li>
          <li>{t("XP oyun iştirakını ölçür; onu almaq və nağdlaşdırmaq olmaz.")}</li>
        </ul>
      </section>
    </div>, document.body)}
  </>;
}
