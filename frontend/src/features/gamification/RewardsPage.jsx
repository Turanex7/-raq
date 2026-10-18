import { Gem, Landmark, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./RewardsPage.module.scss";
import useApiResource from "../../services/useApiResource";

export default function RewardsPage() {
  return <ApiCollection />;
}

function ApiCollection() {
  const { data, loading, error, retry } = useApiResource("/me/collection");
  if (loading) return <section className={styles.page}><p role="status">Kolleksiya yüklənir…</p></section>;
  if (error) return <section className={styles.page}><p role="alert">{error}</p><button type="button" onClick={retry}>Yenidən yoxla</button><Link to="/login" className={styles.link}>Daxil ol</Link></section>;
  const items = Array.isArray(data?.rows) ? data.rows : [];
  const unlockedAvatars = Array.isArray(data?.avatars) ? data.avatars.filter((avatar) => avatar.unlocked) : [];
  return <section className={styles.page}><header className={styles.header}><h1>Şəxsi Virtual Muzey</h1><p>Suvenirlər yalnız aid olduqları həftədə qazanılır. Burada qazanılmış və qaçırılmış xatirələri görə bilərsən.</p></header>
    <div className={styles.avatarProgress}><span className={styles.avatarArt} aria-hidden="true">✦</span><div><b>Tarixi avatarlar</b><small>Səviyyə artdıqca yeni avatarlar açılır.</small>{unlockedAvatars.map((avatar) => <span className={styles.avatarName} key={avatar.id}>{avatar.name}</span>)}</div></div>
    {items.length === 0 && <p className={styles.empty}>Hələ suvenir yoxdur. Xəritədən bir tapşırıq seç və ilk kəşfini et.</p>}
    <ul className={styles.grid}>{items.map((card) => <li key={card.id} className={`${styles.card} ${styles[rarityClass(card.rarity)]}`}><span className={styles.cardArt} aria-hidden="true"><SouvenirMark rarity={card.rarity}/></span><span className={styles.rarity}>{rarityLabel(card.rarity)}</span><h3>{card.name}</h3><p>{card.status === "earned" ? "Qazanılıb" : card.status === "missed" ? "Həmin həftə qaçırılıb" : card.status === "upcoming" ? "Həmin həftə hələ başlamayıb" : "Bu həftə qazana bilərsən"}</p><small>{[card.place, card.season_theme].filter(Boolean).join(" · ")}{card.limited ? " · Məhdud buraxılış" : " · Kolleksiya kartı"}</small></li>)}</ul>
    <Link to="/map" className={styles.link}>Xəritəyə qayıt →</Link>
  </section>;
}

function rarityLabel(value) { return ({ adi: "Adi", common: "Adi", nadir: "Nadir", rare: "Nadir", epik: "Epik", legendary: "Epik" })[value?.toLowerCase()] || "Adi"; }
function rarityClass(value) { return ({ adi: "common", common: "common", nadir: "rare", rare: "rare", epik: "legendary", legendary: "legendary" })[value?.toLowerCase()] || "common"; }
function SouvenirMark({ rarity, coOp }) { const Icon = coOp ? UsersRound : rarityClass(rarity) === "common" ? Landmark : Gem; return <Icon aria-hidden="true"/>; }
