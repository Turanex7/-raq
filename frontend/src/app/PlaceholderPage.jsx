import { Link } from "react-router-dom";
import { translate as t } from "../i18n/i18n";

export default function PlaceholderPage({ title }) {
  return <section style={{ maxWidth: 640, margin: "48px auto", padding: 24, borderRadius: 16, background: "#151333" }}><h1>{t(title)}</h1><p style={{ color: "#a9a5c2" }}>{t("Bu səhifə tapılmadı və ya artıq mövcud deyil.")}</p><Link to="/" style={{ color: "#a0e4c9" }}>{t("Ana səhifəyə qayıt")}</Link></section>;
}
