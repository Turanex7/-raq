import { myRewards, lockedRewards } from "./mockData";
import styles from "./RewardsPage.module.scss";

const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function RewardsPage() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Mükafatlar</h1>
        <p>Quest tamamladıqca rəqəmsal suvenirlər qazanırsan</p>
      </header>

      <h2 className={styles.sectionTitle}>Qazanılanlar</h2>
      {myRewards.length === 0 ? (
        <p className={styles.empty}>Hələ suvenir yoxdur. Xəritədən quest-ə başla.</p>
      ) : (
        <ul className={styles.grid}>
          {myRewards.map((reward) => (
            <li key={reward.id} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {reward.icon}
              </span>
              <h3>{reward.title}</h3>
              <p>{reward.description}</p>
              <time dateTime={reward.earnedAt}>{formatDate(reward.earnedAt)}</time>
            </li>
          ))}
        </ul>
      )}

      <h2 className={styles.sectionTitle}>Kilidli</h2>
      <ul className={styles.grid}>
        {lockedRewards.map((reward) => (
          <li key={reward.id} className={`${styles.card} ${styles.locked}`}>
            <span className={styles.icon} aria-hidden="true">
              {reward.icon}
            </span>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <span className={styles.lockLabel}>Hələ açılmayıb</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
