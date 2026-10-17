import { useState } from "react";
import { universityLeaderboard, userLeaderboard, currentUser } from "./mockData";
import styles from "./LeaderboardPage.module.scss";

export default function LeaderboardPage() {
  const [type, setType] = useState("university");
  const rows = type === "university" ? universityLeaderboard : userLeaderboard;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Liderlər</h1>
        <p>Universitetlərarası reytinq və ən aktiv kəşfçilər</p>
      </header>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={type === "university"}
          className={type === "university" ? styles.active : ""}
          onClick={() => setType("university")}
        >
          Universitetlər
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={type === "user"}
          className={type === "user" ? styles.active : ""}
          onClick={() => setType("user")}
        >
          İstifadəçilər
        </button>
      </div>

      <ol className={styles.list}>
        {rows.map((row) => {
          const isMe =
            type === "user" && row.userId === currentUser.id;
          const title = type === "university" ? row.university : row.name;
          const subtitle =
            type === "university"
              ? `${row.memberCount} iştirakçı`
              : row.university;

          return (
            <li
              key={type === "university" ? row.university : row.userId}
              className={`${styles.row} ${isMe ? styles.me : ""}`}
            >
              <span className={`${styles.rank} ${styles[`rank${row.rank}`] || ""}`}>
                {row.rank}
              </span>
              <div className={styles.info}>
                <strong>
                  {title}
                  {isMe ? " (sən)" : ""}
                </strong>
                <span>{subtitle}</span>
              </div>
              <div className={styles.xp}>
                <b>{row.xp.toLocaleString("az-AZ")}</b>
                <span>XP</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
