/* eslint-disable react-refresh/only-export-components -- route configuration exports a router, not UI components. */
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./AppLayout";
import PlaceholderPage from "./PlaceholderPage";

const HomePage = lazy(() => import("../features/home/HomePage"));
const WeeklyPage = lazy(() => import("../features/gamification/WeeklyPage"));
const MapPage = lazy(() => import("../features/map/MapPage"));
const MuseumDetailPage = lazy(() => import("../features/gamification/MuseumDetailPage"));
const QuestDetailPage = lazy(() => import("../features/gamification/QuestDetailPage"));
const ScannerPage = lazy(() => import("../features/gamification/ScannerPage"));
const GamePage = lazy(() => import("../features/game/GamePage"));
const LeaderboardPage = lazy(() => import("../features/gamification/LeaderboardPage"));
const ProfilePage = lazy(() => import("../features/gamification/ProfilePage"));
const RewardsPage = lazy(() => import("../features/gamification/RewardsPage"));
const PrizesPage = lazy(() => import("../features/gamification/PrizesPage"));
const LoginPage = lazy(() => import("../features/gamification/LoginPage"));
const QrSheetPage = lazy(() => import("../features/gamification/QrSheetPage"));

function page(Component) {
  return <Suspense fallback={<div role="status" style={{ maxWidth: 720, margin: "32px auto", color: "#a9a5c2" }}>Səhifə yüklənir…</div>}><Component /></Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: page(HomePage) },
      { path: "map", element: page(WeeklyPage) },
      { path: "places", element: page(MapPage) },
      { path: "museum", element: page(RewardsPage) },
      { path: "prizes", element: page(PrizesPage) },
      { path: "game", element: page(GamePage) },
      { path: "game/:levelId", element: page(GamePage) },
      { path: "login", element: page(LoginPage) },
      { path: "register", element: page(LoginPage) },
      { path: "profile", element: page(ProfilePage) },
      { path: "leaderboard", element: page(LeaderboardPage) },
      { path: "rewards", element: page(RewardsPage) },
      { path: "museums/:id", element: page(MuseumDetailPage) },
      { path: "quests/:id", element: page(QuestDetailPage) },
      { path: "scanner", element: page(ScannerPage) },
      { path: "dev/qr-sheet", element: page(QrSheetPage) },
      { path: "*", element: <PlaceholderPage title="Səhifə tapılmadı" /> },
    ],
  },
]);
