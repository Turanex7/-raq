import { useEffect, useState } from "react";
import { GraduationCap, LockKeyhole, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiRequest } from "../../services/api";
import styles from "./LoginPage.module.scss";
import Avatar from "./components/Avatar";

export default function LoginPage() {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [avatarId, setAvatarId] = useState("nizami");
  const [visited, setVisited] = useState("");
  const [universities, setUniversities] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const selectedAvatar = avatars.find((item) => item.id === avatarId);

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/universities"), apiRequest("/avatars")]).then(([schools, portraits]) => {
      const schoolList = Array.isArray(schools) ? schools : [];
      const avatarList = Array.isArray(portraits) ? portraits : [];
      if (!schoolList.length || !avatarList.length) throw new Error("Universitet və avatar siyahısı yüklənmədi.");
      if (active) {
        setUniversities(schoolList);
        setAvatars(avatarList);
        setOptionsError("");
      }
    }).catch((requestError) => { if (active) setOptionsError(requestError.message || "Universitet siyahısı yüklənmədi."); })
      .finally(() => { if (active) setOptionsLoading(false); });
    return () => { active = false; };
  }, [optionsAttempt]);

  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "register") {
        if (!universities.some((item) => item.id === universityId)) throw new Error("Siyahıdan universitet seç.");
        if (!avatars.some((item) => item.id === avatarId && item.unlock_level <= 1)) throw new Error("Açıq avatarlardan birini seç.");
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
        <label>Universitet<select value={universityId} onChange={(event) => setUniversityId(event.target.value)} required disabled={optionsLoading || !universities.length}>
          <option value="">{optionsLoading ? "Universitetlər yüklənir…" : "Universitet seç"}</option>
          {universities.map((uni) => <option key={uni.id} value={uni.id}>{uni.name}</option>)}
        </select></label>
        <label>Avatar<select value={avatarId} onChange={(event) => setAvatarId(event.target.value)} disabled={optionsLoading || !avatars.length}>{avatars.map((avatar) => <option key={avatar.id} value={avatar.id} disabled={avatar.unlock_level > 1}>{avatar.name}{avatar.unlock_level > 1 ? ` · ${avatar.unlock_level}-ci səviyyədə açılır` : ""}</option>)}</select></label>
        {selectedAvatar && <div className={styles.avatarPreview}><Avatar avatarId={selectedAvatar.id} avatarName={selectedAvatar.name} size={48}/><span>{selectedAvatar.name}</span></div>}
        <label>Son 12 ayda muzeyə getmisən?<select value={visited} onChange={(event) => setVisited(event.target.value)}><option value="">Cavab vermək istəmirəm</option><option value="yes">Bəli</option><option value="no">Xeyr</option></select></label>
      </>}
      <label>Universitet e-poçtu<input type="email" placeholder="ad@universitet.edu.az" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email"/></label>
      <label>Şifrə<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={128} required autoComplete={mode === "register" ? "new-password" : "current-password"}/></label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" disabled={busy || (mode === "register" && (optionsLoading || !universities.length || !avatars.length))}>{mode === "register" ? <UserRoundPlus size={16}/> : <LockKeyhole size={16}/>} {busy ? "Yoxlanılır…" : mode === "register" ? "Hesab yarat" : "Davam et"}</button>
    </form>
    {optionsError && <div className={styles.error} role="alert">{optionsError}<button type="button" onClick={() => { setOptionsError(""); setOptionsLoading(true); setOptionsAttempt((value) => value + 1); }}>Siyahını yenidən yüklə</button></div>}
    <small className={styles.note}>{import.meta.env.VITE_DEMO_MODE === "true" ? "Demo hesabın və irəliləyişin yalnız bu brauzerdə saxlanılır." : "Hesab məlumatları SQLite demo bazasında saxlanılır. E-poçt təsdiqi mükafatın əl ilə yoxlanması zamanı aparılır."}</small>
  </div></section>;
}
