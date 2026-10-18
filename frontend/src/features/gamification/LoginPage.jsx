import { useEffect, useState } from "react";
import { GraduationCap, LockKeyhole, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signIn } from "./gameStore";
import { HISTORICAL_AVATARS, UNIVERSITIES } from "./gameConfig";
import { apiPost, apiRequest, useMocks } from "../../services/api";
import styles from "./LoginPage.module.scss";

export default function LoginPage() {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [avatarId, setAvatarId] = useState("nizami");
  const [visited, setVisited] = useState("");
  const [universities, setUniversities] = useState(useMocks ? UNIVERSITIES.map((item) => ({ id: item.id, name: item.name })) : []);
  const [avatars, setAvatars] = useState(useMocks ? HISTORICAL_AVATARS.map((item, index) => ({ id: ["nizami", "uzeyir", "nesimi", "natavan", "babek"][index], name: item.name, unlock_level: [1, 2, 3, 4, 6][index] })) : []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const universityName = universities.find((item) => item.id === universityId)?.name || "";

  useEffect(() => {
    if (useMocks) return;
    let active = true;
    Promise.all([apiRequest("/universities"), apiRequest("/avatars")]).then(([schools, portraits]) => {
      if (active) { setUniversities(schools); setAvatars(portraits); if (schools[0]) setUniversityId(schools[0].id); }
    }).catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (useMocks) {
        const recognized = UNIVERSITIES.some((university) => university.domains.includes(email.split("@")[1]?.toLowerCase()));
        if (!recognized && mode === "login") throw new Error("Universitet e-poçtu tanınmadı.");
        signIn(email, "demo");
      } else if (mode === "register") {
        if (!universityId) throw new Error("Universitet seç.");
        const account = await apiPost("/auth/register", { name, email, password, universityId, avatarId, visitedMuseumLast12Months: visited === "" ? null : visited === "yes" });
        window.localStorage.setItem("chiraq_token", account.token);
      } else {
        const account = await apiPost("/auth/login", { email, password });
        window.localStorage.setItem("chiraq_token", account.token);
      }
      navigate("/");
    } catch (submitError) { setError(submitError.message || "Daxil olmaq mümkün olmadı."); }
    finally { setBusy(false); }
  }

  return <section className={styles.page}><div className={styles.card}><span className={styles.icon}><GraduationCap/></span><p className={styles.kicker}>Çıraq · tələbə kəşfçilər</p><h1>{mode === "register" ? "İlk kəşfinə qoşul" : "Çıraq-a daxil ol"}</h1><p className={styles.desc}>Hesabını tamamla, universitetini seç və yaxınlıqdakı ilk tapşırığa başla.</p>
    <div className={styles.modeTabs}><button type="button" aria-pressed={mode === "register"} onClick={() => setMode("register")}>Qeydiyyat</button><button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>Daxil ol</button></div>
    <form onSubmit={submit}>
      {mode === "register" && <>
        <label>Ad və soyad<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={50} autoComplete="name" placeholder="Ad Soyad"/></label>
        <label>Universitet<input list="ciraq-universities" value={universityName} onChange={(event) => setUniversityId(universities.find((item) => item.name.toLowerCase() === event.target.value.trim().toLowerCase())?.id || "")} required placeholder="Universiteti axtar"/><datalist id="ciraq-universities">{universities.map((uni) => <option key={uni.id} value={uni.name}/>)}</datalist></label>
        <label>Avatar<select value={avatarId} onChange={(event) => setAvatarId(event.target.value)}>{avatars.map((avatar) => <option key={avatar.id} value={avatar.id} disabled={avatar.unlock_level > 1}>{avatar.name}{avatar.unlock_level > 1 ? ` · ${avatar.unlock_level}-ci səviyyədə açılır` : ""}</option>)}</select></label>
        <label>Son 12 ayda muzeyə getmisən?<select value={visited} onChange={(event) => setVisited(event.target.value)}><option value="">Cavab vermək istəmirəm</option><option value="yes">Bəli</option><option value="no">Xeyr</option></select></label>
      </>}
      <label>Universitet e-poçtu<input type="email" placeholder="ad@universitet.edu.az" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email"/></label>
      {!useMocks && <label>Şifrə<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={128} required autoComplete={mode === "register" ? "new-password" : "current-password"}/></label>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{mode === "register" ? <UserRoundPlus size={16}/> : <LockKeyhole size={16}/>} {busy ? "Yoxlanılır…" : mode === "register" ? "Hesab yarat" : "Davam et"}</button>
    </form>
    <small className={styles.note}>{useMocks ? "Demo rejimi: irəliləyiş bu brauzer sessiyasında saxlanır." : "Hesab məlumatları SQLite demo bazasında saxlanılır. E-poçt təsdiqi mükafatın əl ilə yoxlanması zamanı aparılır."}</small>
  </div></section>;
}
