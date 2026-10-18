/* eslint-disable react-refresh/only-export-components -- route configuration exports a router, not UI components. */
import { createBrowserRouter, Link, useRouteError } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./AppLayout";
import PlaceholderPage from "./PlaceholderPage";
import { translate as t, useI18n } from "../i18n/i18n";

const HomePage = lazy(() => import("../features/home/HomePage"));
const WeeklyPage = lazy(() => import("../features/gamification/WeeklyPage"));
const MapPage = lazy(() => import("../features/map/MapPage"));
const MuseumDetailPage = lazy(() => import("../features/gamification/MuseumDetailPage"));
const QuestDetailPage = lazy(() => import("../features/gamification/QuestDetailPage"));
const ScannerPage = lazy(() => import("../features/gamification/ScannerPage"));
const GamePage = lazy(() => import("../features/game/GamePage"));
const MiniGamePage = lazy(() => import("../features/game/minigames/MiniGamePage"));
const LeaderboardPage = lazy(() => import("../features/gamification/LeaderboardPage"));
const ProfilePage = lazy(() => import("../features/gamification/ProfilePage"));
const RewardsPage = lazy(() => import("../features/gamification/RewardsPage"));
const PrizesPage = lazy(() => import("../features/gamification/PrizesPage"));
const LoginPage = lazy(() => import("../features/gamification/LoginPage"));
const QrSheetPage = lazy(() => import("../features/gamification/QrSheetPage"));
const DevDemoPage = lazy(() => import("../features/gamification/DevDemoPage"));

function LocalizedPage({ Component }) {
  useI18n();
  return <Component />;
}

function page(Component) {
  return <Suspense fallback={<div role="status" style={{ maxWidth: 720, margin: "32px auto", color: "#a9a5c2" }}>{t("Səhifə yüklənir…")}</div>}><LocalizedPage Component={Component} /></Suspense>;
}

function RouteError() {
  useI18n();
  const error = useRouteError();
  const message = error?.status === 404 ? t("Axtardığın səhifə tapılmadı.") : t("Səhifə yüklənərkən xəta baş verdi.");
  return <main role="alert" style={{ maxWidth: 720, margin: "64px auto", padding: 24, color: "#f4f0ff", background: "#17132f", borderRadius: 20 }}>
    <p style={{ color: "#a0e4c9" }}>{t("Çıraq")}</p>
    <h1>{t("Səhifə açıla bilmədi")}</h1>
    <p>{message}</p>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Link to="/" style={{ color: "#11102c", background: "#a0e4c9", padding: "12px 16px", borderRadius: 12, textDecoration: "none" }}>{t("Ana səhifəyə qayıt")}</Link>
      <button type="button" onClick={() => window.location.reload()} style={{ color: "#a0e4c9", background: "transparent", padding: "12px 16px", borderRadius: 12, border: "1px solid #3e385e" }}>{t("Yenidən yüklə")}</button>
    </div>
  </main>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: page(HomePage) },
      { path: "map", element: page(WeeklyPage) },
      { path: "places", element: page(MapPage) },
      { path: "museum", element: page(RewardsPage) },
      { path: "prizes", element: page(PrizesPage) },
      { path: "game", element: page(GamePage) },
      { path: "game/:levelId", element: page(GamePage) },
      { path: "mini-game/:placeId", element: page(MiniGamePage) },
      { path: "login", element: page(LoginPage) },
      { path: "register", element: page(LoginPage) },
      { path: "profile", element: page(ProfilePage) },
      { path: "leaderboard", element: page(LeaderboardPage) },
      { path: "rewards", element: page(RewardsPage) },
      { path: "museums/:id", element: page(MuseumDetailPage) },
      { path: "quests/:id", element: page(QuestDetailPage) },
      { path: "scanner", element: page(ScannerPage) },
      { path: "dev/qr-sheet", element: page(QrSheetPage) },
      { path: "dev/demo", element: page(DevDemoPage) },
      { path: "*", element: <PlaceholderPage title="Səhifə tapılmadı" /> },
    ],
  },
]);
