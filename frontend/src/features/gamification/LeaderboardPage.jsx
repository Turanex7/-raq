import { useMemo, useState } from "react";
import { Info, Trophy } from "lucide-react";
import { applyTieBreak, rankUniversities } from "./gameLogic";
import { GAME_CONFIG } from "./gameConfig";
import { useGame } from "./gameStore";
import styles from "./LeaderboardPage.module.scss";
import { useMocks, apiPost, apiRequest } from "../../services/api";
import { useEffect } from "react";
import useApiResource from "../../services/useApiResource";
import { Link, useSearchParams } from "react-router-dom";

const tabs = [["overall", "Ümumi"], ["mine", "Universitetim"], ["universities", "Universitet Liqası"], ["open", "Açıq liqa"]];
export default function LeaderboardPage() {
  if (!useMocks) return <ApiLeaderboard/>;
  return <MockLeaderboard/>;
}

function MockLeaderboard() {
  const [search] = useSearchParams();
  const [type, setType] = useState(search.get("tab") === "open" ? "open" : "overall"); const [info, setInfo] = useState(false); const game = useGame();
  const me = game.users.find((user) => user.id === game.currentUserId);
  const people = useMemo(() => applyTieBreak(game.users.filter((user) => type === "mine" ? user.university === me.university : type === "open" ? user.university === "Açıq liqa" : true)), [game.users, me.university, type]);
  const universities = useMemo(() => rankUniversities(game.users), [game.users]);
  const rows = type === "universities" ? universities : people;
  const visibleRows = rows.slice(0, 20);
  const currentRow = type === "universities" ? null : rows.find((row) => row.id === me.id);
  if (currentRow && !visibleRows.some((row) => row.id === currentRow.id)) visibleRows.push(currentRow);
  return <section className={styles.page}><header className={styles.header}><h1>Liderlər</h1><p>{type === "universities" ? "Xal = ən aktiv üzvlərin orta həftəlik XP-si, ona görə kiçik universitet də qalib ola bilər." : "Bu həftənin kəşfçiləri və universitetləri"}</p></header>
    <div className={styles.tabs} role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} className={type === id ? styles.active : ""} onClick={() => setType(id)}>{label}</button>)}</div>
    {type === "universities" && <div className={styles.infoNote}><Info size={16}/>Bal ən aktiv {GAME_CONFIG.universityRanking.topMembers} iştirakçının həftəlik XP ortalamasıdır. Liqaya düşmək üçün ən azı {GAME_CONFIG.universityRanking.minimumActive} aktiv iştirakçı lazımdır.<button type="button" onClick={() => setInfo(!info)}>Ətraflı</button></div>}
    {info && <div className={styles.infoNote}>Bərabərlikdə əvvəl düzgün viktorina cavablarının sayı, sonra xala daha tez çatma vaxtı nəzərə alınır. Universitet liderinə kubok və tələbə şurası tədbiri təqdim olunur.</div>}
    {type === "universities" && <div className={styles.collective}><Trophy size={20}/> Lider universitet üçün kubok + tələbə şurası tədbiri</div>}
    {rows.length === 0 ? <BoardEmpty type={type} openLeagueControls={false} /> : <ol className={styles.list}>{visibleRows.map((row) => { const i = rows.indexOf(row); const isUniversity = type === "universities"; const isMe = !isUniversity && row.id === me.id; const title = isUniversity ? row.university : publicName(row.name); const change = rankChange(row.changeVsLastWeek); const territoryText = row.territoryCount == null ? "Ərazi sayı: məlumat yoxdur" : `${row.territoryCount} ərazi`; const subtitle = isUniversity ? row.eligible ? `${row.memberCount} iştirakçı · ${territoryText} · ${change}` : `${row.memberCount} iştirakçı · Reytinq üçün kifayət qədər iştirakçı yoxdur` : row.university; const score = isUniversity ? row.xp : row.weeklyXp ?? row.xp; return <li key={isUniversity ? row.university : row.id} className={`${styles.row} ${isMe ? styles.me : ""} ${isUniversity && !row.eligible ? styles.inactive : ""}`}><span className={`${styles.rank} ${styles[`rank${i + 1}`] || ""}`}>{row.eligible === false ? "—" : i + 1}</span><div className={styles.info}><strong>{title}{isMe ? " (sən)" : ""}</strong><span>{subtitle}</span></div><div className={styles.xp}><b>{score.toLocaleString("az-AZ")}</b><span>{isUniversity ? "orta həftəlik XP" : "həftəlik XP"}</span></div></li>; })}</ol>}
    <p className={styles.tie}>Bərabərlik: düzgün cavablar, sonra xala daha tez çatan iştirakçı.</p>
  </section>;
}

function ApiLeaderboard() {
  const [search] = useSearchParams();
  const [type, setType] = useState(search.get("tab") === "open" ? "open" : "overall");
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

  async function refreshGroups() {
    const result = await apiRequest("/groups/me");
    setGroups(result);
    return result;
  }

  async function createGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups", { name: groupName }); setGroupName(""); await refreshGroups(); setNotice(`Dəvət kodun: ${group.inviteCode}`); }
    catch (requestError) { setGroupError(requestError.message); }
  }
  async function joinGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups/join", { inviteCode }); setInviteCode(""); await refreshGroups(); setNotice(`${group.name} qrupuna qoşuldun.`); }
    catch (requestError) { setGroupError(requestError.message); }
  }
  async function copyInviteCode(code) {
    try { await navigator.clipboard.writeText(code); setNotice("Dəvət kodu köçürüldü."); }
    catch { setNotice(`Dəvət kodu: ${code}`); }
  }

  const rows = data?.rows || [];
  const visibleRows = rows.slice(0, 20);
  const currentRow = type === "overall" ? rows.find((row) => row.current) : null;
  if (currentRow && !visibleRows.some((row) => row.current)) visibleRows.push(currentRow);
  return <section className={styles.page}><header className={styles.header}><h1>Liderlər</h1><p>{type === "universities" ? "Xal = ən aktiv üzvlərin orta həftəlik XP-si, ona görə kiçik universitet də qalib ola bilər." : "Həftəlik mövsümün fərdi və komanda nəticələri"}</p></header>
    <div className={styles.tabs} role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} className={type === id ? styles.active : ""} onClick={() => setType(id)}>{label}</button>)}</div>
    {type === "universities" && <div className={styles.infoNote}><Info size={16}/>Bal ən aktiv {config?.university_ranking?.top_members ?? GAME_CONFIG.universityRanking.topMembers} iştirakçının orta həftəlik XP-sidir. Reytinq üçün minimum {config?.university_ranking?.minimum_active ?? GAME_CONFIG.universityRanking.minimumActive} aktiv iştirakçı lazımdır.</div>}
    {data?.my_message && <p className={styles.infoNote} role="status">{data.my_message}</p>}
    {loading && <p role="status" className={styles.infoNote}>Reytinq yüklənir…</p>}
    {error && <div className={styles.infoNote} role="alert">{error}<button type="button" onClick={retry}>Yenidən yoxla</button></div>}
    {!loading && !error && rows.length === 0 && <BoardEmpty type={type} message={data?.my_message}/ >}
    {!loading && !error && rows.length > 0 && <ol className={styles.list}>{visibleRows.map((row, index) => {
      const isUniversity = type === "universities";
      const title = isUniversity ? row.university : type === "open" ? row.name : row.name;
      const score = isUniversity || type === "open" ? row.fairScore ?? row.fair_score ?? 0 : row.weeklyXp ?? row.weekly_xp ?? 0;
      const participants = row.participantCount ?? row.participant_count ?? 0;
      const territories = row.territoryCount ?? row.territory_count ?? 0;
      const change = rankChange(row.changeVsLastWeek ?? row.change_vs_last_week);
      const activeMembers = row.activeCount ?? row.active_count ?? 0;
      const subtitle = isUniversity ? row.eligible ? `${participants} iştirakçı · ${territories} ərazi · ${change}` : `${participants} iştirakçı · Reytinq üçün kifayət qədər iştirakçı yoxdur` : type === "open" ? `${row.memberCount ?? row.member_count} üzv · ${activeMembers} aktiv iştirakçı` : row.university;
      return <li key={row.id || row.university || row.groupId || index} className={`${styles.row} ${row.current ? styles.me : ""} ${isUniversity && !row.eligible ? styles.inactive : ""}`}><span className={`${styles.rank} ${styles[`rank${row.rank || index + 1}`] || ""}`}>{row.rank ?? (row.eligible === false ? "—" : index + 1)}</span><div className={styles.info}><strong>{title}{row.current ? " (sən)" : ""}</strong><span>{subtitle}</span></div><div className={styles.xp}><b>{Number(score).toLocaleString("az-AZ")}</b><span>{isUniversity || type === "open" ? "orta XP" : "həftəlik XP"}</span></div></li>;
    })}</ol>}
    {type === "open" && <section className={styles.groups}><div><h2>Açıq liqa qrupları</h2><p>Qrup yarat, dəvət kodunu dostlarınla paylaş və ümumi nəticəni izlə.</p></div><div id="group-forms" className={styles.groupForms}><form onSubmit={createGroup}><label>Yeni qrup<input value={groupName} onChange={(event) => setGroupName(event.target.value)} required maxLength={40} placeholder="Məsələn, Muzey dostları"/></label><button type="submit">Qrup yarat</button></form><form onSubmit={joinGroup}><label>Dəvət kodu<input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} required maxLength={16} placeholder="8 simvollu kod"/></label><button type="submit">Qrupa qoşul</button></form></div>{groupError && <p role="alert">{groupError}</p>}{notice && <p role="status">{notice}</p>}{groups.length === 0 && <p className={styles.groupEmpty}>Hələ heç bir qrupa qoşulmamısan. Dəvət kodu ilə qoşul və ya yeni qrup yarat.</p>}{groups.map((group) => <article className={styles.groupCard} key={group.id}><div className={styles.groupTop}><b>{group.name}</b><span>{group.member_count ?? group.members?.length ?? 0}/5 üzv</span></div><div className={styles.invite}><span>Dəvət kodu: <code>{group.inviteCode}</code></span><button type="button" onClick={() => copyInviteCode(group.inviteCode)}>Kodu köçür</button></div><ul className={styles.memberList} aria-label={`${group.name} qrupunun üzvləri`}>{group.members?.map((member) => <li key={member.id}>{member.name}{member.current ? " · sən" : ""}</li>)}</ul></article>)}</section>}
  </section>;
}

function BoardEmpty({ type, message = "Bu həftə üçün nəticə yoxdur.", openLeagueControls = true }) {
  const isOpenLeague = type === "open";
  return <div className={styles.empty}>
    <b>{type === "mine" ? message : isOpenLeague ? "Açıq liqada hələ nəticə yoxdur." : message}</b>
    <p>{isOpenLeague ? "Dostlarınla qrup yaradıb dəvət kodunu paylaş." : "Xəritədə tapşırıq tamamla, həftəlik XP qazan və cədvələ qoşul."}</p>
    {isOpenLeague && openLeagueControls ? <a className={styles.emptyAction} href="#group-forms">Qrup yarat və ya qoşul</a> : <Link className={styles.emptyAction} to={isOpenLeague ? "/login" : "/map"}>{isOpenLeague ? "Hesaba daxil ol" : "Xəritədə tapşırıq seç"}</Link>}
  </div>;
}

function publicName(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)[0]}.` : name;
}

function rankChange(value) {
  if (!Number.isFinite(value)) return "keçən həftə: məlumat yoxdur";
  if (value > 0) return `↑ ${value} pillə`;
  if (value < 0) return `↓ ${Math.abs(value)} pillə`;
  return "dəyişməyib";
}
