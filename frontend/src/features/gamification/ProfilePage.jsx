import { Link } from "react-router-dom";
import { Gift, GraduationCap, Zap } from "lucide-react";
import XPProgressBar from "./components/XPProgressBar";
import { currentUser, myRewards } from "./mockData";
import styles from "./ProfilePage.module.scss";

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const user = currentUser;

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        {user.avatarUrl ? (
          <img className={styles.avatar} src={user.avatarUrl} alt={user.name} />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {initials(user.name)}
          </div>
        )}

        <div>
          <p className={styles.kicker}>Profil</p>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.university}>
            <GraduationCap size={16} />
            {user.university}
          </p>
        </div>
      </header>

      <div className={styles.stats}>
        <article className={styles.stat}>
          <span className={styles.statLabel}>Səviyyə</span>
          <strong>{user.level}</strong>
        </article>
        <article className={styles.stat}>
          <span className={styles.statLabel}>
            <Zap size={14} /> XP
          </span>
          <strong>{user.xp}</strong>
        </article>
        <article className={styles.stat}>
          <span className={styles.statLabel}>
            <Gift size={14} /> Suvenir
          </span>
          <strong>{myRewards.length}</strong>
        </article>
      </div>

      <div className={styles.card}>
        <XPProgressBar xp={user.xp} />
      </div>

      <Link to="/rewards" className={styles.rewardsLink}>
        Rəqəmsal suvenirlərə bax
      </Link>
    </section>
  );
}
