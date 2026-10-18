import { resolveTicketLinks } from "../config/tickets.js";
import { translate as t } from "../i18n/i18n";
import styles from "./TicketLinkList.module.scss";

export default function TicketLinkList({ place }) {
  if (!place?.id) return null;
  const links = resolveTicketLinks(place.id);
  if (links.length === 0) return null;

  return (
    <section className={styles.list} aria-label={t("{place} üçün bilet və məkan linkləri", { place: t(place.name) })}>
      {links.map((ticket) => <div className={styles.option} key={`${ticket.provider}-${ticket.url}`}>
        {ticket.sponsored && <div className={styles.sponsorInfo}>
          <small>{t("Sponsor")}: {ticket.provider}</small>
          <p>{t("Bu linkdən bilet alışı layihəyə komissiya qazandıra bilər.")}</p>
        </div>}
        <a
          className={styles.link}
          href={ticket.url}
          target="_blank"
          rel={ticket.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
          aria-label={`${t("Bilet al")}: ${t(place.name)} — ${ticket.provider}`}
        >
          {ticket.sponsored ? t(ticket.label || "Bilet al") : `${t(ticket.label || "Bilet al")} · ${ticket.provider}`}
        </a>
      </div>)}
    </section>
  );
}
