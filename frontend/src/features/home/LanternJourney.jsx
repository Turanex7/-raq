import { useEffect, useMemo, useState } from "react";
import { Flame, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import useApiResource from "../../services/useApiResource";
import styles from "./LanternJourney.module.scss";

const answerPattern = [1, 3, 2];

export default function LanternJourney({ places }) {
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: user, loading: userLoading } = useApiResource("/me", hasToken);
  const { data: config } = useApiResource("/config");
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [notice, setNotice] = useState("");
  const target = useMemo(() => places?.find((place) => place.type === "museum" && place.status === "open"), [places]);

  useEffect(() => {
    if (!started) return undefined;
    if (remaining <= 0) {
      setStarted(false);
      setStep(0);
      setNotice("Vaxt bitdi. Hazır olanda yenidən başla.");
      return undefined;
    }
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, remaining]);

  function startPuzzle() {
    setRemaining(60);
    setStep(0);
    setNotice("");
    setUnlocked(false);
    setStarted(true);
  }

  function tapPoint(value) {
    if (!started || !target) return;
    if (value !== answerPattern[step]) {
      setStep(0);
      setNotice("Nöqtələrin sırasını yenidən yoxla.");
      return;
    }
    const next = step + 1;
    if (next === answerPattern.length) {
      setStarted(false);
      setUnlocked(true);
      setNotice("");
      return;
    }
    setStep(next);
    setNotice("");
  }

  return <section className={styles.lanternJourney} aria-labelledby="lantern-title">
    <div className={styles.lanternIntro}>
      <span className={styles.lanternIcon} aria-hidden="true"><Flame size={22}/></span>
      <div><p className={styles.sectionEyebrow}>Çırağı yandır · {config?.story_chapter?.title || "Hekayə bölməsi"}</p><h2 id="lantern-title">Bir ipucu qazan</h2><p>Qısa tapmacanı tamamla, sonra eksponata baxmaq üçün muzeyə yollan.</p></div>
    </div>
    {!hasToken ? <div className={styles.lanternState}><p>İpucu açmaq və çıraq irəliləyişini görmək üçün hesaba daxil ol.</p><Link to="/login" className={styles.lanternAction}>Daxil ol</Link></div>
      : userLoading ? <p role="status" className={styles.lanternState}>Çıraq yüklənir…</p>
      : !user ? <div className={styles.lanternState}><p>Hesab məlumatı əlçatan deyil.</p><Link to="/login" className={styles.lanternAction}>Daxil ol</Link></div>
      : <>
        <div className={styles.lanternProgress} aria-label={`Çıraq ${user.lantern?.lit ?? 1}/${user.lantern?.total ?? 5} alovla işıqlanıb`}>
          {Array.from({ length: user.lantern?.total ?? 5 }, (_, index) => <span key={index} className={index < (user.lantern?.lit ?? 1) ? styles.flameOn : styles.flameOff}><Flame size={17} fill="currentColor"/></span>)}
          <b>{user.lantern?.lit ?? 1}/{user.lantern?.total ?? 5}</b>
        </div>
        {!unlocked && !started && <div className={styles.lanternState}><p>{config?.story_chapter?.puzzle_hint || "Qaranlıqda parlayan nöqtəni tap və toxun."}</p><p className={styles.puzzleNote}>Bu tapmaca XP vermir; XP muzey tapşırıqlarından qazanılır.</p><button type="button" className={styles.lanternAction} onClick={startPuzzle} disabled={!target}>Tapmacaya başla</button>{!target && <small>Hazırda açıq muzey tapılmır.</small>}</div>}
        {started && <div className={styles.puzzleBox}><div className={styles.puzzleHeader}><span><Sparkles size={15}/>İpucu tapmacası</span><b>{remaining} san.</b></div><p>{config?.story_chapter?.puzzle_hint || "Qaranlıqda parlayan nöqtəni tap və toxun."}</p><div className={styles.puzzleSequence} aria-label="Nöqtələrin sırası: 1, 3, 2"><span>1</span><i>→</i><span>3</span><i>→</i><span>2</span></div><div className={styles.puzzlePoints} aria-label="Parlayan nöqtəni seç">{[1, 2, 3].map((point) => <button type="button" key={point} aria-label={`Nöqtə ${point}`} onClick={() => tapPoint(point)}><span aria-hidden="true">✦</span></button>)}</div><small>{step}/3</small>{notice && <p role="status">{notice}</p>}</div>}
        {unlocked && target && <div className={styles.clueCard}><p><LockKeyhole size={15}/>İpucu kartı açıldı</p><span>{config?.story_chapter?.clue || "Eksponata diqqətlə bax, sonra yaxınlıqdakı QR işarəsini skan et."}</span><Link to={`/museums/${encodeURIComponent(target.slug)}?chapter=lantern`} className={styles.lanternAction}>İpucunu götür</Link></div>}
        {notice && !started && !unlocked && <p role="status" className={styles.puzzleNotice}>{notice}</p>}
      </>}
  </section>;
}
