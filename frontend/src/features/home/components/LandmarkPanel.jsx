import { ArrowRight, MapPin, ShieldCheck, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveTicketLinks } from "../../../config/tickets.js";
import styles from "../HomePage.module.scss";

export default function LandmarkPanel({ place, onClose }) {
  if (!place) return null;
  const status = place.status === "locked" ? "Bağlıdır" : "Açıqdır";
  const action = place.status === "locked" ? "Məkan detallarına bax" : "Məkanı kəşf et";
  const ticketLinks = resolveTicketLinks(place.id);
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
      {ticketLinks.length > 0 && <section className={styles.ticketLinks} aria-label={`${place.name} üçün bilet linkləri`}>
        {ticketLinks.map((ticket) => <div className={styles.ticketOption} key={`${ticket.provider}-${ticket.url}`}>
          {ticket.sponsored && <div className={styles.sponsorInfo}>
            <small>Sponsor: {ticket.provider}</small>
            <p>Bu linkdən bilet alışı layihəyə komissiya qazandıra bilər.</p>
          </div>}
          <a
            className={styles.ticketLink}
            href={ticket.url}
            target="_blank"
            rel={ticket.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            aria-label={`Bilet al: ${place.name} — ${ticket.provider}`}
          >
            {ticket.sponsored ? ticket.label : `${ticket.label} · ${ticket.provider}`}
          </a>
        </div>)}
      </section>}
      <Link to={`/museums/${place.slug}`} className={styles.panelAction}>{action}<ArrowRight size={16} /></Link>
    </aside>
  );
}
