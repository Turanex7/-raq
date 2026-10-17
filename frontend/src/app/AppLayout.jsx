import { Compass, Crown, Map, UserRound, Zap } from "lucide-react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { currentUser } from "../features/gamification/mockData";
import styles from "./AppLayout.module.scss";

const navigation = [
  { to: "/map", label: "Xəritə", icon: Map },
  { to: "/leaderboard", label: "Liderlər", icon: Crown },
  { to: "/profile", label: "Profil", icon: UserRound },
];

function NavigationLink({ item, mobile = false }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        (mobile ? styles.mobileNavLink : styles.navLink) + (isActive ? " " + styles.active : "")
      }
    >
      <Icon aria-hidden="true" size={mobile ? 20 : 17} strokeWidth={2.2} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="Çıraq ana səhifə">
          <span className={styles.logoMark} aria-hidden="true"><Compass size={20} strokeWidth={2.6} /></span>
          <span className={styles.logoWord}>Çıraq</span>
        </Link>
        <nav className={styles.nav} aria-label="Əsas naviqasiya">
          {navigation.map((item) => <NavigationLink key={item.to} item={item} />)}
        </nav>
        <Link to="/profile" className={styles.profilePill} aria-label="Profilə keç">
          <span className={styles.profileAvatar}>A</span>
          <span><b>Səviyyə {currentUser.level}</b><small><Zap size={11} /> {currentUser.xp} XP</small></span>
        </Link>
      </header>
      <main className={styles.main}><Outlet /></main>
      <nav className={styles.mobileNav} aria-label="Mobil naviqasiya">
        {navigation.map((item) => <NavigationLink key={item.to} item={item} mobile />)}
      </nav>
    </div>
  );
}
