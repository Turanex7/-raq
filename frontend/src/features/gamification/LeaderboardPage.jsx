import { useEffect, useState } from "react";
import { Flame, Info } from "lucide-react";
import styles from "./LeaderboardPage.module.scss";
import { apiPost, apiRequest } from "../../services/api";
import useApiResource from "../../services/useApiResource";
import { Link, useSearchParams } from "react-router-dom";
import Avatar from "./components/Avatar";
import { seededAvatarId } from "./components/avatarData";
import { translate as t } from "../../i18n/i18n";

const tabs = [["overall", "Ümumi"], ["mine", "Universitetim"], ["universities", "Universitet Liqası"], ["open", "Açıq liqa"]];
export default function LeaderboardPage() {
  return <ApiLeaderboard />;
}

function ApiLeaderboard() {
  const [search] = useSearchParams();
  const [type, setType] = useState(search.get("tab") === "open" ? "open" : "overall");
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: currentUser } = useApiResource("/me", hasToken);
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
    apiRequest("/groups/me").then((result) => setGroups(Array.isArray(result) ? result : [])).catch((requestError) => setGroupError(requestError.message));
  }, [type]);

  async function refreshGroups() {
    const result = await apiRequest("/groups/me");
    const groupList = Array.isArray(result) ? result : [];
    setGroups(groupList);
    return groupList;
  }

  async function createGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups", { name: groupName }); setGroupName(""); await refreshGroups(); setNotice(t("Dəvət kodun: {code}", { code: group.inviteCode })); }
    catch (requestError) { setGroupError(t(requestError.message)); }
  }
  async function joinGroup(event) {
    event.preventDefault(); setGroupError(""); setNotice("");
    try { const group = await apiPost("/groups/join", { inviteCode }); setInviteCode(""); await refreshGroups(); setNotice(t("{name} qrupuna qoşuldun.", { name: group.name })); }
    catch (requestError) { setGroupError(t(requestError.message)); }
  }
  async function copyInviteCode(code) {
    try { await navigator.clipboard.writeText(code); setNotice(t("Dəvət kodu köçürüldü.")); }
    catch { setNotice(t("Dəvət kodu: {code}", { code })); }
  }

  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const maxFairScore = Math.max(0, ...rows.filter((row) => row.eligible !== false).map((row) => row.fairScore ?? row.fair_score ?? 0));
  const visibleRows = rows.slice(0, 20);
  const currentRow = type === "overall" ? rows.find((row) => row.current) : null;
  if (currentRow && !visibleRows.some((row) => row.current)) visibleRows.push(currentRow);
  return <section className={styles.page}><header className={styles.header}><h1>{t("Liderlər")}</h1><p>{t(type === "universities" ? "Xal = ən aktiv üzvlərin orta həftəlik XP-si, ona görə kiçik universitet də qalib ola bilər." : "Həftəlik mövsümün fərdi və komanda nəticələri")}</p></header>
    <div className={styles.tabs} role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} className={type === id ? styles.active : ""} onClick={() => setType(id)}>{t(label)}</button>)}</div>
    {type === "universities" && (config?.university_ranking ? <div className={styles.infoNote}><Info size={16}/>{t("Bal ən aktiv {top} iştirakçının orta həftəlik XP-sidir. Reytinq üçün minimum {min} aktiv iştirakçı lazımdır.", { top: config.university_ranking.top_members, min: config.university_ranking.minimum_active })}</div> : <p className={styles.infoNote} role="status">{t("Liqanın qaydaları yüklənir…")}</p>)}
    {data?.my_message && <p className={styles.infoNote} role="status">{t(data.my_message)}</p>}
    {type === "mine" && !loading && !error && rows.length === 1 && rows[0].current && <p className={styles.infoNote} role="status">{t("Bu həftə universitetindən yalnız sən XP qazanmısan. Digər universitetlərdəki iştirakçıları “Ümumi” bölməsində görə bilərsən.")}</p>}
    {loading && <p role="status" className={styles.infoNote}>{t("Reytinq yüklənir…")}</p>}
    {error && <div className={styles.infoNote} role="alert">{t(error)}<button type="button" onClick={retry}>{t("Yenidən yoxla")}</button></div>}
    {!loading && !error && rows.length === 0 && <BoardEmpty type={type} message={data?.my_message}/ >}
    {!loading && !error && rows.length > 0 && <ol className={styles.list}>{visibleRows.map((row, index) => {
      const isUniversity = type === "universities";
      const title = isUniversity ? row.university : row.name;
      const score = isUniversity || type === "open" ? row.fairScore ?? row.fair_score ?? 0 : row.weeklyXp ?? row.weekly_xp ?? 0;
      const participants = row.participantCount ?? row.participant_count ?? 0;
      const territories = row.territoryCount ?? row.territory_count ?? 0;
      const change = rankChange(row.changeVsLastWeek ?? row.change_vs_last_week);
      const activeMembers = row.activeCount ?? row.active_count ?? 0;
      const brightness = maxFairScore > 0 ? Math.max(0, Math.min(1, Number(score) / maxFairScore)) : 0;
      const subtitle = isUniversity ? row.eligible ? t("{participants} iştirakçı · {territories} ərazi · {change}", { participants, territories, change }) : t("{participants} iştirakçı · Reytinq üçün kifayət qədər iştirakçı yoxdur", { participants }) : type === "open" ? t("{members} üzv · {active} aktiv iştirakçı", { members: row.memberCount ?? row.member_count, active: activeMembers }) : row.university;
      const isPersonRow = type === "overall" || type === "mine";
      const avatarId = row.current ? currentUser?.avatarId : row.avatarId || row.avatar_id || seededAvatarId(row.id);
      return <li key={row.id || row.university || row.groupId || index} className={`${styles.row} ${row.current ? styles.me : ""} ${isUniversity && !row.eligible ? styles.inactive : ""}`}><span className={`${styles.rank} ${styles[`rank${row.rank || index + 1}`] || ""}`}>{row.rank ?? (row.eligible === false ? "—" : index + 1)}</span>{isPersonRow ? <Avatar avatarId={avatarId} fallbackName={row.name} size={40} className={styles.rowAvatar}/> : <span className={styles.avatarSpacer} aria-hidden="true"/>}<div className={styles.info}><strong>{title}{row.current ? ` (${t("sən")})` : ""}</strong><span>{subtitle}</span></div><div className={styles.xp}>{isUniversity && <span className={styles.lampIndicator} title={t("Universitet çırağının parlaqlığı həftəlik fair score ilə artır")}><Flame size={18} fill="currentColor" style={{ opacity: brightness }}/></span>}<b>{Number(score).toLocaleString("az-AZ")}</b><span>{t(isUniversity || type === "open" ? "orta XP" : "həftəlik XP")}</span></div></li>;
    })}</ol>}
    {type === "open" && <section className={styles.groups}><div><h2>{t("Açıq liqa qrupları")}</h2><p>{t("Qrup yarat, dəvət kodunu dostlarınla paylaş və ümumi nəticəni izlə.")}</p></div><div id="group-forms" className={styles.groupForms}><form onSubmit={createGroup}><label>{t("Yeni qrup")}<input value={groupName} onChange={(event) => setGroupName(event.target.value)} required maxLength={40} placeholder={t("Məsələn, Muzey dostları")}/></label><button type="submit">{t("Qrup yarat")}</button></form><form onSubmit={joinGroup}><label>{t("Dəvət kodu")}<input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} required maxLength={16} placeholder={t("8 simvollu kod")}/></label><button type="submit">{t("Qrupa qoşul")}</button></form></div>{groupError && <p role="alert">{t(groupError)}</p>}{notice && <p role="status">{notice}</p>}{groups.length === 0 && <p className={styles.groupEmpty}>{t("Hələ heç bir qrupa qoşulmamısan. Dəvət kodu ilə qoşul və ya yeni qrup yarat.")}</p>}{groups.map((group) => <article className={styles.groupCard} key={group.id}><div className={styles.groupTop}><b>{group.name}</b><span>{group.member_count ?? group.members?.length ?? 0}/5 {t("üzv")}</span></div><div className={styles.invite}><span>{t("Dəvət kodu")}: <code>{group.inviteCode}</code></span><button type="button" onClick={() => copyInviteCode(group.inviteCode)}>{t("Kodu köçür")}</button></div><ul className={styles.memberList} aria-label={t("{name} qrupunun üzvləri", { name: group.name })}>{group.members?.map((member) => <li key={member.id}>{member.name}{member.current ? ` · ${t("sən")}` : ""}</li>)}</ul></article>)}</section>}
  </section>;
}

function BoardEmpty({ type, message = "Bu həftə üçün nəticə yoxdur.", openLeagueControls = true }) {
  const isOpenLeague = type === "open";
  return <div className={styles.empty}>
    <b>{t(type === "mine" ? message : isOpenLeague ? "Açıq liqada hələ nəticə yoxdur." : message)}</b>
    <p>{t(isOpenLeague ? "Dostlarınla qrup yaradıb dəvət kodunu paylaş." : "Xəritədə tapşırıq tamamla, həftəlik XP qazan və cədvələ qoşul.")}</p>
    {isOpenLeague && openLeagueControls ? <a className={styles.emptyAction} href="#group-forms">{t("Qrup yarat və ya qoşul")}</a> : <Link className={styles.emptyAction} to={isOpenLeague ? "/login" : "/map"}>{t(isOpenLeague ? "Daxil ol" : "Xəritədə tapşırıq seç")}</Link>}
  </div>;
}

function rankChange(value) {
  if (!Number.isFinite(value)) return t("keçən həftə: məlumat yoxdur");
  if (value > 0) return t("↑ {count} pillə", { count: value });
  if (value < 0) return t("↓ {count} pillə", { count: Math.abs(value) });
  return t("dəyişməyib");
}
