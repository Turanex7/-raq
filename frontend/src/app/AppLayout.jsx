import { Outlet, Link } from "react-router-dom";
import styles from "./AppLayout.module.scss";

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Çıraq
        </Link>

        <nav className={styles.nav}>
          <Link to="/map">Xəritə</Link>
          <Link to="/leaderboard">Liderlər</Link>
          <Link to="/profile">Profil</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}