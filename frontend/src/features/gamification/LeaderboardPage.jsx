import { useMemo, useState } from "react";
import { Info, Trophy } from "lucide-react";
import { applyTieBreak, rankUniversities } from "./gameLogic";
import { GAME_CONFIG } from "./gameConfig";
import { useGame } from "./gameStore";
import styles from "./LeaderboardPage.module.scss";
import { useMocks, apiPost, apiRequest } from "../../services/api";
import { useEffect } from "react";
import useApiResource from "../../services/useApiResource";

const tabs = [["overall", "Ümumi"], ["mine", "Universitetim"], ["universities", "Universitet Liqası"], ["open", "Açıq liqa"]];
export default function LeaderboardPage() {
  if (!useMocks) return <ApiLeaderboard/>;
  return <MockLeaderboard/>;
}

function MockLeaderboard() {
  const [type, setType] = useState("overall"); const [info, setInfo] = useState(false); const game = useGame();
  const me = game.users.find((user) => user.id === game.currentUserId);
  const people = useMemo(() => applyTieBreak(game.users.filter((user) => type === "mine" ? user.university === me.university : type === "open" ? user.university === "Açıq liqa" : true)), [game.users, me.university, type]);
  const universities = useMemo(() => rankUniversities(game.users), [game.users]);
  const rows = type === "universities" ? universities : people;
  return <section className={styles.page}><header className={styles.header}><h1>Liderlər</h1><p>Bu həftənin kəşfçiləri və universitetləri</p></header>
    <div className={styles.tabs} role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} className={type === id ? styles.active : ""} onClick={() => setType(id)}>{label}</button>)}</div>
    {type === "universities" && <div className={styles.infoNote}><Info size={16}/>Universitet xalı ən aktiv {GAME_CONFIG.universityRanking.topMembers} üzvün orta həftəlik XP-sidir. {GAME_CONFIG.universityRanking.minimumActive}-dən az aktiv üzvü olan universitet reytinqdə deyil. Ölçü üstünlük yaratmır.<button type="button" onClick={() => setInfo(!info)}>Ətraflı</button></div>}
    {info && <div className={styles.infoNote}>Bərabərlikdə əvvəl düzgün viktorina cavablarının sayı, sonra xala daha tez çatma vaxtı nəzərə alınır. Universitet liderinə kubok və tələbə şurası tədbiri təqdim olunur.</div>}
    {type === "universities" && <div className={styles.collective}><Trophy size={20}/> Lider universitet üçün kubok + tələbə şurası tədbiri</div>}
    <ol className={styles.list}>{rows.slice(0, 20).map((row, i) => { const isUniversity = type === "universities"; const isMe = !isUniversity && row.id === me.id; const title = isUniversity ? row.university : row.name; const subtitle = isUniversity ? row.eligible ? `${row.memberCount} aktiv üzv · top üzvlərin ortalaması` : "Reytinqdə deyil · ən azı 5 aktiv üzv" : row.university; const score = isUniversity ? row.xp : row.weeklyXp ?? row.xp; return <li key={isUniversity ? row.university : row.id} className={`${styles.row} ${isMe ? styles.me : ""} ${isUniversity && !row.eligible ? styles.inactive : ""}`}><span className={`${styles.rank} ${styles[`rank${i + 1}`] || ""}`}>{row.eligible === false ? "—" : i + 1}</span><div className={styles.info}><strong>{title}{isMe ? " (sən)" : ""}</strong><span>{subtitle}</span></div><div className={styles.xp}><b>{score.toLocaleString("az-AZ")}</b><span>{isUniversity ? "orta XP" : "həftəlik XP"}</span></div></li>; })}</ol>
    <p className={styles.tie}>Bərabərlik: düzgün cavablar, sonra xala daha tez çatan iştirakçı.</p>
  </section>;
}

function ApiLeaderboard() {
  const [type, setType] = useState("overall");
  const scope = type === "overall" ? "global" : type === "mine" ? "university" : type === "universities" ? "league" : "open";
  const { data, loading, error, retry } = useApiResource(`/leaderboard?scope=${scope}`);
  const { data: config } = useApiResource("/config");
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [notice, setNotice] = useState("");
  const [groupError, setGroupError] = useState("");

  useEffect(() => {
    if (type !== "open") return;
    apiRequest("/groups/me").then(setGroups).catch((requestError) => setGroupError(requestError.message));
  }, [type]);

  async function createGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups", { name: groupName }); setGroupName(""); setNotice(`Dəvət kodun: ${group.inviteCode}`); setGroups((rows) => [...rows, group]); }
    catch (requestError) { setGroupError(requestError.message); }
  }
  async function joinGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups/join", { inviteCode }); setInviteCode(""); setNotice(`${group.name} qrupuna qoşuldun.`); setGroups((rows) => rows.some((item) => item.id === group.id) ? rows : [...rows, group]); }
    catch (requestError) { setGroupError(requestError.message); }
  }

  const rows = data?.rows || [];
  return <section className={styles.page}><header className={styles.header}><h1>Liderlər</h1><p>Həftəlik mövsümün fərdi və komanda nəticələri</p></header>
    <div className={styles.tabs} role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} className={type === id ? styles.active : ""} onClick={() => setType(id)}>{label}</button>)}</div>
    {type === "universities" && <div className={styles.infoNote}><Info size={16}/>Xal ən aktiv {config?.university_ranking?.top_members ?? GAME_CONFIG.universityRanking.topMembers} üzvün orta həftəlik XP-sidir. Minimum {config?.university_ranking?.minimum_active ?? GAME_CONFIG.universityRanking.minimumActive} aktiv üzv lazımdır; iştirakçı sayı hər universitetin yanında göstərilir.</div>}
    {data?.my_message && <p className={styles.infoNote} role="status">{data.my_message}</p>}
    {loading && <p role="status" className={styles.infoNote}>Reytinq yüklənir…</p>}
    {error && <div className={styles.infoNote} role="alert">{error}<button type="button" onClick={retry}>Yenidən yoxla</button></div>}
    {!loading && !error && <ol className={styles.list}>{rows.slice(0, 20).map((row, index) => {
      const isUniversity = type === "universities";
      const title = isUniversity ? row.university : type === "open" ? row.name : row.name;
      const score = isUniversity || type === "open" ? row.fairScore ?? row.fair_score ?? 0 : row.weeklyXp ?? row.weekly_xp ?? 0;
      const subtitle = isUniversity ? row.eligible ? `${row.participantCount ?? row.participant_count} aktiv üzv · ${row.territoryCount ?? row.territory_count} ərazi` : `Reytinq üçün kifayət qədər iştirakçı yoxdur · ${row.participantCount ?? row.participant_count}` : type === "open" ? `${row.memberCount ?? row.member_count} üzv` : row.university;
      return <li key={row.id || row.university || row.groupId || index} className={`${styles.row} ${row.current ? styles.me : ""} ${isUniversity && !row.eligible ? styles.inactive : ""}`}><span className={`${styles.rank} ${styles[`rank${row.rank || index + 1}`] || ""}`}>{row.rank ?? (row.eligible === false ? "—" : index + 1)}</span><div className={styles.info}><strong>{title}{row.current ? " (sən)" : ""}</strong><span>{subtitle}</span></div><div className={styles.xp}><b>{Number(score).toLocaleString("az-AZ")}</b><span>{isUniversity || type === "open" ? "orta XP" : "həftəlik XP"}</span></div></li>;
    })}</ol>}
    {type === "open" && <section className={styles.groups}><div><h2>Açıq liqa qrupları</h2><p>Qrup yarat, dəvət kodunu dostlarınla paylaş və ümumi nəticəni izlə.</p></div><div className={styles.groupForms}><form onSubmit={createGroup}><label>Yeni qrup<input value={groupName} onChange={(event) => setGroupName(event.target.value)} required maxLength={40} placeholder="Məsələn, Muzey dostları"/></label><button type="submit">Qrup yarat</button></form><form onSubmit={joinGroup}><label>Dəvət kodu<input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} required maxLength={16} placeholder="8 simvollu kod"/></label><button type="submit">Qrupa qoşul</button></form></div>{groupError && <p role="alert">{groupError}</p>}{notice && <p role="status">{notice}</p>}{groups.map((group) => <article className={styles.groupCard} key={group.id}><b>{group.name}</b><span>{group.member_count ?? group.members?.length ?? 0}/5 üzv · kod: {group.inviteCode}</span><div>{group.members?.map((member) => <span key={member.id}>{member.name}</span>)}</div></article>)}</section>}
  </section>;
}
