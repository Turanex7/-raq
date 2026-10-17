import { Link } from "react-router-dom";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ArrowUpRight, MapPin } from "lucide-react";
import styles from "./MuseumMarker.module.scss";

function createMarkerIcon(accent) {
  const color = {
    gold: "#f5b942",
    mint: "#a0e4c9",
    purple: "#c29af3",
    green: "#009a69",
  }[accent] ?? "#a0e4c9";

  return L.divIcon({
    className: styles.markerIcon,
    html: `<span style="--marker-color: ${color}"><span class="marker-glyph">✦</span></span>`,
    iconSize: [42, 48],
    iconAnchor: [21, 44],
    popupAnchor: [0, -40],
  });
}

export default function MuseumMarker({ museum, selected, onSelect }) {
  return (
    <Marker
      position={museum.location}
      icon={createMarkerIcon(museum.accent)}
      eventHandlers={{ click: onSelect }}
      zIndexOffset={selected ? 1000 : 0}
    >
      <Popup className={styles.popup} closeButton={false}>
        <div className={styles.popupContent}>
          <span className={styles.category}>
            <MapPin size={12} aria-hidden="true" />
            {museum.category}
          </span>
          <h2>{museum.name}</h2>
          <p>{museum.description}</p>
          <Link to={"/museums/" + museum.id} className={styles.exploreLink}>
            Explore museum
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
