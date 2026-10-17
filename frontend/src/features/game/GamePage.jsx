import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Check, HelpCircle, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Inventory from "./components/Inventory";
import LevelComplete from "./components/LevelComplete";
import QuestHUD from "./components/QuestHUD";
import CarpetMuseumLevel from "./levels/CarpetMuseumLevel";
import LevelSelect from "./levels/LevelSelect";
import { getLevel, LEVEL_IDS } from "./levels/levelRegistry";
import { completeLevel, getGameProgress } from "./state/gameStore";
import { GAME_CONFIG } from "../gamification/gameConfig";
import { addLifetimeXp, useGame } from "../gamification/gameStore";
import styles from "./GamePage.module.scss";

const GameWorld = lazy(() => import("./components/GameWorld"));

const questions = [
  { question: "Qız Qalası hansı şəhərdə yerləşir?", options: ["Bakı", "Gəncə", "Şəki"], answer: 0 },
  { question: "İçərişəhər hansı adla da tanınır?", options: ["Qədim Şəhər", "Küləklər Şəhəri", "Alovlar Şəhəri"], answer: 0 },
  { question: "Azərbaycanın ənənəvi naxışlarından biri hansıdır?", options: ["Buta", "Lotus", "Kelt düyünü"], answer: 0 },
];

function QuizPanel({ onComplete }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const question = questions[questionIndex];
  const answer = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setFeedback(index === question.answer ? "correct" : "wrong");
  };
  const next = () => {
    const nextScore = score + (feedback === "correct" ? 1 : 0);
    if (feedback !== "correct") {
      setQuestionIndex(0); setSelected(null); setScore(0); setFeedback(null); return;
    }
    if (questionIndex === questions.length - 1) { onComplete(nextScore); return; }
    setScore(nextScore); setQuestionIndex(questionIndex + 1); setSelected(null); setFeedback(null);
  };
  return (
    <div className={styles.quizBackdrop}>
      <section className={styles.quizPanel} aria-labelledby="quiz-title">
        <div className={styles.quizTop}><span>Qədim işıq · Sınaq</span><span>{questionIndex + 1} / {questions.length}</span></div>
        <div className={styles.quizProgress}><i style={{ width: (((questionIndex + 1) / questions.length) * 100) + "%" }} /></div>
        <p className={styles.kicker}>Tarixçi izinin sualı</p>
        <h1 id="quiz-title">{question.question}</h1>
        <div className={styles.answerGrid}>{question.options.map((option, index) => <button type="button" key={option} className={selected === index ? (feedback === "correct" ? styles.correct : styles.wrong) : ""} onClick={() => answer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{selected === index && feedback === "correct" && <Check size={17} />}{selected === index && feedback === "wrong" && <X size={17} />}</button>)}</div>
        {feedback && <p className={feedback === "correct" ? styles.feedbackCorrect : styles.feedbackWrong}>{feedback === "correct" ? "Düz cavab! Növbəti izi açdın." : "Bu cavab doğru deyil. Sınağı yenidən başla."}</p>}
        {feedback && <button type="button" className={styles.quizNext} onClick={next}>{feedback === "correct" && questionIndex === questions.length - 1 ? "Mükafatı al" : feedback === "correct" ? "Növbəti sual" : "Yenidən cəhd et"}<span>→</span></button>}
      </section>
    </div>
  );
}

function ControlsHelp({ onClose }) {
  return (
    <div className={styles.helpBackdrop}><section className={styles.helpPanel}><button type="button" onClick={onClose} aria-label="Köməyi bağla"><X size={17} /></button><p className={styles.kicker}><HelpCircle size={14} />İdarəetmə</p><h2>İçərişəhərdə hərəkət et</h2><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Hərəkət</span></div><div><kbd>E</kbd><span>Yaxınlıqdakı artefaktla əlaqə</span></div><p className={styles.muted}>Mobil cihazda ekrandakı idarəetmə düymələrindən istifadə et. Kameranı fırlatmaq üçün səhnəni sürüşdür.</p></section></div>
  );
}

function MobileControls({ onChange }) {
  const hold = (key, value) => (event) => { event.preventDefault(); onChange(key, value); };
  return (
    <div className={styles.mobileControls} aria-label="Mobil hərəkət idarəetməsi">
      <button type="button" onPointerDown={hold("forward", true)} onPointerUp={hold("forward", false)} onPointerLeave={hold("forward", false)}>↑</button>
      <div><button type="button" onPointerDown={hold("left", true)} onPointerUp={hold("left", false)} onPointerLeave={hold("left", false)}>←</button><button type="button" onPointerDown={hold("backward", true)} onPointerUp={hold("backward", false)} onPointerLeave={hold("backward", false)}>↓</button><button type="button" onPointerDown={hold("right", true)} onPointerUp={hold("right", false)} onPointerLeave={hold("right", false)}>→</button></div>
    </div>
  );
}

export default function GamePage() {
  const { levelId } = useParams();
  if (!levelId) return <LevelSelect />;
  if (levelId !== LEVEL_IDS.ICHERISHEHER) return <CarpetMuseumLevel />;
  return <PlayableIcherisheher />;
}

function PlayableIcherisheher() {
  const game = useGame();
  const player = game.users.find((user) => user.id === game.currentUserId);
  const level = getLevel(LEVEL_IDS.ICHERISHEHER);
  const [phase, setPhase] = useState("world");
  const [artifactCollected, setArtifactCollected] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [playerPosition, setPlayerPosition] = useState([0, 0, 4]);
  const [mobileInput, setMobileInput] = useState({ forward: false, backward: false, left: false, right: false });
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const xp = player.xp;
  const [completeXp, setCompleteXp] = useState(GAME_CONFIG.levelRewards.icherisheher);
  const [reducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const handleKey = (event) => { if (event.key === "Escape") setPaused((current) => !current); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const collectArtifact = () => { if (!canInteract || artifactCollected || paused) return; setArtifactCollected(true); setPhase("quiz"); };
  const finishQuiz = (score) => { const alreadyCompleted = getGameProgress().completedLevels.includes(LEVEL_IDS.ICHERISHEHER); const reward = score === questions.length ? GAME_CONFIG.levelRewards.icherisheher : 0; setCompleteXp(reward); completeLevel(LEVEL_IDS.ICHERISHEHER, reward, "maiden-tower-light"); if (!alreadyCompleted) addLifetimeXp(reward); setPhase("complete"); };

  if (phase === "quiz") return <QuizPanel onComplete={finishQuiz} />;
  if (phase === "complete") return <LevelComplete xp={completeXp} artifactName="Qız Qalasının işığı" nextLevelUnlocked />;

  return (
    <section className={styles.gameShell}>
      <div className={styles.worldViewport}>
        <Suspense fallback={<div className={styles.gameLoading}>İçərişəhər səviyyəsi yüklənir...</div>}><GameWorld playerPosition={playerPosition} mobileInput={mobileInput} artifactCollected={artifactCollected} canInteract={canInteract} onNearby={setCanInteract} onPositionChange={setPlayerPosition} onCollect={collectArtifact} isPaused={paused} reducedMotion={reducedMotion} /></Suspense>
        <div className={styles.gameOverlay}>
          <Link to="/game" className={styles.exitGame}><ArrowLeft size={16} />Səviyyələr</Link>
          <QuestHUD level={level} xp={xp} artifactCollected={artifactCollected} canInteract={canInteract} paused={paused} onPause={() => setPaused((current) => !current)} onHelp={() => setShowHelp(true)} />
          <Inventory artifactCollected={artifactCollected} />
          <MobileControls onChange={(key, value) => setMobileInput((current) => ({ ...current, [key]: value }))} />
        </div>
      </div>
      {paused && <div className={styles.pauseOverlay}><div><p className={styles.kicker}>Macəra dayandırıldı</p><h1>Hazırsan?</h1><button type="button" className={styles.resumeButton} onClick={() => setPaused(false)}>Davam et</button></div></div>}
      {showHelp && <ControlsHelp onClose={() => setShowHelp(false)} />}
    </section>
  );
}
