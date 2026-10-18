import { useEffect, useState } from "react";
import styles from "./WeeklyResetCountdown.module.scss";
import { translate as t } from "../../../i18n/i18n";

export default function WeeklyResetCountdown({ secondsRemaining, className = "" }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 60), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, (Number(secondsRemaining) || 0) - elapsedSeconds);
  const days = Math.floor(remaining / 86_400);
  const hours = Math.floor(remaining % 86_400 / 3_600);
  return <div className={`${styles.wrap} ${className}`}>
    <small>{t("Həftə sıfırlanmasına")}</small>
    <b>{days} {t("gün")} {hours} {t("saat")}</b>
  </div>;
}
