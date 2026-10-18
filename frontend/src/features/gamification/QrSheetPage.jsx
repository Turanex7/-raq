import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { apiRequest } from "../../services/api";
import styles from "./QrSheetPage.module.scss";
import { translate as t, useI18n } from "../../i18n/i18n";

export default function QrSheetPage() {
  const { language } = useI18n();
  const [adminToken, setAdminToken] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const data = await apiRequest("/dev/qr-sheet", { headers: { "X-Admin-Token": adminToken } });
      if (!Array.isArray(data)) throw new Error("QR siyahısı əlçatan deyil.");
      const encoded = await Promise.all(data.map(async (row) => ({ ...row, image: await QRCode.toDataURL(row.qr_payload, { width: 240, margin: 1, color: { dark: "#11102c", light: "#ffffff" } }) })));
      setRows(encoded);
    } catch (requestError) { setRows([]); setError(requestError.message || "QR vərəqi yüklənmədi."); }
    finally { setLoading(false); }
  }
  useEffect(() => { document.title = `${t("QR vərəqi")} · Çıraq`; }, [language]);
  return <section className={styles.page}><header className={styles.header}><div><p>{t("Yalnız demo rejimi")}</p><h1>{t("Tapşırıq QR vərəqi")}</h1><span>{t("Vərəqdəki kodlar imzalıdır və birbaşa demo tapşırıqlarına uyğundur.")}</span></div><button type="button" onClick={() => window.print()} disabled={!rows.length}><Printer size={16}/>{t("Çap et")}</button></header>
    {!rows.length && <form className={styles.access} onSubmit={load}><label>{t("Admin açarı")}<input type="password" autoComplete="off" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} required/></label><button type="submit" disabled={loading}>{loading ? t("Yüklənir…") : t("QR kodları göstər")}</button>{error && <p role="alert">{t(error)}</p>}</form>}
    {!!rows.length && <div className={styles.grid}>{rows.map((row) => { const type = ({ qr_scan: "QR", quiz: "Bilik sualı", vote: "Səsvermə", coop: "Ko-op", find: "Məkan kəşfi" })[row.type] || row.type; return <article className={styles.card} key={row.id}><img src={row.image} alt={`${t(row.place)} · ${t(row.title)} ${t("QR kodu")}`}/><div><b>{t(row.place)}</b><span>{t(row.title)} · {t(type)}</span><small>{row.slug}/{row.id}</small></div></article>; })}</div>}
  </section>;
}
