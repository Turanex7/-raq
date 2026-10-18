import { useEffect, useState } from "react";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { apiPost } from "../../services/api";
import useApiResource from "../../services/useApiResource";
import { celebrateLantern, getLanternSoundEnabled, playLanternChime, setLanternSoundEnabled } from "./lanternEffects";
import styles from "./LanternJourney.module.scss";

export default function LanternJourney() {
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: user, loading, error, retry, setData } = useApiResource("/me", hasToken);
  const { data: config } = useApiResource("/config");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(getLanternSoundEnabled);
  const lantern = user?.lantern;
  const target = config?.daily_lantern?.streak_days ?? lantern?.streak_target ?? 0;
  const milestoneXp = config?.daily_lantern?.milestone_xp ?? lantern?.milestone_xp;
  const progress = lantern?.progress_day ?? 0;

  useEffect(() => {
    if (!hasToken) return undefined;
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") retry();
    };
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [hasToken, retry]);

  async function ignite() {
    if (busy || lantern?.today_lit) return;
    setBusy(true);
    setNotice("");
    setActionError("");
    try {
      const result = await apiPost("/lantern/ignite", {});
      setData({ ...user, lifetimeXp: result.new_total, weeklyXp: result.weekly_total, lantern: result.lantern });
      if (result.already_lit_today) {
        setNotice("Bu günün alovu artıq yanıb.");
      } else {
        celebrateLantern();
        if (result.xp_awarded > 0) {
          window.dispatchEvent(new Event("chiraq:xp-updated"));
          setNotice(`Yeddi günlük seriya tamamlandı: +${result.xp_awarded} XP.`);
        } else if (result.streak_reset) {
          setNotice("Gün buraxıldığı üçün əvvəlki seriya söndü. Yeni seriya başladı.");
        } else {
          setNotice(`Alov yandı. Ardıcıl gün: ${result.lantern.streak_days}.`);
        }
      }
    } catch (cause) {
      setActionError(cause.message || "Alovu yandırmaq mümkün olmadı.");
    } finally {
      setBusy(false);
    }
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setLanternSoundEnabled(next);
    if (next) playLanternChime();
  }

  return <section className={styles.lanternJourney} aria-labelledby="lantern-title">
    <div className={styles.lanternIntro}>
      <span className={styles.lanternIcon} aria-hidden="true"><Flame size={24} fill="currentColor"/></span>
      <div>
        <p className={styles.sectionEyebrow}>Gündəlik çıraq</p>
        <h2 id="lantern-title">Alovu yandır</h2>
        <p>Hər gün bir dəfə yandır, ardıcıl gün seriyanı qoru.</p>
      </div>
      <button type="button" className={styles.soundToggle} aria-pressed={soundEnabled} onClick={toggleSound}>
        {soundEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}Səs {soundEnabled ? "açıqdır" : "bağlıdır"}
      </button>
    </div>
    {!hasToken ? <div className={styles.lanternState}><p>Gündəlik seriyanı başlamaq üçün hesabına daxil ol.</p><Link to="/login" className={styles.loginAction}>Daxil ol</Link></div>
      : loading ? <p role="status" className={styles.lanternState}>Gündəlik çıraq yüklənir…</p>
      : error || !user ? <div className={styles.lanternState}><p role="alert">{error || "Hesab məlumatı əlçatan deyil."}</p><button type="button" className={styles.loginAction} onClick={retry}>Yenidən yoxla</button></div>
      : <div className={styles.lanternGame}>
        <div className={styles.progressBlock}>
          <div className={styles.progressLabel}><b>Seriya</b><span>{lantern?.streak_days ?? 0} gün ardıcıl</span></div>
          <div className={styles.lanternProgress} aria-label={`Növbəti mükafata irəliləyiş: ${progress}/${target}`}>
            {Array.from({ length: target }, (_, index) => <span key={index} className={index < progress ? styles.flameOn : styles.flameOff}><Flame size={19} fill="currentColor"/></span>)}
            <b>{progress}/{target}</b>
          </div>
          <p className={styles.rewardRule}>{target && milestoneXp != null ? `Hər ${target} ardıcıl günə +${milestoneXp} XP` : "Mükafat qaydası yüklənir…"}</p>
        </div>
        <div className={styles.lanternActionArea}>
          {lantern?.today_lit ? <p className={styles.todayDone}>Bu gün alovunu yandırmısan. Seriyan sabah davam edə bilər.</p>
            : <>
              {lantern?.missed_day && <p className={styles.resetNote}>Bir günü buraxdığın üçün seriya sönüb. Bu gün yenidən başla.</p>}
              <button type="button" className={`${styles.igniteButton} ${busy ? styles.igniting : ""}`} onClick={ignite} disabled={busy}>
                <Flame size={20} fill="currentColor"/>{busy ? "Yandırılır…" : "Bu gün alovu yandır"}
              </button>
            </>}
          {notice && <p role="status" className={styles.notice}>{notice}</p>}
          {actionError && <p role="alert" className={styles.error}>{actionError}</p>}
        </div>
      </div>}
  </section>;
}
