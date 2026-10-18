import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/global.scss";
import { LanguageProvider } from "./i18n/i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider><RouterProvider router={router} /></LanguageProvider>
);
