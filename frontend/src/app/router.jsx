import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import {
  LeaderboardPage,
  ProfilePage,
  RewardsPage,
} from "../features/gamification";

const Page = ({ title }) => <h1>{title}</h1>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Page title="Çıraq — Ana səhifə" /> },
      { path: "map", element: <Page title="Muzey xəritəsi" /> },
      { path: "login", element: <Page title="Giriş" /> },
      { path: "register", element: <Page title="Qeydiyyat" /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "rewards", element: <RewardsPage /> },
      { path: "museums/:id", element: <Page title="Muzey detalları" /> },
      { path: "quests/:id", element: <Page title="Tapşırıq" /> },
      { path: "scanner", element: <Page title="QR Scanner" /> },
    ],
  },
]);