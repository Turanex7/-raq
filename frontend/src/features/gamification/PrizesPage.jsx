import { useMemo } from "react";
import { Gift, Trophy } from "lucide-react";
import { assignPrizes } from "./gameLogic";
import { useGame } from "./gameStore";
import styles from "./PrizesPage.module.scss";
import { useState } from "react";
import { useMocks, apiPost } from "../../services/api";
import useApiResource from "../../services/useApiResource";

export default function PrizesPage() {
  if (!useMocks) return <ApiPrizes/>;
  return <MockPrizes/>;
}

function MockPrizes() {
  const game = useGame(); const me = game.users.find((user) => user.id === game.currentUserId);
  const sorted = useMemo(() => [...game.users].sort((a, b) => (b.weeklyXp ?? b.xp) - (a.weeklyXp ?? a.xp) || b.correctAnswers - a.correctAnswers || a.reachedAt - b.reachedAt), [game.users]);
  const prize = game.weekTheme === "Şəhər həftəsi" ? "Kino və ya oyun vauçeri" : "Xalça Muzeyi bileti";
  const livePrizes = assignPrizes(sorted, prize, game.weekTheme === "Şəhər həftəsi" ? "Kiçik şəhər təcrübəsi" : "Muzey dostu üçün hədiyyə kartı");
  const prizes = game.lastWeekPrizes || livePrizes;
  const weekLabel = game.lastWeekPrizes?.weekLabel || game.weekLabel;
  const weekTheme = game.lastWeekPrizes?.weekTheme || game.weekTheme;
  const meRank = sorted.findIndex((user) => user.id === me.id && (user.weeklyXp ?? user.xp) > 0);
  return <section className={styles.page}><header><p className={styles.kicker}>{weekLabel} · {weekTheme}</p><h1>Mükafatlar</h1><p>{game.lastWeekPrizes ? "Keçən həftənin yekun qalibləri" : "Həftənin mövzusuna uyğun hədiyyələr"}</p></header><article className={styles.big}><Trophy/><span>{game.lastWeekPrizes ? "Qalib" : "Hazırda öndə"}</span><h2>{prizes.overall?.name || "Hələ qalib müəyyən edilməyib"}</h2>{prizes.overall && <><b>{prizes.overall.prize}</b><small>{prizes.overall.weeklyXp ?? prizes.overall.xp} XP · {prizes.overall.university}</small></>}</article><article className={styles.uni}><Gift/><span>{game.lastWeekPrizes ? "Qalib" : "Hazırda öndə"}</span><h2>{prizes.university?.name || "Hələ qalib müəyyən edilməyib"}</h2>{prizes.university && <><b>{prizes.university.prize}</b><small>{prizes.university.university} · Ümumi qalibdən ayrı iştirakçı</small></>}</article><div className={styles.theme}><b>Həftəlik mövzu</b><p>“Muzey həftəsi” — muzey bileti. “Şəhər həftəsi” — kino və ya oyun vauçeri. “Sponsor həftəsi” — sponsor hədiyyəsi. Mükafatlar tələbə məlumatları əl ilə yoxlanıldıqdan sonra təsdiqlənir.</p></div><div className={styles.collective}>🏆 Universitet Liqasının lideri: kubok və tələbə şurası üçün xüsusi tədbir.</div><p className={styles.note}>{meRank < 0 ? "Hələ reytinqdə deyilsən" : `Sənin hazırkı mövqeyin: ${meRank + 1}`}</p></section>;
}

function ApiPrizes() {
  const { data, loading, error, retry } = useApiResource("/rewards/current");
  const { data: me } = useApiResource("/me");
  const { data: leaderboard } = useApiResource("/leaderboard?scope=global", Boolean(me));
  const [verification, setVerification] = useState("");
  const [notice, setNotice] = useState("");
  const [claimError, setClaimError] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = data?.rows || [];
  const overall = data?.status === "final" ? rows.find((row) => row.rank === 1) : rows.find((row) => row.type === "overall");
  const university = data?.status === "final" ? rows.find((row) => row.winner && row.rank !== 1) : rows.find((row) => row.type === "university");
  const myRank = leaderboard?.my_rank ?? null;
  const finalRows = data?.status === "final" ? rows : data?.previous_final || [];
  const canClaim = finalRows.some((row) => row.id === me?.id && row.winner && row.prizeEligible);

  async function claim(event) {
    event.preventDefault(); setBusy(true); setNotice(""); setClaimError("");
    try { const response = await apiPost("/rewards/claim", { verificationReference: verification }); setNotice(response.message); setVerification(""); }
    catch (requestError) { setClaimError(requestError.message); }
    finally { setBusy(false); }
  }

  if (loading) return <section className={styles.page}><p role="status">Mükafatlar yüklənir…</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{error}</p><button type="button" onClick={retry}>Yenidən yoxla</button></section>;
  return <section className={styles.page}><header><p className={styles.kicker}>{data?.theme || "Həftəlik mövsüm"}</p><h1>Mükafatlar</h1><p>{data?.status === "final" ? "Həftənin yekun qalibləri" : "Həftə ərzində nəticələr müvəqqətidir; qaliblər həftə tamamlananda müəyyən olunur."}</p></header>
    <article className={styles.big}><Trophy/><span>{data?.status === "final" ? "Qalib" : "Hazırda öndə"}</span><h2>{overall?.name || "Hələ reytinqdə deyilsən"}</h2>{overall && <><b>{data?.status === "final" ? (overall.label || "Qalib") : "Müvəqqəti lider"}</b><small>{overall.weekly_xp ?? overall.weeklyXp} XP</small></>}</article>
    <article className={styles.uni}><Gift/><span>{data?.status === "final" ? "Qalib" : "Hazırda öndə"}</span><h2>{university?.name || "Namizəd hələ müəyyən edilməyib"}</h2>{university && <><b>{university.university || university.university_id || university.universityId}</b><small>{university.weekly_xp ?? university.weeklyXp} XP · ümumi liderdən ayrı iştirakçı</small></>}</article>
    <div className={styles.theme}><b>Mükafat uyğunluğu</b><p>Mükafatlar həftə yekunlaşdıqdan sonra tələbə məlumatları əl ilə yoxlanılaraq təsdiqlənir.</p></div>
    {canClaim && <form className={styles.claim} onSubmit={claim}><label>Tələbə e-poçtu və ya ID<input value={verification} onChange={(event) => setVerification(event.target.value)} required minLength={4} maxLength={80} placeholder="Yoxlama üçün məlumat"/></label><button type="submit" disabled={busy}>{busy ? "Göndərilir…" : "Mükafatı tələb et"}</button>{notice && <p role="status">{notice}</p>}{claimError && <p role="alert">{claimError}</p>}</form>}
    {data?.previous_final?.length > 0 && <div className={styles.theme}><b>Keçən həftənin yekun ilk üçlüyü</b>{data.previous_final.slice(0, 3).map((winner) => <p key={winner.id}>#{winner.rank} · {winner.winner ? "Qalib · " : ""}{winner.name} · {winner.weeklyXp} XP</p>)}</div>}
    <p className={styles.note}>{myRank ? `Sənin mövqeyin: ${myRank}` : "Hələ reytinqdə deyilsən"}</p>
  </section>;
}
