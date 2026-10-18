import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { apiRequest } from "../../services/api";
import styles from "./QrSheetPage.module.scss";

export default function QrSheetPage() {
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
  useEffect(() => { document.title = "QR vərəqi · Çıraq"; }, []);
  return <section className={styles.page}><header className={styles.header}><div><p>Yalnız demo rejimi</p><h1>Tapşırıq QR vərəqi</h1><span>Vərəqdəki kodlar imzalıdır və birbaşa demo tapşırıqlarına uyğundur.</span></div><button type="button" onClick={() => window.print()} disabled={!rows.length}><Printer size={16}/>Çap et</button></header>
    {!rows.length && <form className={styles.access} onSubmit={load}><label>Admin açarı<input type="password" autoComplete="off" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} required/></label><button type="submit" disabled={loading}>{loading ? "Yüklənir…" : "QR kodları göstər"}</button>{error && <p role="alert">{error}</p>}</form>}
    {!!rows.length && <div className={styles.grid}>{rows.map((row) => <article className={styles.card} key={row.id}><img src={row.image} alt={`${row.place} · ${row.title} QR kodu`}/><div><b>{row.place}</b><span>{row.title} · {row.type}</span><small>{row.slug}/{row.id}</small></div></article>)}</div>}
  </section>;
}
