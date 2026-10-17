import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";

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
      { path: "profile", element: <Page title="Profil" /> },
      { path: "leaderboard", element: <Page title="Liderlər" /> },
      { path: "rewards", element: <Page title="Mükafatlar" /> },
      { path: "museums/:id", element: <Page title="Muzey detalları" /> },
      { path: "quests/:id", element: <Page title="Tapşırıq" /> },
      { path: "scanner", element: <Page title="QR Scanner" /> },
    ],
  },
]);