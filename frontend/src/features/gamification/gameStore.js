import { useSyncExternalStore } from "react";
import { GAME_CONFIG, NEXT_WEEK_PINS, UNIVERSITIES, WEEKLY_PINS } from "./gameConfig";
import { applyTieBreak, assignPrizes, getWeeklyXp, multiplierForLastWeek, rankUniversities } from "./gameLogic";

const SEEDED_NAMES = [
  "Aysel Məmmədova", "Nihad Quliyev", "Leyla Hüseynova", "Kamran Əliyev", "Fəridə İsmayılova",
  "Orxan Həsənov", "Nərmin Rzayeva", "Murad Cəfərov", "Günel Abdullayeva", "Tural Məmmədli",
  "Sevinc İbrahimova", "Elvin Qasımov", "Zəhra Vəliyeva", "Rəşad Əhmədov", "Ayan Süleymanlı",
  "Fuad Babayev", "Lalə Kərimova", "Emin Mustafayev", "Səbinə Hacıyeva", "Anar Məlikov",
  "Mələk Hümbətova", "Cavid İsmayılov", "Aytac Nəcəfova", "Sadiq Abbasov", "Dilarə Xəlilova",
  "Ramin Cəbrayılov", "Fidan Məmmədli", "İlkin Rəhimov", "Nigar Əlizadə", "Vüsal Həsənli",
  "Xədicə Əliyeva", "Eldar Qurbanov", "Gülər Sadıqova", "Samir Məmmədov", "Aminə Orucova",
  "Təhminə Kərimova", "Kənan Şirinov", "Ülkər Nəsirova", "Elçin Rüstəmov", "Zaurə Quliyeva",
];
const seededUsers = Array.from({ length: 40 }, (_, i) => ({
  id: `student-${i}`, name: SEEDED_NAMES[i],
  university: UNIVERSITIES[i < 8 ? 0 : i < 14 ? 1 : i < 19 ? 2 : i < 23 ? 3 : i < 29 ? 4 : i < 34 ? 5 : 6].name,
  xp: 80 + ((i * 137) % 980), weeklyXp: 80 + ((i * 137) % 980), correctAnswers: (i * 3) % 8, reachedAt: 1000 + i * 130,
}));
seededUsers[0] = { ...seededUsers[0], id: "user_demo", name: "Aysel Məmmədova", university: UNIVERSITIES[2].name, xp: 350, weeklyXp: 0, correctAnswers: 2, reachedAt: 1700 };
const init = {
  now: new Date("2026-10-17T11:00:00"), weekLabel: "12–18 oktyabr", weekTheme: "Muzey həftəsi", pins: WEEKLY_PINS, completed: [], cards: [
    { id: "old-1", week: "28 sentyabr–4 oktyabr", name: "Şirvanşahlar sarayı", art: "", rarity: "Nadir" },
    { id: "old-2", week: "5–11 oktyabr", name: "Qız qalası", art: "", rarity: "Adi" },
  ], users: seededUsers, currentUserId: "user_demo", multiplierRank: 1, gpsId: null, teleportFlag: false, qrScanned: false, modalPinId: null, demoOpen: false, streakOverride: null, lastLocation: null, lastWeekPrizes: null,
};
let state = init;
const listeners = new Set();
function emit() { listeners.forEach((listener) => listener()); }
export function getState() { return state; }
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function useGame() { return useSyncExternalStore(subscribe, getState); }
export const currentGameUser = () => state.users.find((user) => user.id === state.currentUserId);
export function setDemo(patch) { state = { ...state, ...patch }; emit(); }
export function openPin(pinId) { state = { ...state, modalPinId: pinId }; emit(); }
export function closePin() { state = { ...state, modalPinId: null }; emit(); }
export function signIn(email, studentCode) {
  const domain = email?.split("@")[1]?.toLowerCase();
  const uni = UNIVERSITIES.find((item) => item.domains.includes(domain));
  const user = currentGameUser();
  if (user.seasonLocked) return;
  const university = uni?.name || (studentCode ? "Açıq liqa" : user.university);
  state = { ...state, users: state.users.map((item) => item.id === user.id ? { ...item, university, seasonLocked: true } : item) }; emit();
}
export function addLifetimeXp(amount) {
  if (amount <= 0) return;
  state = { ...state, users: state.users.map((user) => user.id === state.currentUserId ? { ...user, xp: user.xp + amount } : user) };
  emit();
}
export function awardPin(pin) {
  // SERVER-SIDE IN PRODUCTION: validate GPS radius, QR/photo evidence, rare code, and teleport signals before awarding XP.
  if (state.completed.some((item) => item.pinId === pin.id)) return;
  const day = (state.now.getDay() + GAME_CONFIG.daysPerWeek - 1) % GAME_CONFIG.daysPerWeek;
  const baseXp = GAME_CONFIG.xp[pin.type];
  const completed = [...state.completed, { pinId: pin.id, day, baseXp, correct: false, quizAnswered: false, quizAnswer: "", reachedAt: state.now.getTime() }];
  const multiplier = multiplierForLastWeek(state.multiplierRank);
  const xp = getWeeklyXp(completed, multiplier);
  const card = { id: `${pin.id}-${state.now.getTime()}`, week: state.weekLabel, name: pin.name, art: "", rarity: pin.type === "rare" ? "Epik" : pin.type === "museum" ? "Nadir" : "Adi", coOp: false };
  const previousWeeklyXp = getWeeklyXp(state.completed, multiplier);
  state = { ...state, completed, cards: [card, ...state.cards], users: state.users.map((user) => user.id === state.currentUserId ? { ...user, xp: user.xp + (xp - previousWeeklyXp), weeklyXp: xp, reachedAt: state.now.getTime() } : user) };
  emit();
}
export function recordQuiz(pin, answer) {
  const completion = state.completed.find((item) => item.pinId === pin.id);
  if (!completion || completion.quizAnswered) return;
  const correct = answer.toLowerCase().trim() === pin.answer;
  state = { ...state, completed: state.completed.map((item) => item.pinId === pin.id ? { ...item, correct, quizAnswered: true, quizAnswer: answer.trim() } : item), users: state.users.map((user) => user.id === state.currentUserId ? { ...user, correctAnswers: user.correctAnswers + Number(correct) } : user), modalPinId: null };
  emit();
}
export function setClock(value) { setDemo({ now: new Date(value) }); }
export function jumpWeekEnd() {
  const users = applyTieBreak(state.users);
  const ranking = rankUniversities(state.users);
  const rank = ranking.findIndex((item) => item.university === currentGameUser().university && item.eligible) + 1;
  const overallPrize = state.weekTheme === "Şəhər həftəsi" ? "Kino və ya oyun vauçeri" : "Xalça Muzeyi bileti";
  const universityPrize = state.weekTheme === "Şəhər həftəsi" ? "Şəhər təcrübəsi üçün hədiyyə" : "Muzey dostu üçün hədiyyə kartı";
  const winners = assignPrizes(users, overallPrize, universityPrize);
  const lastWeekPrizes = { ...winners, weekLabel: state.weekLabel, weekTheme: state.weekTheme, multiplierRank: rank > 0 ? rank : 99 };
  const nextUsers = state.users.map((user) => ({ ...user, weeklyXp: 0, correctAnswers: 0 }));
  state = { ...state, users: nextUsers, pins: NEXT_WEEK_PINS, weekLabel: "19–25 oktyabr", weekTheme: "Şəhər həftəsi", completed: [], multiplierRank: rank > 0 ? rank : 99, now: new Date("2026-10-19T09:00:00"), lastWeekPrizes };
  emit();
}
export function triggerCoop(pin) {
  const card = { id: `coop-${Date.now()}`, week: state.weekLabel, name: `${pin.name} · Co-Op`, art: "🤝", rarity: "Co-Op", coOp: true };
  state = { ...state, cards: [card, ...state.cards] }; emit();
}
export function chooseUser(id) { setDemo({ currentUserId: id }); }
