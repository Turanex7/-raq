import { useEffect, useRef } from "react";
import { Compass, Crown, Map, UserRound, Zap, GalleryVerticalEnd, LogOut } from "lucide-react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useGame } from "../features/gamification/gameStore";
import { GAME_CONFIG } from "../features/gamification/gameConfig";
import { useMocks } from "../services/api";
import useApiResource from "../services/useApiResource";
import XpExplainer from "../features/gamification/components/XpExplainer";
import styles from "./AppLayout.module.scss";

const navigation = [
  { to: "/map", label: "Xəritə", icon: Map },
  { to: "/leaderboard", label: "Liderlər", icon: Crown },
  { to: "/museum", label: "Muzeyim", icon: GalleryVerticalEnd },
  { to: "/profile", label: "Profil", icon: UserRound },
];

function NavigationLink({ item, mobile = false, pathname }) {
  const Icon = item.icon;
  const isActivePath = item.to === "/map" ? ["/map", "/places", "/museums/", "/quests/", "/scanner"].some((route) => route.endsWith("/") ? pathname.startsWith(route) : pathname === route)
    : item.to === "/museum" ? ["/museum", "/rewards", "/prizes"].includes(pathname)
      : item.to === "/profile" ? ["/profile", "/login", "/register"].includes(pathname)
        : pathname === item.to;
  return (
    <NavLink
      to={item.to}
      end
      className={(mobile ? styles.mobileNavLink : styles.navLink) + (isActivePath ? " " + styles.active : "")}
    >
      <Icon aria-hidden="true" size={mobile ? 20 : 17} strokeWidth={2.2} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const pressTimer = useRef(null);
  const game = useGame();
  const location = useLocation();
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser } = useApiResource("/me", !useMocks && hasToken);
  const currentUser = game.users.find((user) => user.id === game.currentUserId);
  const level = useMocks ? Math.floor(currentUser.xp / GAME_CONFIG.levelXp) + 1 : apiUser?.level || 1;
  const lifetimeXp = useMocks ? currentUser.xp : apiUser?.lifetimeXp ?? 0;
  const title = pageTitle(location.pathname);
  useEffect(() => { document.title = `${title} · Çıraq`; }, [title]);
  const showDemo = () => { window.location.assign("/map?demo=1"); };
  const logOut = () => {
    window.localStorage.removeItem("chiraq_token");
    window.location.assign("/login");
  };
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="Çıraq ana səhifə" onTouchStart={() => { pressTimer.current = setTimeout(showDemo, 750); }} onTouchEnd={() => clearTimeout(pressTimer.current)} onContextMenu={(event) => { event.preventDefault(); showDemo(); }}>
          <span className={styles.logoMark} aria-hidden="true"><Compass size={20} strokeWidth={2.6} /></span>
          <span className={styles.logoWord}>Çıraq</span>
        </Link>
        <nav className={styles.nav} aria-label="Əsas naviqasiya">
          {navigation.map((item) => <NavigationLink key={item.to} item={item} pathname={location.pathname} />)}
        </nav>
        <Link to={useMocks || hasToken ? "/profile" : "/login"} className={styles.profilePill} aria-label={useMocks || hasToken ? "Profilə keç" : "Daxil ol"}>
          <span className={styles.profileAvatar}>{(apiUser?.name || (useMocks ? currentUser.name : "Ç")).slice(0, 1)}</span>
          <span><b>{useMocks || hasToken ? `Səviyyə ${level}` : "Daxil ol"}</b><small><Zap size={11} /> Ümumi XP · {lifetimeXp}</small></span>
        </Link>
        <XpExplainer className={styles.xpHelp}>
          <Zap size={14} aria-hidden="true"/><span>Ümumi XP · {lifetimeXp}</span>
        </XpExplainer>
        {hasToken && <button type="button" className={styles.logout} onClick={logOut}><LogOut size={16} aria-hidden="true"/><span>Çıxış</span></button>}
      </header>
      <main className={styles.main}><Outlet /></main>
      <nav className={styles.mobileNav} aria-label="Mobil naviqasiya">
        {navigation.map((item) => <NavigationLink key={item.to} item={item} mobile pathname={location.pathname} />)}
      </nav>
    </div>
  );
}

function pageTitle(pathname) {
  if (pathname.startsWith("/museums/")) return "Məkan";
  if (pathname.startsWith("/quests/")) return "Tapşırıq";
  if (pathname === "/" || pathname === "") return "Ana səhifə";
  return ({ "/map": "Xəritə", "/places": "Muzey xəritəsi", "/leaderboard": "Liderlər", "/museum": "Muzeyim", "/rewards": "Suvenirlər", "/prizes": "Mükafatlar", "/profile": "Profil", "/login": "Hesab", "/register": "Qeydiyyat", "/scanner": "QR skaner", "/dev/demo": "Demo paneli" })[pathname] || "Çıraq";
}
