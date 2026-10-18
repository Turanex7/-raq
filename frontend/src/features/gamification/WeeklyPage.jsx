import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Check, Clock3, Info, MapPin, QrCode, Sparkles, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useMocks } from "../../services/api";
import ApiWeeklyMap from "./ApiWeeklyMap";
import { GAME_CONFIG, NEXT_WEEK_AREA } from "./gameConfig";
import { awardPin, closePin, jumpWeekEnd, openPin, recordQuiz, setDemo, triggerCoop, useGame } from "./gameStore";
import styles from "./WeeklyPage.module.scss";

const kind = { popular: "Populyar", museum: "Muzey", rare: "Nadir" };
const safe = "Yol kənarında diqqətli ol, çəkilişi qadağan olan yerlərdə şəkil çəkmə.";
function rareStatus(now) {
  const day = now.getDay(); const hour = now.getHours();
  const weekend = GAME_CONFIG.rareDays.includes(day);
  const open = weekend && hour >= GAME_CONFIG.rareOpening.startHour && hour < GAME_CONFIG.rareOpening.endHour;
  return { open, reason: !weekend ? "Yalnız şənbə və bazar" : `Ziyarət saatı ${GAME_CONFIG.rareOpening.startHour}:00–${GAME_CONFIG.rareOpening.endHour}:00` };
}
function pinClosingCountdown(now) {
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + ((GAME_CONFIG.daysPerWeek - now.getDay()) % GAME_CONFIG.daysPerWeek));
  deadline.setHours(23, 59, 0, 0);
  const hoursLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 3_600_000));
  if (!hoursLeft) return "Bağlanıb";
  const days = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;
  return `${days ? `${days} gün ` : ""}${hours} saat`;
}

export default function WeeklyPage() {
  const game = useGame();
  const [answer, setAnswer] = useState("");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") setDemo({ demoOpen: true });
    const pinId = params.get("pin");
    if (game.pins.some((item) => item.id === pinId)) openPin(pinId);
  }, [game.pins]);
  const user = game.users.find((item) => item.id === game.currentUserId);
  const pin = game.pins.find((item) => item.id === game.modalPinId);
  const qrDone = useCallback(() => { if (pin) { awardPin(pin); setStep(3); } }, [pin, setStep]);
  const completed = new Set(game.completed.map((item) => item.pinId));
  const streak = useMemo(() => {
    const days = new Set(game.completed.map((item) => item.day)); let count = 0;
    let day = (game.now.getDay() + GAME_CONFIG.daysPerWeek - 1) % GAME_CONFIG.daysPerWeek;
    while (days.has((day - count + GAME_CONFIG.daysPerWeek) % GAME_CONFIG.daysPerWeek) && count < GAME_CONFIG.daysPerWeek) count += 1;
    return Math.min(count, GAME_CONFIG.streak.capDays);
  }, [game.completed, game.now]);
  const visibleStreak = game.streakOverride ?? streak;
  if (!useMocks) return <ApiWeeklyMap />;

  return <section className={styles.page}>
    <header className={styles.hero}><div><p className={styles.eyebrow}><Sparkles size={15}/>Həftəlik Pin Xəritəsi</p><h1>Bu həftə Bakını kəşf et</h1><p>{game.weekLabel} · {game.weekTheme}</p></div><span className={styles.avatar}>🧭</span></header>
    <Link className={styles.placesLink} to="/places">Muzey və məkanların xəritəsinə bax →</Link>
    <div className={styles.summary}><div><b>{game.completed.length} / {game.pins.length}</b><small>tamamlanan pin</small></div><div><b>{(user.weeklyXp || 0).toLocaleString("az-AZ")} XP</b><small>bu həftə qazanılan</small></div><div className={styles.streak} title={`Ardıcıl hər aktiv gün həmin günün XP-sinə +5%, maksimum +25%. Gün buraxılsa bonus sayğacı sıfırlanır; XP saxlanır.`}>🔥 {visibleStreak} gün <Info size={13}/></div></div>
    <div className={styles.notice}><Clock3 size={17}/><span>Pinlər bazar günü 23:59-da bağlanır. Qalan vaxt: <b>{pinClosingCountdown(game.now)}</b>. Bu həftəni öz tempində kəşf et.</span></div>
    <div className={styles.map}>
      <div className={styles.mapLabel}><MapPin size={14}/> Bakı · bu həftənin izləri</div>
      {game.pins.map((item, index) => { const available = item.type !== "rare" || rareStatus(game.now).open; return <button key={item.id} type="button" title={item.name} disabled={!available || completed.has(item.id)} className={`${styles.pin} ${styles[item.type]} ${completed.has(item.id) ? styles.done : ""}`} style={{ left: `${9 + (index * 17) % 79}%`, top: `${18 + (index * 31) % 62}%` }} onClick={() => { if (!completed.has(item.id) && available) { openPin(item.id); setStep(0); setAnswer(""); } }} aria-label={`${item.name}, ${kind[item.type]}`}>{completed.has(item.id) ? <Check size={17}/> : item.art}</button>; })}
      <div className={styles.mapHint}>Hər pinin radiusu ayrıdır: 30–80 m</div>
    </div>
    <div className={styles.next}><span>🗺️</span><div><small>Gələn həftənin ərazisi</small><b>{NEXT_WEEK_AREA}</b></div><span className={styles.nextTag}>Tezliklə</span></div>
    <div className={styles.multiplier}><Zap size={16}/><span>Keçən həftənin {game.multiplierRank === 1 ? "1-ci universiteti" : game.multiplierRank === 2 ? "2-ci universiteti" : "digər universiteti"}: <b>×{(GAME_CONFIG.universityMultipliers[game.multiplierRank - 1] || 1).toFixed(2)}</b></span></div>
    <div className={styles.pinList}><h2>Bu həftənin pinləri</h2>{game.pins.map((item) => { const rare = item.type === "rare" ? rareStatus(game.now) : { open: true }; return <button type="button" key={item.id} disabled={completed.has(item.id) || !rare.open} className={styles.pinRow} onClick={() => { if (!completed.has(item.id) && rare.open) { openPin(item.id); setStep(0); setAnswer(""); } }}><span className={`${styles.rowArt} ${styles[item.type]}`}>{item.art}</span><span className={styles.rowInfo}><b>{item.name}</b><small>{kind[item.type]} · {item.radiusMeters} m radius</small></span><span className={styles.rowState}>{completed.has(item.id) ? "Tamamlandı" : item.type === "rare" ? rare.open ? "Açıq" : `Bağlıdır · ${rare.reason}` : `+${GAME_CONFIG.xp[item.type]} XP`}</span></button>; })}</div>
    <p className={styles.safety}>ⓘ {safe}</p>

    {game.demoOpen && <DemoPanel game={game} onQrScan={() => { const museum = game.pins.find((item) => item.type === "museum"); if (museum) { openPin(museum.id); awardPin(museum); setStep(3); setAnswer(""); setDemo({ qrScanned: true, gpsId: museum.id }); } }}/>} 
    {pin && <div className={styles.backdrop} role="presentation" onClick={closePin}><div className={styles.modal} role="dialog" aria-modal="true" aria-label={pin.name} onClick={(event) => event.stopPropagation()}><button className={styles.close} type="button" onClick={closePin}><X size={20}/></button><p className={styles.eyebrow}>{kind[pin.type]} · {pin.radiusMeters} m radius</p><h2>{pin.name}</h2><p className={styles.safety}>{safe}</p>
      {step === 0 && <><p className={styles.modalText}>{pin.type === "museum" ? "Eksponatın yanındakı QR kodu oxut." : pin.type === "rare" ? "Məkana yaxın olduğunu GPS ilə təsdiqlə. Gəlişdə göstərilən kodu foto ilə göndər." : "Pin radiusuna daxil ol, sonra tətbiq kamerası ilə foto çək."}</p>{pin.type === "rare" && <div className={styles.code}>KOD <b>{GAME_CONFIG.rareVerificationCode}</b></div>}<div className={styles.flowStep}>{pin.type === "museum" ? <QrCode/> : <MapPin/>}<span>{pin.type === "museum" ? "QR skanı" : `GPS · ${pin.radiusMeters} m`}</span></div><button className={styles.primary} type="button" onClick={() => { const near = game.gpsId === pin.id; if (pin.type !== "museum" && !near) { setStep(-1); return; } setStep(pin.type === "museum" ? -2 : 1); }}>{pin.type === "museum" ? "QR skan et" : "Yaxınlığı yoxla"}</button></>}
      {step === -1 && <><p className={styles.modalText}>Sən bu pinin radiusundan kənardasan. Demo paneldən GPS-i pinə köçürə bilərsən.</p><button className={styles.primary} type="button" onClick={() => setDemo({ gpsId: pin.id })}>Demo GPS-i pinə köçür</button><button className={styles.secondary} type="button" onClick={() => setStep(0)}>Geri</button></>}
      {step === -2 && <QrScanner onScanned={qrDone} />}
      {step === 1 && <><p className={styles.modalText}>{pin.type === "rare" ? game.teleportFlag ? "Qeyri-adi yer dəyişikliyi aşkarlandı. Təqdimat üçün yoxlama simulyasiya edilir." : "Məkan təsdiqləndi. İndi kod görünən foto çək." : "GPS təsdiqləndi. Qalereyadan seçim mümkün deyil; yalnız kamera istifadə olunur."}</p><CameraCapture onCaptured={() => setStep(2)} rare={pin.type === "rare"}/></>}
      {step === 2 && <><p className={styles.modalText}>{pin.type === "rare" ? "Foto kodu göstərir. Saxta GPS mövqeyi yoxlaması başladı." : "Foto çəkildi. Yoxlama uğurlu oldu."}</p><button className={styles.primary} type="button" onClick={() => { awardPin(pin); setStep(3); }}>{pin.type === "rare" ? "Təsdiqlənir" : "Hekayəyə keç"}</button>{pin.type === "rare" && <small className={styles.serverNote}>Canlı versiyada bu yoxlamalar serverdə təsdiqlənir.</small>}</>}
      {step === 3 && <><div className={styles.storyArt}>{pin.art}</div><p className={styles.modalText}>{pin.story}</p><div className={styles.quiz}><b>{pin.quiz}</b><input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Cavabını yaz"/><small>Düzgün cavab reytinqdə bərabərlik zamanı üstünlük verir.</small></div><button className={styles.primary} type="button" onClick={() => recordQuiz(pin, answer)}><Check size={17}/> Təsdiqlə</button></>}
    </div></div>}
  </section>;
}

function QrScanner({ onScanned }) {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const scanner = new Html5Qrcode("museum-qr-reader"); let stopped = false;
    scanner.start({ facingMode: "environment" }, { fps: 8, qrbox: 220 }, () => { onScanned(); scanner.stop().catch(() => {}); }, () => {})
      .catch(() => { if (!stopped) setUnavailable(true); });
    return () => { stopped = true; if (scanner.isScanning) scanner.stop().catch(() => {}); };
  }, [onScanned]);
  return <><div id="museum-qr-reader" className={styles.qrReader}/>{unavailable && <div className={styles.qrFallback}><p className={styles.modalText}>Kamera əlçatan deyil. Demo rejimində QR skanını simulyasiya et.</p><button className={styles.primary} type="button" onClick={onScanned}>Demo QR skanını simulyasiya et</button></div>}</>;
}

function CameraCapture({ onCaptured, rare }) {
  const video = useRef(null); const stream = useRef(null); const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } }).then((media) => { stream.current = media; if (video.current) video.current.srcObject = media; }).catch(() => { if (active) setUnavailable(true); });
    return () => { active = false; stream.current?.getTracks().forEach((track) => track.stop()); };
  }, []);
  return <div className={styles.cameraWrap}>{!unavailable && <video className={styles.cameraVideo} ref={video} autoPlay playsInline muted/>}{unavailable ? <><p className={styles.modalText}>Kamera əlçatan deyil. Demo foto çəkilişini simulyasiya et.</p><button className={styles.primary} type="button" onClick={onCaptured}><Camera size={17}/> Demo foto çək</button></> : <button className={styles.primary} type="button" onClick={() => { if (rare && !video.current?.videoWidth) return; if (video.current?.videoWidth) { const canvas = document.createElement("canvas"); canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight; canvas.getContext("2d").drawImage(video.current, 0, 0); } onCaptured(); }}><Camera size={17}/> {rare ? "Kodu foto ilə təsdiqlə" : "Foto çək"}</button>}</div>;
}

function DemoPanel({ game, onQrScan }) {
  const participants = game.users.filter((user, index, users) => users.findIndex((item) => item.university === user.university) === index);
  return <aside className={styles.demo}><div className={styles.demoHead}><strong>🎛 Demo paneli</strong><button type="button" onClick={() => setDemo({ demoOpen: false })}>Bağla</button></div><label>Saxta tarix və saat<input type="datetime-local" value={`${game.now.getFullYear()}-${String(game.now.getMonth() + 1).padStart(2, "0")}-${String(game.now.getDate()).padStart(2, "0")}T${String(game.now.getHours()).padStart(2, "0")}:${String(game.now.getMinutes()).padStart(2, "0")}`} onChange={(e) => setDemo({ now: new Date(e.target.value) })}/></label><label>İştirakçı və universitet<select value={game.currentUserId} onChange={(e) => setDemo({ currentUserId: e.target.value })}>{participants.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.university}</option>)}</select></label><label>Ardıcıl gün sayını sına<select value={game.streakOverride ?? "auto"} onChange={(e) => setDemo({ streakOverride: e.target.value === "auto" ? null : Number(e.target.value) })}><option value="auto">Hesablanmış</option>{Array.from({ length: GAME_CONFIG.streak.capDays + 1 }, (_, days) => <option key={days} value={days}>{days} gün ardıcıl</option>)}</select></label><label>GPS mövqeyi<select value={game.gpsId || "away"} onChange={(e) => setDemo({ gpsId: e.target.value === "away" ? null : e.target.value })}><option value="away">Məkandan uzaqda</option>{game.pins.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className={styles.check}><input type="checkbox" checked={game.teleportFlag} onChange={(e) => setDemo({ teleportFlag: e.target.checked })}/>Saxta GPS mövqeyi siqnalı</label><button type="button" onClick={onQrScan}>Demo QR skanını başlat</button><button type="button" onClick={() => setDemo({ gpsId: game.pins.find((p) => p.type === "rare")?.id })}>Nadir məkana keç</button><button type="button" onClick={() => triggerCoop(game.pins.find((p) => p.type === "rare"))}>3 dost · komanda tapşırığı</button><button className={styles.endWeek} type="button" onClick={jumpWeekEnd}>Həftənin sonuna keç</button></aside>;
}
