import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MuseumMarker from "./MuseumMarker";
import styles from "./MuseumMap.module.scss";

const BAKU_CENTER = [40.382, 49.858];

function MapReadySignal() {
  useMapEvents({ load: () => undefined });
  return null;
}

export default function MuseumMap({ museums }) {
  const [selectedMuseum, setSelectedMuseum] = useState(null);

  return (
    <MapContainer
      center={BAKU_CENTER}
      zoom={13}
      minZoom={11}
      maxZoom={18}
      zoomControl={false}
      className={styles.map}
      scrollWheelZoom
      aria-label="Interactive map of Baku museums"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <MapReadySignal />

      {museums.map((museum) => (
        <MuseumMarker
          key={museum.id}
          museum={museum}
          selected={selectedMuseum === museum.id}
          onSelect={() => setSelectedMuseum(museum.id)}
        />
      ))}

      <CircleMarker
        center={BAKU_CENTER}
        radius={4}
        pathOptions={{ color: "#a0e4c9", fillColor: "#a0e4c9", fillOpacity: 1 }}
      >
        <Popup className={styles.cityPopup}>You are exploring Baku</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
