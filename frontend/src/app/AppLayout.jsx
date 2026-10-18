import { useEffect, useRef } from "react";
import { Crown, Map, UserRound, Zap, GalleryVerticalEnd, LogOut } from "lucide-react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import useApiResource from "../services/useApiResource";
import XpExplainer from "../features/gamification/components/XpExplainer";
import Avatar from "../features/gamification/components/Avatar";
import { LANGUAGE_OPTIONS, translate as t, useI18n } from "../i18n/i18n";
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
      <span>{t(item.label)}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const pressTimer = useRef(null);
  const location = useLocation();
  const { language, setLanguage } = useI18n();
  const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("chiraq_token"));
  const { data: apiUser, retry: refreshApiUser } = useApiResource("/me", hasToken);
  const isAuthenticated = Boolean(apiUser);
  const level = apiUser?.level;
  const title = pageTitle(location.pathname);
  useEffect(() => { document.title = `${title} · Çıraq`; document.documentElement.lang = language; }, [title, language]);
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
        <Link to="/" className={styles.logo} aria-label={t("Çıraq ana səhifə")} onTouchStart={() => { pressTimer.current = setTimeout(showDemo, 750); }} onTouchEnd={() => clearTimeout(pressTimer.current)} onContextMenu={(event) => { event.preventDefault(); showDemo(); }}>
          <span className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" focusable="false">
              <path d="M11.9 2.5c-1.3 1.8-2.2 2.9-2.2 4.2a3.1 3.1 0 0 0 6.2 0c0-1.1-.6-2-1.6-3.2-.1 1.1-.6 1.8-1.3 2.2-.1-1.2-.4-2.1-1.1-3.2Z" fill="currentColor" />
              <path d="M7.2 11.5h8.5l1.4 2.2c.4.7-.1 1.5-.9 1.5H7.8c-.8 0-1.3-.8-.9-1.5l1.3-2.2Zm9.8 2.2h1.4c1.6 0 2.6.7 2.6 1.8s-1 1.8-2.8 1.8h-2.1m-7.4-.1 1 2.5h4.7l1-2.5m-3.3 2.5v1.3m-2.2 0h4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.1 12.4c-1.2.4-1.8 1.1-1.8 1.8 0 .6.5 1 1.2 1h2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.logoWord}>Çıraq</span>
        </Link>
        <nav className={styles.nav} aria-label={t("Əsas naviqasiya")}>
          {navigation.map((item) => <NavigationLink key={item.to} item={item} pathname={location.pathname} />)}
        </nav>
        <div className={styles.languageSwitch} role="group" aria-label={t("Dil seçimi")}>
          {LANGUAGE_OPTIONS.map((option) => <button key={option.id} type="button" aria-label={option.label} aria-pressed={language === option.id} className={language === option.id ? styles.languageActive : ""} onClick={() => setLanguage(option.id)}>{option.short}</button>)}
        </div>
        <Link to={isAuthenticated ? "/profile" : "/login"} className={styles.profilePill} aria-label={isAuthenticated ? t("Profilə keç") : t("Daxil ol")}>
          <Avatar avatarId={apiUser?.avatarId} avatarName={apiUser?.avatarId ? undefined : "Çıraq"} size={28} className={styles.profileAvatar}/>
          <span><b>{isAuthenticated ? t("Səviyyə {level}", { level }) : t("Daxil ol")}</b></span>
        </Link>
        {isAuthenticated && <XpExplainer className={styles.xpHelp}>
          <Zap size={14} aria-hidden="true"/><span>{t("Ümumi XP")} · {apiUser.lifetimeXp}</span>
        </XpExplainer>}
        {isAuthenticated && <button type="button" className={styles.logout} onClick={logOut}><LogOut size={16} aria-hidden="true"/><span>{t("Çıxış")}</span></button>}
      </header>
      <main className={`${styles.main}${location.pathname === "/" ? ` ${styles.mainHome}` : ""}`}><Outlet /></main>
      <nav className={styles.mobileNav} aria-label={t("Mobil naviqasiya")}>
        {navigation.map((item) => <NavigationLink key={item.to} item={item} mobile pathname={location.pathname} />)}
      </nav>
    </div>
  );
}

function pageTitle(pathname) {
  if (pathname.startsWith("/museums/")) return t("Məkan");
  if (pathname.startsWith("/quests/")) return t("Tapşırıq");
  if (pathname === "/" || pathname === "") return t("Ana səhifə");
  return t(({ "/map": "Xəritə", "/places": "Muzey xəritəsi", "/leaderboard": "Liderlər", "/museum": "Muzeyim", "/rewards": "Suvenirlər", "/prizes": "Mükafatlar", "/profile": "Profil", "/login": "Hesab", "/register": "Qeydiyyat", "/scanner": "QR skaner", "/dev/demo": "Demo paneli" })[pathname] || "Çıraq");
}
