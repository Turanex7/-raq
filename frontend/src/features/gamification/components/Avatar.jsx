import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import styles from "./Avatar.module.scss";
import nizami from "../../../assets/avatars/nizami.jpg";
import uzeyir from "../../../assets/avatars/uzeyir.jpg";
import nasimi from "../../../assets/avatars/nasimi.jpg";
import natavan from "../../../assets/avatars/natavan.jpg";
import babek from "../../../assets/avatars/babek.jpg";

const images = { nizami, uzeyir, nesimi: nasimi, natavan, babek };
const names = {
  nizami: "Nizami Gəncəvi",
  uzeyir: "Üzeyir Hacıbəyov",
  nesimi: "İmadəddin Nəsimi",
  natavan: "Xurşidbanu Natəvan",
  babek: "Babək",
};

export default function Avatar({ avatarId, avatarName, fallbackName, size = 40, locked = false, className = "" }) {
  const [failedImage, setFailedImage] = useState("");
  const image = images[avatarId];
  const name = avatarName || names[avatarId] || fallbackName || "Avatar";
  const firstLetter = name.trim().slice(0, 1).toLocaleUpperCase("az-AZ") || "Ç";
  const classNames = [styles.avatar, locked && styles.locked, className].filter(Boolean).join(" ");

  return <span className={classNames} style={{ "--avatar-size": `${size}px` }}>
    {image && failedImage !== image
      ? <img src={image} alt={name} onError={() => setFailedImage(image)} />
      : <span className={styles.fallback} role="img" aria-label={name}>{firstLetter}</span>}
    {locked && <span className={styles.lock} aria-hidden="true"><LockKeyhole size={Math.max(12, Math.round(size * 0.32))} strokeWidth={2.5}/></span>}
  </span>;
}
