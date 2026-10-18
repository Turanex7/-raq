import { Link } from "react-router-dom";
import { GraduationCap, Zap, Gift } from "lucide-react";
import styles from "./ProfilePage.module.scss";
import { useState } from "react";
import { apiRequest } from "../../services/api";
import useApiResource from "../../services/useApiResource";
import XpExplainer from "./components/XpExplainer";
import WeeklyResetCountdown from "./components/WeeklyResetCountdown";

export default function ProfilePage() {
  return <ApiProfile />;
}

function ApiProfile() {
  const { data: user, loading, error, retry, setData } = useApiResource("/me");
  const { data: avatars } = useApiResource("/avatars");
  const { data: config } = useApiResource("/config");
  const { data: season } = useApiResource("/seasons/current");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  if (loading) return <section className={styles.page}><p role="status">Profil yüklənir…</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{error}</p><Link to="/login" className={styles.rewardsLink}>Daxil ol</Link><button type="button" onClick={retry}>Yenidən yoxla</button></section>;
  const currentAvatar = avatars?.find((item) => item.id === user.avatarId);
  const next = avatars?.find((item) => item.unlock_level > user.level) || null;
  const levelXp = config?.level_xp;
  const progress = levelXp ? Math.max(0, user.lifetimeXp - (user.level - 1) * levelXp) : 0;
  const avatarXpRemaining = levelXp && next ? Math.max(0, (next.unlock_level - 1) * levelXp - user.lifetimeXp) : null;
  async function saveProfile(event) {
    event.preventDefault(); setMessage(""); setSaveError("");
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;
    try { const updatedUser = await apiRequest("/me", { method: "PATCH", body: JSON.stringify({ name: trimmedName }) }); setData(updatedUser); setName(""); setMessage("Profil yeniləndi."); window.dispatchEvent(new Event("chiraq:profile-updated")); }
    catch (requestError) { setSaveError(requestError.message); }
  }
  async function selectAvatar(avatarId) {
    setMessage(""); setSaveError("");
    try { const updatedUser = await apiRequest("/me", { method: "PATCH", body: JSON.stringify({ avatarId }) }); setData(updatedUser); setMessage("Avatar dəyişdirildi."); window.dispatchEvent(new Event("chiraq:profile-updated")); }
    catch (requestError) { setSaveError(requestError.message); }
  }
  return <section className={styles.page}>
    <header className={styles.hero}><div className={styles.avatarFallback} aria-label={currentAvatar?.name || "Avatar"}>{currentAvatar?.illustration?.slice(0, 1) || "✦"}</div><div><p className={styles.kicker}>Profil</p><h1 className={styles.name}>{user.name}</h1><p className={styles.university}><GraduationCap size={16}/>{user.university}</p></div></header>
    <div className={styles.stats}><article className={styles.stat}><span className={styles.statLabel}>Səviyyə</span><strong>{user.level}</strong></article><article className={styles.stat}><span className={styles.statLabel}><Zap size={14}/>Ümumi XP</span><strong>{user.lifetimeXp}</strong></article><article className={styles.stat}><span className={styles.statLabel}><Zap size={14}/>Həftəlik XP</span><strong>{user.weeklyXp ?? "—"}</strong></article><article className={styles.stat}><span className={styles.statLabel}><Gift size={14}/>Avatar</span><strong>{currentAvatar?.name || "—"}</strong></article></div>
    <section className={styles.lanternCard} aria-label="Çıraq lampasının irəliləyişi"><div className={styles.lanternHeading}><span aria-hidden="true">✦</span><div><b>Çıraq lampası</b><small>Mövsümdə tamamladığın məkanlar çırağı işıqlandırır.</small></div><strong>{user.lantern?.lit ?? 1}/{user.lantern?.total ?? 5}</strong></div><div className={styles.lanternFlames}>{Array.from({ length: user.lantern?.total ?? 5 }, (_, index) => <i key={index} className={index < (user.lantern?.lit ?? 1) ? styles.litFlame : undefined} aria-hidden="true">✦</i>)}</div></section>
    <XpExplainer />
    {season && <div className={styles.card}><WeeklyResetCountdown secondsRemaining={season.seconds_remaining}/></div>}
    <div className={styles.card}><div className={styles.progressHead}><b>Növbəti səviyyəyə irəliləyiş</b><span>{levelXp ? `${progress}/${levelXp} XP` : "Qayda yüklənir…"}</span></div>{levelXp ? <progress value={progress} max={levelXp} aria-label={`Səviyyə ${user.level} irəliləyişi`} /> : <p role="status">Səviyyə qaydası yüklənir…</p>}{next && <p>Növbəti avatar: {next.name}, {avatarXpRemaining ?? "—"} XP qalıb</p>}</div>
    <div className={styles.card}><h2>Avatar kolleksiyası</h2><div className={styles.avatarChoices}>{avatars?.map((avatar) => { const unlocked = avatar.unlock_level <= user.level; return <button key={avatar.id} type="button" disabled={!unlocked} aria-pressed={avatar.id === user.avatarId} onClick={() => selectAvatar(avatar.id)}>{avatar.name}<small>{unlocked ? avatar.id === user.avatarId ? "Açıqdır · Seçilib" : "Açıqdır" : `Bağlıdır · ${avatar.unlock_level}-ci səviyyədə açılır`}</small></button>; })}</div></div>
    <form className={styles.card} onSubmit={saveProfile}><label>Adını yenilə<input value={name} onChange={(event) => { setName(event.target.value); setMessage(""); setSaveError(""); }} maxLength={50} minLength={2} placeholder={user.name}/></label><button className={`${styles.rewardsLink} ${styles.saveButton}`} type="submit" disabled={name.trim().length < 2 || name.trim() === user.name}>Yadda saxla</button>{message && <p role="status">{message}</p>}{saveError && <p role="alert">{saveError}</p>}</form>
    <Link to="/museum" className={styles.rewardsLink}>Şəxsi Virtual Muzeyə bax</Link>
  </section>;
}
