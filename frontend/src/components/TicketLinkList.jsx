import { resolveTicketLinks } from "../config/tickets.js";
import styles from "./TicketLinkList.module.scss";

export default function TicketLinkList({ place }) {
  if (!place?.id) return null;
  const links = resolveTicketLinks(place.id);
  if (links.length === 0) return null;

  return (
    <section className={styles.list} aria-label={`${place.name} üçün bilet linkləri`}>
      {links.map((ticket) => <div className={styles.option} key={`${ticket.provider}-${ticket.url}`}>
        {ticket.sponsored && <div className={styles.sponsorInfo}>
          <small>Sponsor: {ticket.provider}</small>
          <p>Bu linkdən bilet alışı layihəyə komissiya qazandıra bilər.</p>
        </div>}
        <a
          className={styles.link}
          href={ticket.url}
          target="_blank"
          rel={ticket.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
          aria-label={`Bilet al: ${place.name} — ${ticket.provider}`}
        >
          {ticket.sponsored ? (ticket.label || "Bilet al") : `${ticket.label || "Bilet al"} · ${ticket.provider}`}
        </a>
      </div>)}
    </section>
  );
}
