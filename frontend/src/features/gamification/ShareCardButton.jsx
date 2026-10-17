import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { apiRequest } from "../../services/api";
import styles from "./ContentPages.module.scss";

export default function ShareCardButton({ placeId }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function createCard() {
    setBusy(true); setMessage("");
    try {
      const query = placeId ? `?placeId=${encodeURIComponent(placeId)}` : "";
      const data = await apiRequest(`/me/share-card${query}`);
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1920;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Paylaşım kartı hazırlana bilmədi.");
      const gradient = context.createLinearGradient(0, 0, 1080, 1920);
      gradient.addColorStop(0, "#11102c"); gradient.addColorStop(1, "#0c2e31");
      context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#a0e4c9"; context.lineWidth = 5; context.strokeRect(54, 54, 972, 1812);
      context.fillStyle = "#a0e4c9"; context.font = "700 48px system-ui"; context.fillText("ÇIRAQ", 96, 170);
      context.fillStyle = "#f4f0ff"; context.font = "700 74px system-ui"; context.fillText("Azərbaycanı", 96, 510); context.fillText("kəşf et.", 96, 605);
      context.fillStyle = "#d8c27f"; context.font = "800 104px system-ui"; context.fillText(`${data.xp} XP`, 96, 920);
      context.fillStyle = "#f4f0ff"; context.font = "600 42px system-ui";
      context.fillText(data.place || "Bakı macərası", 96, 1030);
      context.fillStyle = "#b7b3ca"; context.font = "400 34px system-ui";
      context.fillText(data.rank ? `Ümumi reytinq · #${data.rank}` : "Yeni kəşflər yoldadır", 96, 1125);
      context.fillText(data.university ? `${data.university} · ${data.university_rank ? `#${data.university_rank}` : "aktiv iştirakçı"}` : "Universitet liqası", 96, 1190);
      context.fillStyle = "#a0e4c9"; context.font = "600 34px system-ui";
      context.fillText("Mədəniyyəti kəşf et, tapşırıqları tamamla.", 96, 1710);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Şəkil faylı yaradıla bilmədi.");
      const file = new File([blob], "ciraq-paylasim.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: "Çıraq kəşfim", text: data.share_text, files: [file] });
        setMessage("Kart paylaşmağa hazırdır.");
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ciraq-paylasim.png"; anchor.click();
        URL.revokeObjectURL(url); setMessage("Kart yükləndi.");
      }
    } catch (error) {
      if (error.name !== "AbortError") setMessage(error.message || "Kart hazırlana bilmədi.");
    } finally { setBusy(false); }
  }

  return <div><button className={styles.action} type="button" onClick={createCard} disabled={busy}>{busy ? "Hazırlanır…" : navigator.share ? <><Share2 size={16}/>Paylaşım kartı yarat</> : <><Download size={16}/>Kartı yüklə</>}</button>{message && <p role="status">{message}</p>}</div>;
}
