import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import PlaceholderPage from "./PlaceholderPage";
import HomePage from "../features/home/HomePage";
import MapPage from "../features/map/MapPage";
import GamePage from "../features/game/GamePage";
import { LeaderboardPage, ProfilePage, RewardsPage } from "../features/gamification";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "map", element: <MapPage /> },
      { path: "game", element: <GamePage /> },
      { path: "game/:levelId", element: <GamePage /> },
      { path: "login", element: <PlaceholderPage title="Giriş" /> },
      { path: "register", element: <PlaceholderPage title="Qeydiyyat" /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "rewards", element: <RewardsPage /> },
      { path: "museums/:id", element: <PlaceholderPage title="Muzey detalları" /> },
      { path: "quests/:id", element: <PlaceholderPage title="Tapşırıq" /> },
      { path: "scanner", element: <PlaceholderPage title="QR Scanner" /> },
    ],
  },
]);
