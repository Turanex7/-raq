const SOUND_KEY = "chiraq_lantern_sound";

export function getLanternSoundEnabled() {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

export function setLanternSoundEnabled(enabled) {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // The preference is optional; a storage restriction should not block play.
  }
}

export function playLanternChime() {
  if (!getLanternSoundEnabled() || typeof window === "undefined") return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  try {
    const context = new Audio();
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(620, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.16);
    volume.gain.setValueAtTime(0.0001, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);
    volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
    oscillator.onended = () => { void context.close(); };
  } catch {
    // Sound is decorative and never affects task completion.
  }
}

export function celebrateLantern() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(55);
  playLanternChime();
}
