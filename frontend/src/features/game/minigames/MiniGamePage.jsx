import { Suspense, useRef, useState } from "react";
import { ArrowLeft, Flame, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiPost } from "../../../services/api";
import useApiResource from "../../../services/useApiResource";
import { miniGameRegistry } from "./miniGameRegistry";
import styles from "./MiniGameShell.module.scss";

function resultStars(score, game) {
  if (score >= game.threeStars) return 3;
  if (score >= game.twoStars) return 2;
  if (score >= game.oneStar) return 1;
  return 0;
}

export default function MiniGamePage() {
  const { placeId } = useParams();
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: user, loading: userLoading } = useApiResource("/me", hasToken);
  const { data: places, loading: placesLoading } = useApiResource("/places");
  const game = miniGameRegistry[placeId];
  const place = Array.isArray(places) ? places.find((item) => item.id === placeId || item.slug === placeId) : null;
  const Game = game?.Component;
  const [screen, setScreen] = useState("intro");
  const [score, setScore] = useState(0);
  const [resultDetails, setResultDetails] = useState(null);
  const [award, setAward] = useState(null);
  const [awardError, setAwardError] = useState("");
  const [awardLoading, setAwardLoading] = useState(false);
  const [run, setRun] = useState(0);
  const finishing = useRef(false);
  const starCount = resultStars(score, game || { oneStar: 1, twoStars: 2, threeStars: 3 });

  async function submitResult(value, earnedStars) {
    setAwardLoading(true);
    setAwardError("");
    try {
      const result = await apiPost(`/places/${encodeURIComponent(place.id)}/minigame/complete`, { score: value, stars: earnedStars });
      setAward(result);
      if (result.awarded) window.dispatchEvent(new Event("chiraq:xp-updated"));
    } catch (error) {
      setAwardError(error.message || "Nəticəni saxlamaq alınmadı.");
    } finally {
      setAwardLoading(false);
    }
  }

  function finishGame(value, details = null) {
    if (finishing.current) return;
    finishing.current = true;
    const safeScore = Math.max(0, Math.floor(Number(value) || 0));
    const earnedStars = resultStars(safeScore, game);
    setScore(safeScore);
    setResultDetails(details);
    setScreen("result");
    if (user && place) void submitResult(safeScore, earnedStars);
  }

  function replay() {
    finishing.current = false;
    setAward(null);
    setAwardError("");
    setScore(0);
    setResultDetails(null);
    setRun((value) => value + 1);
    setScreen("intro");
  }

  if (!game) return <section className={styles.page}><Link className={styles.back} to="/game"><ArrowLeft size={16}/>Xəritəyə qayıt</Link><div className={styles.card}><h1>Bu məkan üçün mini oyun yoxdur</h1><Link className={styles.action} to="/game">Xəritəyə qayıt</Link></div></section>;
  if (placesLoading || (hasToken && userLoading)) return <section className={styles.page}><p className={styles.loading} role="status">Mini oyun yüklənir…</p></section>;
  if (!user) return <section className={styles.page}><Link className={styles.back} to="/game"><ArrowLeft size={16}/>Xəritəyə qayıt</Link><div className={styles.loginPrompt}><Sparkles size={27}/><h1>Mini oyunu başlamaq üçün daxil ol</h1><p>Nəticəni və gündəlik XP limitini hesabında saxlamaq üçün hesabına daxil ol.</p><Link className={styles.action} to="/login">Daxil ol</Link></div></section>;
  if (!place) return <section className={styles.page}><p className={styles.loading} role="status">Məkan tapılmadı.</p><Link className={styles.action} to="/game">Xəritəyə qayıt</Link></section>;

  return <main className={styles.page}>
    <Link className={styles.back} to="/game"><ArrowLeft size={16}/>Xəritəyə qayıt</Link>
    {screen === "intro" && <section className={styles.card}>
      <span className={styles.icon}><Flame size={30}/></span>
      <p className={styles.kicker}>Qısa bacarıq oyunu</p>
      <h1>{game.title}</h1>
      <p className={styles.placeName}>{place.name}</p>
      <p className={styles.instructions}>{game.instructions}</p>
      <div className={styles.meta}><span>{game.durationSeconds} saniyə</span><span>Siçan və toxunma ilə</span><span>Gündəlik XP limiti serverdə yoxlanır</span></div>
      <button className={styles.primary} type="button" onClick={() => setScreen("playing")}>Oyuna başla <span aria-hidden="true">→</span></button>
    </section>}
    {screen === "playing" && <section className={styles.card}>
      <div className={styles.stageTop}><div><p className={styles.kicker}>{place.name}</p><h1>{game.title}</h1></div><span className={styles.timer} aria-live="polite">{game.durationSeconds} san.</span></div>
      <Suspense fallback={<p className={styles.loading} role="status">Oyun səhnəsi hazırlanır…</p>}><Game key={run} durationSeconds={game.durationSeconds} scoreBaseMs={game.scoreBaseMs} onFinish={finishGame}/></Suspense>
    </section>}
    {screen === "result" && <section className={styles.card}>
      <span className={styles.icon}><Trophy size={29}/></span>
      <p className={styles.kicker}>Nəticə</p>
      <h1>{resultDetails?.outcome === "lost" ? "Oyunu uduzdun" : starCount > 0 ? "Yaxşı oynadın!" : "Bir də sına"}</h1>
      <p className={styles.placeName}>{place.name} · {game.title}</p>
      <div className={styles.resultStars} aria-label={`${starCount} ulduz`}>{[1, 2, 3].map((value) => <span className={value <= starCount ? styles.lit : ""} key={value}>★</span>)}</div>
      {game.resultMetric === "completion-time" ? <p className={styles.resultText}>{resultDetails?.outcome === "won" ? `Təmizləmə vaxtı: ${(resultDetails.elapsedMs / 1000).toFixed(2)} saniyə` : resultDetails?.reason === "hazard" ? "Nida işarəli sahəyə toxundun. Yenidən cəhd et." : "Vaxt bitdi. Yenidən cəhd et."}</p> : <p className={styles.resultText}>Nəticə: {score} xal</p>}
      {awardLoading && <p className={styles.award} role="status">Nəticə yoxlanılır…</p>}
      {!awardLoading && award?.awarded && <p className={styles.award} role="status">+{award.xp_awarded} XP qazandın.</p>}
      {!awardLoading && award?.reason === "already_awarded_today" && <p className={styles.award} role="status">Bu gün XP alınıb.</p>}
      {!awardLoading && award?.reason === "daily_limit" && <p className={styles.award} role="status">Bugünkü mini oyun XP həddi dolub.</p>}
      {!awardLoading && award?.reason === "no_star" && resultDetails?.outcome !== "lost" && <p className={styles.resultText}>Bu nəticə XP qazanmaq üçün kifayət etmədi.</p>}
      {awardError && <p className={styles.awardError} role="alert">{awardError}</p>}
      <div className={styles.actions}>
        {awardError && <button className={styles.secondary} type="button" onClick={() => void submitResult(score, starCount)}>Nəticəni yenidən yoxla</button>}
        <button className={styles.primary} type="button" onClick={replay}><RotateCcw size={17}/>{resultDetails?.outcome === "lost" ? "Yenidən cəhd et" : "Yenidən oyna"}</button>
        <Link className={styles.secondary} to="/game">Bağla</Link>
      </div>
    </section>}
  </main>;
}
