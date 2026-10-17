import { useMemo, useState } from "react";
import { Gem, Landmark, Share2, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useGame } from "./gameStore";
import { GAME_CONFIG, HISTORICAL_AVATARS } from "./gameConfig";
import styles from "./RewardsPage.module.scss";
import { useMocks } from "../../services/api";
import useApiResource from "../../services/useApiResource";

export default function RewardsPage() {
  if (!useMocks) return <ApiCollection/>;
  return <MockCollection/>;
}

function MockCollection() {
  const game = useGame(); const [shared, setShared] = useState(false); const user = game.users.find((item) => item.id === game.currentUserId);
  const sharedCollection = useMemo(() => { try { const value = new URLSearchParams(window.location.search).get("collection"); return value ? JSON.parse(value) : null; } catch { return null; } }, []);
  const cards = useMemo(() => sharedCollection?.cards || [
    ...game.cards.map((card) => ({ ...card, status: "earned" })),
    ...(game.missedCards || []),
    ...game.pins.filter((pin) => !game.completed.some((item) => item.pinId === pin.id)).map((pin) => ({ id: `available-${pin.id}`, week: game.weekLabel, name: pin.name, art: pin.art, rarity: pin.type === "rare" ? "Epik" : pin.type === "museum" ? "Nadir" : "Adi", status: "available" })),
  ], [sharedCollection, game.cards, game.missedCards, game.pins, game.completed, game.weekLabel]);
  const ownerName = sharedCollection?.name || user.name;
  const grouped = useMemo(() => cards.reduce((acc, card) => { (acc[card.week] ||= []).push(card); return acc; }, {}), [cards]);
  const level = Math.floor(user.xp / GAME_CONFIG.levelXp) + 1; const nextAvatar = HISTORICAL_AVATARS.find((avatar) => avatar.xp > user.xp) || HISTORICAL_AVATARS.at(-1);
  return <section className={styles.page}><header className={styles.header}><h1>{sharedCollection ? `${ownerName} · Virtual Muzey` : "Şəxsi Virtual Muzey"}</h1><p>Hər həftənin xatirələri səninlə qalır. Kartlar yalnız həmin həftə qazanıla bilər.</p></header>
    <div className={styles.avatarProgress}><span className={styles.avatarArt}>{HISTORICAL_AVATARS.filter((avatar) => avatar.xp <= user.xp).at(-1)?.art}</span><div><b>Səviyyə {level} · {HISTORICAL_AVATARS.filter((avatar) => avatar.xp <= user.xp).at(-1)?.name}</b><small>Növbəti avatar: {nextAvatar.name} · {Math.max(0, nextAvatar.xp - user.xp)} XP qalıb</small><progress value={user.xp % GAME_CONFIG.levelXp} max={GAME_CONFIG.levelXp}/></div></div>
    {!sharedCollection && <button className={styles.shareButton} type="button" onClick={() => { const collection = encodeURIComponent(JSON.stringify({ name: user.name, cards: game.cards })); const url = `${window.location.origin}/museum?collection=${collection}`; if (navigator.share) navigator.share({ title: "Mənim virtual muzeyim", text: "Çıraq kəşflərimə bax!", url }).then(() => setShared(true)).catch(() => {}); else navigator.clipboard?.writeText(url).then(() => setShared(true)).catch(() => setShared(true)); }}>{shared ? "Paylaşım linki hazırdır" : <><Share2 size={15}/> Dostlarla paylaş</>}</button>}
    {Object.entries(grouped).map(([week, cards]) => <div key={week}><h2 className={styles.sectionTitle}>{week}</h2><ul className={styles.grid}>{cards.map((card) => <li key={card.id} className={`${styles.card} ${styles[rarityClass(card.rarity)]}`}><span className={styles.cardArt}><SouvenirMark rarity={card.rarity} coOp={card.coOp}/></span><span className={styles.rarity}>{rarityLabel(card.rarity)}{card.coOp ? " · XP bonusu yoxdur" : ""}</span><h3>{card.name}</h3><p>{card.status === "missed" ? "Həmin həftə qaçırılıb" : card.status === "available" ? "Bu həftə qazana bilərsən" : "Qazanılıb"}</p></li>)}</ul></div>)}
    <div className={styles.artNote}>Hər suvenir məkanın hekayəsini xatırladan kolleksiya nişanıdır.</div><Link to="/prizes" className={styles.link}>Həftəlik mükafatlara bax →</Link>
  </section>;
}

function ApiCollection() {
  const { data, loading, error, retry } = useApiResource("/me/collection");
  if (loading) return <section className={styles.page}><p role="status">Kolleksiya yüklənir…</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{error}</p><button type="button" onClick={retry}>Yenidən yoxla</button><Link to="/login" className={styles.link}>Hesaba daxil ol</Link></section>;
  const items = data?.rows || [];
  return <section className={styles.page}><header className={styles.header}><h1>Şəxsi Virtual Muzey</h1><p>Suvenirlər yalnız aid olduqları həftədə qazanılır. Burada qazanılmış və qaçırılmış xatirələri görə bilərsən.</p></header>
    <div className={styles.avatarProgress}><span className={styles.avatarArt} aria-hidden="true">✦</span><div><b>Tarixi avatarlar</b><small>Səviyyə artdıqca yeni avatarlar açılır.</small>{data?.avatars?.filter((avatar) => avatar.unlocked).map((avatar) => <span className={styles.avatarName} key={avatar.id}>{avatar.name}</span>)}</div></div>
    {items.length === 0 && <p className={styles.empty}>Hələ suvenir yoxdur. Xəritədən bir tapşırıq seç və ilk kəşfini et.</p>}
    <ul className={styles.grid}>{items.map((card) => <li key={card.id} className={`${styles.card} ${styles[rarityClass(card.rarity)]}`}><span className={styles.cardArt} aria-hidden="true"><SouvenirMark rarity={card.rarity}/></span><span className={styles.rarity}>{rarityLabel(card.rarity)}</span><h3>{card.name}</h3><p>{card.status === "earned" ? "Qazanılıb" : card.status === "missed" ? "Həmin həftə qaçırılıb" : card.status === "upcoming" ? "Həmin həftə hələ başlamayıb" : "Bu həftə qazana bilərsən"}</p><small>{[card.place, card.season_theme].filter(Boolean).join(" · ")}{card.limited ? " · Məhdud buraxılış" : " · Kolleksiya kartı"}</small></li>)}</ul>
    <Link to="/map" className={styles.link}>Xəritəyə qayıt →</Link>
  </section>;
}

function rarityLabel(value) { return ({ adi: "Adi", common: "Adi", nadir: "Nadir", rare: "Nadir", epik: "Epik", legendary: "Epik" })[value?.toLowerCase()] || "Adi"; }
function rarityClass(value) { return ({ adi: "common", common: "common", nadir: "rare", rare: "rare", epik: "legendary", legendary: "legendary" })[value?.toLowerCase()] || "common"; }
function SouvenirMark({ rarity, coOp }) { const Icon = coOp ? UsersRound : rarityClass(rarity) === "common" ? Landmark : Gem; return <Icon aria-hidden="true"/>; }
