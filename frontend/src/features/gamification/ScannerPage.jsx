import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Check, QrCode } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiPost, apiRequest } from "../../services/api";
import { celebrateLantern } from "../home/lanternEffects";
import styles from "./ContentPages.module.scss";
import { translate as t } from "../../i18n/i18n";

export default function ScannerPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const taskId = search.get("taskId");
  const placeSlug = search.get("place");
  const journeyId = search.get("journey");
  const journeyQuery = journeyId ? `&journey=${encodeURIComponent(journeyId)}` : "";
  const coop = search.get("coop") === "1";
  const checkin = search.get("checkin") === "1";
  const demoEnabled = import.meta.env.VITE_DEMO_MODE === "true";
  const [result, setResult] = useState("");
  const [manual, setManual] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const container = document.getElementById("standalone-qr-reader");
    if (!container) return undefined;
    const scanner = new Html5Qrcode("standalone-qr-reader");
    scanner.start({ facingMode: "environment" }, { fps: 8, qrbox: 220 }, (text) => {
      setResult(text);
      scanner.stop().catch(() => {});
    }, () => {}).catch((cause) => {
      if (!active) return;
      setUnavailable(true);
      setPermissionMessage(cause?.name === "NotAllowedError" ? "Kamera icazəsi verilmədi. Kodu əl ilə daxil edə bilərsən." : "Kamera əlçatan deyil. Kodu əl ilə daxil edə bilərsən.");
    });
    return () => { active = false; if (scanner.isScanning) scanner.stop().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (result && !busy) void processCode(result);
    // processCode intentionally reacts only to a newly scanned value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  async function processCode(raw, { demo = false } = {}) {
    if (!raw || busy) return;
    setBusy(true); setError("");
    try {
      let targetTaskId = taskId;
      let targetSlug = placeSlug;
      if (!targetTaskId || !targetSlug) {
        const match = raw.match(/^\/q\/([^/]+)\/([^/]+)\/(\d+)\./);
        if (!match) throw new Error("QR kodun formatı düzgün deyil.");
        targetSlug ||= match[1];
        const detail = await apiRequest(`/places/${encodeURIComponent(targetSlug)}`);
        targetTaskId ||= detail.tasks.find((task) => task.code === match[2])?.id;
        if (!targetTaskId) throw new Error("Bu QR koda uyğun tapşırıq tapılmadı.");
      }
      let response;
      if (checkin) {
        if (demo) {
          await apiPost(`/demo/checkin/${encodeURIComponent(targetTaskId)}`, {});
          response = await apiPost(`/tasks/${encodeURIComponent(targetTaskId)}/complete`, { qrToken: raw });
        } else {
          response = await validateLocation(targetSlug || "", targetTaskId);
        }
      } else if (coop) {
        response = await apiPost(`/coop/${encodeURIComponent(targetTaskId)}/join`, { qrToken: raw });
      } else {
        response = await apiPost(`/tasks/${encodeURIComponent(targetTaskId)}/complete`, { qrToken: raw });
      }
      if (!coop) window.dispatchEvent(new Event("chiraq:xp-updated"));
      if (coop && response.completed) celebrateLantern();
      if (coop) navigate(`/quests/${encodeURIComponent(targetTaskId)}?place=${encodeURIComponent(targetSlug || "")}&sessionId=${encodeURIComponent(response.session_id)}${journeyQuery}`);
      else navigate(`/quests/${encodeURIComponent(targetTaskId)}?place=${encodeURIComponent(targetSlug || "")}${journeyQuery}`, { state: { completion: response } });
    } catch (cause) {
      setError(cause.message || "QR kod təsdiqlənmədi.");
      setBusy(false);
    }
  }

  async function validateLocation(slug, id) {
    const place = await apiRequest(`/places/${encodeURIComponent(slug)}`);
    if (!navigator.geolocation) throw new Error("Bu cihazda GPS dəstəyi yoxdur.");
    const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }));
    const check = await apiPost("/checkins", { placeId: place.id, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
    if (!check.valid) throw new Error("GPS mövqeyi pin radiusundan kənardadır. Təkrar cəhd et.");
    return apiPost(`/tasks/${encodeURIComponent(id)}/complete`, {});
  }

  async function demoScan() {
    if (!demoEnabled || !taskId || busy) return;
    setError(""); setBusy(true);
    try {
      const code = await apiRequest(`/demo/qr/${encodeURIComponent(taskId)}`);
      await processCode(code.qr_payload, { demo: true });
    } catch (cause) { setError(cause.message || "Demo QR alınmadı."); setBusy(false); }
  }

  async function checkinNow() {
    if (!taskId || !placeSlug || busy) return;
    setBusy(true); setError("");
    try {
      const response = await validateLocation(placeSlug, taskId);
      window.dispatchEvent(new Event("chiraq:xp-updated"));
      navigate(`/quests/${encodeURIComponent(taskId)}?place=${encodeURIComponent(placeSlug)}${journeyQuery}`, { state: { completion: response } });
    } catch (cause) {
      const message = cause.code === 1 ? "Məkan icazəsi verilmədi. GPS yoxlaması üçün brauzer icazəsini aç." : cause.message;
      setError(message || "GPS yoxlaması baş tutmadı.");
    } finally { setBusy(false); }
  }

  return <section className={styles.page}>
    <Link to={placeSlug ? `/museums/${encodeURIComponent(placeSlug)}${journeyId ? `?journey=${encodeURIComponent(journeyId)}` : ""}` : "/map"} className={styles.back}><ArrowLeft size={16}/>{t("Geri qayıt")}</Link>
    <article className={styles.hero}><p className={styles.kicker}><QrCode size={14}/>{t("QR skaner")}</p><h1>{t("Muzey kodunu oxut")}</h1><p>{t("Kameranı eksponatın yanındakı QR koduna yönəlt. Kamera işləməsə, kodu əl ilə əlavə et.")}</p>
      {permissionMessage && <p role="status">{t(permissionMessage)}</p>}
      {!checkin && <div id="standalone-qr-reader" style={{ minHeight: 240, overflow: "hidden", borderRadius: 12, background: "#080d29" }}/>} 
      {checkin && <button className={styles.action} type="button" onClick={checkinNow} disabled={busy}>{busy ? t("GPS yoxlanılır…") : t("GPS mövqeyini təsdiqlə")}</button>}
      {!checkin && <form onSubmit={(event) => { event.preventDefault(); setResult(manual.trim()); }}><label className={styles.answerLabel}>{t("Kodu əl ilə daxil et")}<input value={manual} onChange={(event) => setManual(event.target.value)} maxLength={500} placeholder="/q/məkan/kod/versiya.imza"/></label><button className={styles.action} type="submit" disabled={!manual.trim() || busy}>{busy ? t("Yoxlanılır…") : t("Kodu yoxla")}</button></form>}
      {demoEnabled && taskId && <button type="button" className={styles.secondary} onClick={demoScan} disabled={busy}>{t("Demo skan")}</button>}
      {error && <p role="alert" className={styles.error}>{t(error)}</p>}
      {result && !error && <p className={styles.reward}><Check size={16}/>{t(unavailable ? "Kod daxil edildi" : "QR kod oxundu")}</p>}
    </article>
  </section>;
}
