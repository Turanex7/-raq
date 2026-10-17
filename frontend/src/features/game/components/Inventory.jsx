import { Gem, PackageOpen } from "lucide-react";
import styles from "../GamePage.module.scss";

export default function Inventory({ artifactCollected }) {
  return (
    <div className={styles.inventory}>
      <span><PackageOpen size={14} />Çantam</span>
      <div className={styles.artifactSlot + (artifactCollected ? " " + styles.filled : "")}>{artifactCollected ? <Gem size={20} /> : <span>?</span>}</div>
    </div>
  );
}
