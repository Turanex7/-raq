import { useEffect, useRef } from "react";
import { Compass, Crown, Map, UserRound, Zap, GalleryVerticalEnd, LogOut } from "lucide-react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser, retry: refreshApiUser } = useApiResource("/me", hasToken);
  const isAuthenticated = Boolean(apiUser);
  const level = apiUser?.level;
  const title = pageTitle(location.pathname);
  useEffect(() => { document.title = `${title} · Çıraq`; }, [title]);
  useEffect(() => {
    window.addEventListener("chiraq:xp-updated", refreshApiUser);
    window.addEventListener("chiraq:profile-updated", refreshApiUser);
    return () => {
      window.removeEventListener("chiraq:xp-updated", refreshApiUser);
      window.removeEventListener("chiraq:profile-updated", refreshApiUser);
    };
  }, [refreshApiUser]);
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
        <Link to={isAuthenticated ? "/profile" : "/login"} className={styles.profilePill} aria-label={isAuthenticated ? "Profilə keç" : "Daxil ol"}>
          <span className={styles.profileAvatar}>{apiUser?.name?.slice(0, 1) || "Ç"}</span>
          <span><b>{isAuthenticated ? `Səviyyə ${level}` : "Daxil ol"}</b></span>
        </Link>
        {isAuthenticated && <XpExplainer className={styles.xpHelp}>
          <Zap size={14} aria-hidden="true"/><span>Ümumi XP · {apiUser.lifetimeXp}</span>
        </XpExplainer>}
        {isAuthenticated && <button type="button" className={styles.logout} onClick={logOut}><LogOut size={16} aria-hidden="true"/><span>Çıxış</span></button>}
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
