import { ArrowRight, MapPin, ShieldCheck, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import TicketLinkList from "../../../components/TicketLinkList.jsx";
import styles from "../HomePage.module.scss";

export default function LandmarkPanel({ place, onClose }) {
  if (!place) return null;
  const status = place.status === "locked" ? "Bağlıdır" : "Açıqdır";
  const action = place.status === "locked" ? "Məkan detallarına bax" : "Məkanı kəşf et";
  return (
    <aside className={styles.landmarkPanel} aria-live="polite">
      <button className={styles.closePanel} type="button" onClick={onClose} aria-label="Paneli bağla"><X size={16} /></button>
      <div className={styles.panelKicker}><Sparkles size={13} />{place.type === "museum" ? "Muzey" : "Açıq məkan"} · {status}</div>
      <h2>{place.name}</h2>
      <p>{place.description}</p>
      <div className={styles.panelMeta}>
        <span><MapPin size={13} />{place.district}</span>
        <span><ShieldCheck size={13} />{place.task_count} tapşırıq</span>
      </div>
      <TicketLinkList place={place} />
      <Link to={`/museums/${place.slug}`} className={styles.panelAction}>{action}<ArrowRight size={16} /></Link>
    </aside>
  );
}
