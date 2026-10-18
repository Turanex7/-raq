import { Gem, PackageOpen } from "lucide-react";
import styles from "../GamePage.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function Inventory({ artifactCollected }) {
  return (
    <div className={styles.inventory}>
      <span><PackageOpen size={14} />{t("Çantam")}</span>
      <div className={styles.artifactSlot + (artifactCollected ? " " + styles.filled : "")}>{artifactCollected ? <Gem size={20} /> : <span>?</span>}</div>
    </div>
  );
}
