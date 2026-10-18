import { MINI_GAME_CONFIG } from "../features/game/minigames/miniGameConfig.js";

const STORAGE_KEY = "chiraq_demo_api_v1";
const LEVEL_XP = 250;
const STREAK_DAYS = 7;
const STREAK_REWARD_XP = 10;
const GROUP_MULTIPLIERS = [1, 1.2, 1.3, 1.4];
const TICKETED_PLACE_BONUS_XP = 20;
const TICKETED_PLACE_SLUGS = new Set(["carpet-museum", "national-history", "modern-art", "literature-museum", "miniature-book-museum", "ateshgah"]);

const UNIVERSITIES = [
  ["bdu", "Bakı Dövlət Universiteti", "BDU"], ["ada", "ADA Universiteti", "ADA"],
  ["unec", "Azərbaycan Dövlət İqtisad Universiteti", "UNEC"], ["aztu", "Azərbaycan Texniki Universiteti", "AzTU"],
  ["adnsu", "Azərbaycan Dövlət Neft və Sənaye Universiteti", "ADNSU"], ["atmu", "Azərbaycan Turizm və Menecment Universiteti", "ATMU"],
  ["khazar", "Xəzər Universiteti", "Xəzər"], ["atu", "Azərbaycan Tibb Universiteti", "ATU"],
  ["banm", "Bakı Ali Neft Məktəbi", "BANM"], ["adpu", "Azərbaycan Dövlət Pedaqoji Universiteti", "ADPU"],
  ["azmiu", "Azərbaycan Memarlıq və İnşaat Universiteti", "AzMİU"], ["bsu-slavyan", "Bakı Slavyan Universiteti", "BSU"],
  ["adu", "Azərbaycan Dillər Universiteti", "ADU"], ["beu", "Bakı Mühəndislik Universiteti", "BMU"],
  ["bma", "Üzeyir Hacıbəyli adına Bakı Musiqi Akademiyası", "BMA"], ["admiu", "Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti", "ADMİU"],
  ["sdu", "Sumqayıt Dövlət Universiteti", "SDU"], ["lsu", "Lənkəran Dövlət Universiteti", "LDU"],
  ["gsu", "Gəncə Dövlət Universiteti", "GDU"], ["atu-gence", "Azərbaycan Texnologiya Universiteti", "ATU"],
  ["mdu", "Mingəçevir Dövlət Universiteti", "MDU"], ["ndu", "Naxçıvan Dövlət Universiteti", "NDU"],
  ["azra", "Azərbaycan Dövlət Rəssamlıq Akademiyası", "ADRA"], ["konservatoriya", "Azərbaycan Milli Konservatoriyası", "AMK"],
  ["nmi", "Naxçıvan Müəllimlər İnstitutu", "NMİ"], ["qarabag", "Qarabağ Universiteti", "Qarabağ"],
  ["tau", "Türkiyə-Azərbaycan Universiteti", "TAU"], ["sport", "Azərbaycan İdman Akademiyası", "AİA"],
  ["adau", "Azərbaycan Dövlət Aqrar Universiteti", "ADAU"], ["dia", "Prezident yanında Dövlət İdarəçilik Akademiyası", "DİA"],
  ["adda", "Azərbaycan Dövlət Dəniz Akademiyası", "ADDA"], ["naa", "Milli Aviasiya Akademiyası", "MAA"],
  ["bxa", "Bakı Xoreoqrafiya Akademiyası", "BXA"], ["ait", "Azərbaycan İlahiyyat İnstitutu", "Aİİ"],
  ["qku", "Qərbi Kaspi Universiteti", "QKU"], ["au", "Azərbaycan Universiteti", "AU"],
  ["oyu", "Odlar Yurdu Universiteti", "OYU"], ["baau", "Bakı Avrasiya Universiteti", "BAAU"],
  ["aku", "Azərbaycan Kooperasiya Universiteti", "AKU"], ["bbu", "Bakı Biznes Universiteti", "BBU"],
  ["aesma", "Azərbaycan Əmək və Sosial Münasibətlər Akademiyası", "AESMA"],
].map(([id, name, shortName]) => ({ id, name, shortName }));

const PLACES = [
  ["carpet-museum", "Azərbaycan Milli Xalça Muzeyi", "Dənizkənarı Bulvar", "museum", 40.3593, 49.8355, "Azərbaycan xalçaçılıq məktəblərini və naxış ənənələrini araşdır.", "epik"],
  ["national-history", "Milli Azərbaycan Tarixi Muzeyi", "Şəhər mərkəzi", "museum", 40.3697, 49.8352, "Azərbaycan tarixinin müxtəlif dövrlərini muzey kolleksiyası ilə tanı.", "nadir"],
  ["heydar-aliyev", "Heydər Əliyev Mərkəzi", "Nərimanov", "museum", 40.3953, 49.8671, "Memarlıq və mədəniyyət sərgilərini kəşf et.", "nadir"],
  ["modern-art", "Müasir İncəsənət Muzeyi", "Yusif Səfərov küçəsi", "museum", 40.3805, 49.8545, "Azərbaycan müasir incəsənətinin seçilmiş nümunələrinə bax.", "adi"],
  ["literature-museum", "Nizami Gəncəvi adına Ədəbiyyat Muzeyi", "Fəvvarələr Meydanı", "museum", 40.3692, 49.8357, "Azərbaycan ədəbiyyatının irsini və klassik müəllifləri tanı.", "nadir"],
  ["miniature-book-museum", "Miniatür Kitab Muzeyi", "İçərişəhər", "museum", 40.3667, 49.8346, "İçərişəhərdəki miniatür kitab kolleksiyasını kəşf et.", "nadir"],
  ["28-may", "28 May meydanı", "Mərkəz", "outdoor", 40.3792, 49.8467, "Şəhərin gündəlik ritmini açıq meydandan müşahidə et.", "adi"],
  ["bulvar", "Dənizkənarı Bulvar", "Sahil", "outdoor", 40.3659, 49.8401, "Xəzər sahilində şəhərin tarixini və gündəlik həyatını kəşf et.", "adi"],
  ["icherisheher", "İçərişəhər", "İçərişəhər", "outdoor", 40.3661, 49.8374, "Qala divarları və tarixi küçələri araşdır.", "epik"],
  ["fountains", "Fəvvarələr Meydanı", "Mərkəz", "outdoor", 40.3727, 49.8372, "Şəhər mərkəzinin memarlığına və həyatına nəzər sal.", "adi"],
  ["ateshgah", "Suraxanı Atəşgahı", "Suraxanı", "outdoor", 40.4167, 50.0050, "Abşeronun alovla bağlı tarixi məkanını ziyarət et.", "epik"],
].map(([slug, name, district, type, lat, lng, description, rarity], index) => ({
  id: "place-" + slug, slug, name, district, type, lat, lng, description, rarity,
  radius_m: type === "museum" ? 60 : 50, status: index < 8 ? "open" : "locked",
  is_ticketed: TICKETED_PLACE_SLUGS.has(slug), ticketed_place_bonus_xp: TICKETED_PLACE_SLUGS.has(slug) ? TICKETED_PLACE_BONUS_XP : 0,
}));

const AVATARS = [
  { id: "nizami", name: "Nizami Gəncəvi", unlock_level: 1, illustration: "nizami" },
  { id: "uzeyir", name: "Üzeyir Hacıbəyov", unlock_level: 2, illustration: "uzeyir" },
  { id: "nesimi", name: "İmadəddin Nəsimi", unlock_level: 3, illustration: "nesimi" },
  { id: "natavan", name: "Xurşidbanu Natəvan", unlock_level: 4, illustration: "natavan" },
  { id: "babek", name: "Babək", unlock_level: 6, illustration: "babek" },
];

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

const TERRITORY_SEED_AWARDS = [
  [20, "carpet-museum", "carpet-museum-quiz", false],
  [0, "national-history", "national-history-quiz", true],
  [5, "national-history", "national-history-quiz", false],
  [10, "heydar-aliyev", "heydar-aliyev-quiz", true],
  [11, "heydar-aliyev", "heydar-aliyev-quiz", false],
  [15, "heydar-aliyev", "heydar-aliyev-visit", false],
  [0, "modern-art", "modern-art-visit", false],
  [1, "modern-art", "modern-art-quiz", true],
  [5, "modern-art", "modern-art-quiz", false],
  [28, "literature-museum", "literature-museum-challenge", false],
  [29, "literature-museum", "literature-museum-visit", false],
  [15, "literature-museum", "literature-museum-visit", false],
  [36, "miniature-book-museum", "miniature-book-museum-challenge", false],
  [37, "miniature-book-museum", "miniature-book-museum-quiz", true],
  [15, "miniature-book-museum", "miniature-book-museum-visit", false],
  [29, "bulvar", "bulvar-visit", false],
];

const initialState = () => ({
  users: [], xp_events: [], completions: [], checkins: [], lantern_ignitions: [],
  groups: [], coop_sessions: [], souvenirs: [], territory_overrides: {},
  week_advance: 0, seed_season_id: null, previous_final: [],
});

function localStorageOrNull() {
  try { return globalThis.window?.localStorage || globalThis.localStorage || null; }
  catch { return null; }
}

function readState() {
  const storage = localStorageOrNull();
  if (!storage) return initialState();
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    return { ...initialState(), ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch { return initialState(); }
}

function writeState(state) {
  const storage = localStorageOrNull();
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Browser storage may be disabled. */ }
}

export function clearDemoApiState() {
  const storage = localStorageOrNull();
  try {
    storage?.removeItem(STORAGE_KEY);
    storage?.removeItem("chiraq_token");
  } catch { /* Browser storage may be disabled. */ }
}

function copy(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
}

function parseBody(init) {
  if (!init?.body) return {};
  if (typeof init.body !== "string") return init.body;
  try { return JSON.parse(init.body); } catch { return {}; }
}

function bakuDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baku", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}

function shiftDateKey(key, days) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function seasonFor(state, now = new Date()) {
  const today = bakuDateKey(now);
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const monday = shiftDateKey(today, -((date.getUTCDay() + 6) % 7) + (state.week_advance || 0) * 7);
  const id = "season-" + monday;
  if (!state.seed_season_id) state.seed_season_id = id;
  const nextMonday = shiftDateKey(monday, 7);
  const start = new Date(monday + "T00:00:00+04:00").toISOString();
  const end = new Date(nextMonday + "T00:00:00+04:00").toISOString();
  return {
    id, start, end, theme: "Muzey həftəsi",
    seconds_remaining: Math.max(0, Math.floor((Date.parse(end) - now.getTime()) / 1000)),
    time_zone: "Asia/Baku",
  };
}

function universityForSeed(index) {
  if (index < 5) return "bdu";
  if (index < 10) return "ada";
  if (index < 15) return "unec";
  if (index < 20) return "aztu";
  if (index < 28) return "adnsu";
  if (index < 32) return "atmu";
  if (index < 36) return "khazar";
  return "atu";
}

function seedTaskCount(index, round = 0) {
  const overrides = { 6: 1, 27: 2, 29: 4, 32: 1, 35: 2, 36: 4 };
  const baseCount = overrides[index] || 1 + index % 4;
  return 1 + ((baseCount - 1 + round % 4) % 4);
}

function seedSpecialXp(index) {
  return TERRITORY_SEED_AWARDS
    .filter((award) => award[0] === index)
    .reduce((sum, award) => sum + xpForSeedAward(award), 0);
}

function xpForSeedAward(award) {
  const taskId = award[2];
  const taskXp = taskId.endsWith("-quiz") ? (award[3] ? 20 : 8) : taskId.endsWith("-challenge") ? 40 : 10;
  return taskXp + (TICKETED_PLACE_SLUGS.has(award[1]) ? TICKETED_PLACE_BONUS_XP : 0);
}

function seedBoardRow(index, round) {
  const taskXp = [10, index % 2 === 0 ? 20 : 8, 10, 40];
  const count = seedTaskCount(index, round);
  const weeklyXp = taskXp.slice(0, count).reduce((sum, xp) => sum + xp, 0) + seedSpecialXp(index);
  const firstName = SEEDED_NAMES[index].split(" ")[0];
  const lastName = SEEDED_NAMES[index].split(" ").at(-1);
  return {
    id: "seed-" + String(index + 1).padStart(2, "0"),
    full_name: SEEDED_NAMES[index], name: firstName + " " + lastName.slice(0, 1) + ".",
    university_id: universityForSeed(index), weekly_xp: weeklyXp,
    lifetime_xp: Math.max(weeklyXp, taskXp.slice(0, seedTaskCount(index)).reduce((sum, xp) => sum + xp, 0) + seedSpecialXp(index)),
    correct_answers: count > 0 && index % 2 === 0 ? count : 0,
    reached_at: new Date(Date.now() - (index + 1) * 60000).toISOString(),
  };
}

function currentToken() {
  const storage = localStorageOrNull();
  try { return storage?.getItem("chiraq_token") || ""; } catch { return ""; }
}

function currentUser(state) {
  const token = currentToken();
  if (!token.startsWith("ciraq-demo:")) return null;
  const id = token.slice("ciraq-demo:".length);
  return state.users.find((user) => user.id === id) || null;
}

function xpEvents(state, userId, seasonId = null) {
  return state.xp_events.filter((event) => event.user_id === userId && (!seasonId || event.season_id === seasonId));
}

function userXp(state, userId, seasonId = null) {
  return xpEvents(state, userId, seasonId).reduce((sum, event) => sum + event.amount, 0);
}

function lanternProgress(state, userId, now = new Date()) {
  const today = bakuDateKey(now);
  const rows = (state.lantern_ignitions || []).filter((row) => row.user_id === userId).sort((a, b) => a.date.localeCompare(b.date));
  const latest = rows.at(-1);
  const missedDay = Boolean(latest && latest.date < shiftDateKey(today, -1));
  const streakDays = !latest || missedDay ? 0 : latest.consecutive_days;
  return {
    streak_days: streakDays,
    progress_day: streakDays ? (streakDays - 1) % STREAK_DAYS + 1 : 0,
    streak_target: STREAK_DAYS,
    milestone_xp: STREAK_REWARD_XP,
    today_lit: latest?.date === today,
    missed_day: missedDay,
  };
}

function userView(state, user) {
  const season = seasonFor(state);
  const university = UNIVERSITIES.find((row) => row.id === user.universityId);
  const lifetimeXp = userXp(state, user.id);
  return {
    id: user.id, name: user.name, email: user.email,
    university: university?.name || "", universityId: user.universityId,
    avatarId: user.avatarId, visitedMuseumLast12Months: user.visitedMuseumLast12Months,
    firstMuseumVisitCompleted: Boolean(user.firstMuseumVisitCompleted),
    lifetimeXp, weeklyXp: userXp(state, user.id, season.id),
    level: Math.floor(lifetimeXp / LEVEL_XP) + 1,
    lantern: lanternProgress(state, user.id),
  };
}

function makeTasks(place, state, user) {
  const outdoor = place.type === "outdoor";
  const definitions = [
    { code: "visit", title: outdoor ? "Məkanı kəşf et" : "Eksponatı kəşf et", type: outdoor ? "find" : "qr_scan", difficulty: "easy", xp: 10, description: "Məkanın hekayəsini oxu və ilk izi tamamla.", payload: null },
    { code: "quiz", title: "Qısa bilik sualı", type: "quiz", difficulty: "medium", xp: 20, description: place.description, payload: { question: place.name + " hansı şəhərdə yerləşir?", choices: [], answer: "bakı", fact: "Bakı Azərbaycanın paytaxtıdır." } },
    { code: "vote", title: "Sənin seçimin", type: "vote", difficulty: "easy", xp: 10, description: "Məkanda ən çox diqqətini çəkən detalı seç.", payload: { question: "Bu məkanda ən çox nə diqqətini çəkdi?", choices: ["Memarlıq", "Tarix", "İncəsənət"] } },
    { code: "challenge", title: "Usta kəşfiyyatçının izi", type: "find", difficulty: "hard", xp: 40, description: "Məkanı diqqətlə araşdır və tarixçədən bir detal tap.", payload: { question: "Məkanla bağlı bir memarlıq və ya tarix detalını təsvir et." } },
    { code: "coop", title: "Dostlarınla birlikdə kəşf et", type: "coop", difficulty: "medium", xp: 20, coopSize: 3, description: "Üç iştirakçı QR kodunu skan edib fərqli rolların cavabını 60 dəqiqə ərzində göndərir.", payload: { question: "Komanda ilə məkanda bir detal tap." } },
  ];
  const season = seasonFor(state);
  return definitions.map((task) => {
    const id = place.slug + "-" + task.code;
    const completed = Boolean(user && state.completions.some((row) => row.user_id === user.id && row.task_id === id && row.season_id === season.id));
    return {
      id, code: task.code, title: task.title, description: task.description, type: task.type,
      difficulty: task.difficulty, xp: task.xp, coopSize: task.coopSize || 0,
      ticketed_place_bonus_xp: place.ticketed_place_bonus_xp || 0,
      needsReview: true, completed,
      payload: task.type === "quiz" ? { question: task.payload.question, choices: [] } : task.type === "vote" ? { question: task.payload.question, choices: task.payload.choices } : task.payload,
    };
  });
}

function seedTerritoryEvents(state, season, slug) {
  if (season.id !== season.seed_season_id) return [];
  const now = Date.now() - 86400000;
  return TERRITORY_SEED_AWARDS.filter((row) => row[1] === slug).map((row, index) => ({
    user_id: "seed-" + String(row[0] + 1).padStart(2, "0"),
    university_id: universityForSeed(row[0]),
    amount: xpForSeedAward(row), created_at_utc: new Date(now + index * 7 * 60000).toISOString(),
  }));
}

function roundScore(value) {
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (Math.abs(fraction - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(value);
}

function territoryOwner(state, season, place) {
  if (state.territory_overrides?.[place.slug]) return state.territory_overrides[place.slug];
  const seedRows = seedTerritoryEvents(state, season, place.slug);
  const ownRows = state.xp_events.filter((event) => event.season_id === season.id && event.place_id === place.id && event.kind !== "daily_lantern_streak")
    .map((event) => {
      const user = state.users.find((item) => item.id === event.user_id);
      return user ? { user_id: user.id, university_id: user.universityId, amount: event.amount, created_at_utc: event.created_at_utc } : null;
    }).filter(Boolean);
  const entries = [...seedRows, ...ownRows];
  if (!entries.length) return state.territory_overrides?.[place.slug] || null;
  const scores = new Map();
  for (const entry of entries) {
    if (!scores.has(entry.university_id)) scores.set(entry.university_id, new Map());
    const visitors = scores.get(entry.university_id);
    visitors.set(entry.user_id, (visitors.get(entry.user_id) || 0) + entry.amount);
  }
  const ranked = [...scores.entries()].map(([universityId, visitors]) => {
    const values = [...visitors.values()];
    const score = roundScore(values.reduce((sum, value) => sum + value, 0) / values.length);
    const sorted = entries.filter((entry) => entry.university_id === universityId).sort((a, b) => a.created_at_utc.localeCompare(b.created_at_utc));
    let reached = sorted.at(-1)?.created_at_utc || new Date().toISOString();
    let running = 0;
    for (const entry of sorted) {
      running += entry.amount;
      if (roundScore(running / values.length) >= score) { reached = entry.created_at_utc; break; }
    }
    return { universityId, score, participants: values.length, reached };
  }).sort((a, b) => b.score - a.score || a.reached.localeCompare(b.reached) || a.universityId.localeCompare(b.universityId));
  const top = ranked[0];
  const second = ranked[1];
  return {
    university_id: top.universityId, university: UNIVERSITIES.find((row) => row.id === top.universityId)?.shortName || "",
    score: top.score, runner_up_id: second?.universityId || null,
    runner_up: second ? UNIVERSITIES.find((row) => row.id === second.universityId)?.shortName || "" : null,
    runner_up_score: second?.score || 0, gap: second ? Math.max(0, top.score - second.score) : top.score,
    participant_count: top.participants, tied: Boolean(second && top.score === second.score && top.reached === second.reached),
    reached_at_utc: top.reached, final: false,
  };
}

function placeXpTotal(state, season, place) {
  const seededGeneral = season.id === season.seed_season_id && place.slug === "28-may"
    ? SEEDED_NAMES.reduce((sum, _, index) => {
      const count = seedTaskCount(index);
      return sum + [10, index % 2 === 0 ? 20 : 8, 10, 40].slice(0, count).reduce((a, b) => a + b, 0);
    }, 0)
    : 0;
  const seededTerritory = seedTerritoryEvents(state, season, place.slug).reduce((sum, row) => sum + row.amount, 0);
  const dynamic = state.xp_events.filter((event) => event.season_id === season.id && event.place_id === place.id).reduce((sum, event) => sum + event.amount, 0);
  return seededGeneral + seededTerritory + dynamic;
}

function groupsForUser(state, user) {
  return state.groups.filter((group) => group.members.includes(user.id));
}

function groupBonus(state, user, place) {
  const season = seasonFor(state);
  const cutoff = Date.now() - 60 * 60000;
  let currentMembers = 0;
  let groupMembers = [];
  for (const group of groupsForUser(state, user)) {
    const members = group.members.filter((id) => state.completions.some((row) => row.user_id === id && row.season_id === season.id && row.completed_at_utc >= new Date(cutoff).toISOString() && row.place_id === place.id));
    if (members.length > currentMembers) { currentMembers = members.length; groupMembers = members; }
  }
  const tier = Math.max(2, Math.min(5, Math.max(currentMembers, 3)));
  const multiplier = GROUP_MULTIPLIERS[tier - 2];
  const awarded = state.xp_events.filter((row) => row.user_id === user.id && row.season_id === season.id && row.place_id === place.id && row.kind === "group_bonus");
  return {
    minimum_members: 3, current_members: currentMembers,
    members_needed: Math.max(0, 3 - currentMembers), multiplier, window_minutes: 60,
    already_awarded: awarded.length > 0, earned_xp: awarded.reduce((sum, row) => sum + row.amount, 0),
    _participants: groupMembers,
  };
}

function detailPlace(state, place, user) {
  const season = seasonFor(state);
  const tasks = makeTasks(place, state, user).sort((a, b) => a.difficulty.localeCompare(b.difficulty));
  return {
    id: place.id, slug: place.slug, type: place.type, name: place.name, district: place.district,
    description: place.description, latitude: place.lat, longitude: place.lng, radiusMeters: place.radius_m,
    is_ticketed: Boolean(place.is_ticketed), ticketed_place_bonus_xp: place.ticketed_place_bonus_xp || 0,
    status: place.status, territory: territoryOwner(state, season, place),
    group_bonus: user ? groupBonus(state, user, place) : { minimum_members: 3, current_members: 0, members_needed: 3, multiplier: 1.2, window_minutes: 60, already_awarded: false, earned_xp: 0 },
    tasks,
  };
}

function seedBoard(state, season) {
  const rows = SEEDED_NAMES.map((_, index) => seedBoardRow(index, state.week_advance || 0));
  const user = currentUser(state);
  if (user) {
    const weekly = userXp(state, user.id, season.id);
    if (weekly > 0) rows.push({
      id: user.id, full_name: user.name, name: publicName(user.name), university_id: user.universityId,
      weekly_xp: weekly, lifetime_xp: userXp(state, user.id),
      correct_answers: state.completions.filter((row) => row.user_id === user.id && row.season_id === season.id && row.correct).length,
      reached_at: xpEvents(state, user.id, season.id).map((row) => row.created_at_utc).sort().at(-1),
      current: true,
    });
  }
  return rows.sort((a, b) => b.weekly_xp - a.weekly_xp || b.correct_answers - a.correct_answers || (a.reached_at || "").localeCompare(b.reached_at || ""));
}

function publicName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[0] + " " + parts.at(-1).slice(0, 1).toUpperCase() + "." : (parts[0] || "");
}

function territoryCount(state, season, universityId) {
  return PLACES.filter((place) => territoryOwner(state, season, place)?.university_id === universityId).length;
}

function leaderboard(state, scope, user) {
  const season = seasonFor(state);
  const all = seedBoard(state, season);
  if (scope === "league") {
    const rows = UNIVERSITIES.map((university) => {
      const active = all.filter((row) => row.university_id === university.id && row.weekly_xp > 0).sort((a, b) => b.weekly_xp - a.weekly_xp).slice(0, 10);
      const score = active.length ? roundScore(active.reduce((sum, row) => sum + row.weekly_xp, 0) / active.length) : 0;
      return {
        university_id: university.id, university: university.name, short_name: university.shortName,
        fair_score: score, participant_count: all.filter((row) => row.university_id === university.id && row.weekly_xp > 0).length,
        minimum_participants: 3, eligible: active.length >= 3, territory_count: territoryCount(state, season, university.id),
        change_vs_last_week: null, current: university.id === user.universityId,
      };
    }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.fair_score - a.fair_score || a.university_id.localeCompare(b.university_id));
    rows.forEach((row, index) => { row.rank = row.eligible ? index + 1 : null; });
    const current = rows.find((row) => row.current);
    return { scope, rows, my_rank: current?.rank || null, my_message: current?.eligible ? null : "Reytinq üçün kifayət qədər iştirakçı yoxdur", score_formula: "Top 10 aktiv üzvün orta həftəlik XP-si" };
  }
  if (scope === "open") {
    const groups = state.groups.filter((group) => group.open_league);
    const rows = groups.map((group) => {
      const members = all.filter((row) => group.members.includes(row.id));
      const active = members.filter((row) => row.weekly_xp > 0);
      return { id: group.id, name: group.name, member_count: group.members.length, fair_score: active.length ? roundScore(active.reduce((sum, row) => sum + row.weekly_xp, 0) / active.length) : 0, active_count: active.length };
    }).sort((a, b) => b.fair_score - a.fair_score);
    return { scope, rows, my_rank: null, my_message: rows.length ? null : "Hələ açıq liqa qrupuna qoşulmamısan" };
  }
  const filtered = scope === "university" ? all.filter((row) => row.university_id === user.universityId) : all;
  const rows = filtered.filter((row) => row.weekly_xp > 0).map((row, index) => ({
    rank: index + 1, id: row.id, name: row.name, university_id: row.university_id,
    weekly_xp: row.weekly_xp, lifetime_xp: row.lifetime_xp,
    correct_answers: row.correct_answers, current: row.id === user.id,
  }));
  const rank = rows.find((row) => row.current)?.rank || null;
  return { scope, rows, my_rank: rank, my_message: rank ? null : "Hələ reytinqdə deyilsən" };
}

function collection(state, user) {
  const season = seasonFor(state);
  const earnedIds = new Set(state.souvenirs.filter((row) => row.user_id === user.id).map((row) => row.id));
  const rows = [];
  for (const place of PLACES) {
    for (const rare of [false, true]) {
      const id = (rare ? "souvenir-rare-" : "souvenir-") + place.slug;
      const earned = earnedIds.has(id);
      const scanned = state.completions.some((row) => row.user_id === user.id && row.season_id === season.id && row.place_id === place.id && row.task_id === place.slug + "-visit");
      rows.push({
        id, name: rare ? "Çıraq alovu" : place.name, place: place.name,
        rarity: rare ? "nadir" : place.rarity, rare_flame: rare, earned,
        season_id: season.id, season_theme: season.theme, season_starts_at_utc: season.start,
        limited: true, status: earned ? "earned" : rare && scanned ? "missed" : "available",
      });
    }
  }
  const level = Math.floor(userXp(state, user.id) / LEVEL_XP) + 1;
  return { rows, avatars: AVATARS.map((avatar) => ({ ...avatar, UnlockLevel: avatar.unlock_level, unlocked: avatar.unlock_level <= level })) };
}

function rewards(state, user) {
  const season = seasonFor(state);
  const board = seedBoard(state, season).filter((row) => row.weekly_xp > 0);
  const first = board[0];
  const second = first ? board.find((row) => row.university_id === first.university_id && row.id !== first.id) : null;
  const firstUni = UNIVERSITIES.find((row) => row.id === first?.university_id);
  const secondUni = UNIVERSITIES.find((row) => row.id === second?.university_id);
  const rows = [];
  if (first) rows.push({ type: "overall", rank: 1, name: first.name, university_id: first.university_id, university: firstUni?.shortName, weekly_xp: first.weekly_xp, prize_eligible: true, label: "Hazırda öndə" });
  if (second) rows.push({ type: "university", rank: 2, name: second.name, university_id: second.university_id, university: secondUni?.shortName, weekly_xp: second.weekly_xp, prize_eligible: true, label: "Universitet mükafatına namizəd" });
  return { status: "provisional", season_id: season.id, theme: season.theme, closes_at_utc: season.end, rows, previous_final: state.previous_final || [], current_user_id: user.id };
}

function souvenirFor(state, user, place, rare) {
  const id = (rare ? "souvenir-rare-" : "souvenir-") + place.slug;
  if (state.souvenirs.some((row) => row.user_id === user.id && row.id === id)) return null;
  state.souvenirs.push({ user_id: user.id, id });
  return { id, name: rare ? "Çıraq alovu" : place.name, rarity: rare ? "nadir" : place.rarity };
}

function takeOverMessage(place, previousOwner) {
  const name = place.slug === "carpet-museum" ? "Xalça Muzeyini" : place.slug === "national-history" ? "Milli Tarix Muzeyini" : place.name + " məkanını";
  return name + (previousOwner?.university ? " " + previousOwner.university + "-dan fəth etdin!" : " ilk dəfə fəth etdin!");
}

function completeTask(state, user, taskId, body) {
  const taskSlug = taskId.replace(/-(visit|quiz|vote|challenge|coop)$/, "");
  const place = PLACES.find((row) => row.slug === taskSlug);
  const task = place && makeTasks(place, state, user).find((row) => row.id === taskId);
  if (!task || !place) fail(404, "task_not_found", "Tapşırıq tapılmadı.");
  if (place.status !== "open") fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
  if (task.type === "coop") fail(409, "coop_required", "Bu tapşırığı ko-op sessiyasında tamamla.");
  const season = seasonFor(state);
  if (state.completions.some((row) => row.user_id === user.id && row.task_id === taskId && row.season_id === season.id)) fail(409, "already_completed", "Bu tapşırıq üçün XP-ni artıq qazanmısan.");
  if (place.type === "outdoor" && task.type === "find" && !state.checkins.some((row) => row.user_id === user.id && row.place_id === place.id && row.season_id === season.id)) {
    fail(403, "checkin_required", "Əvvəl pin radiusunda GPS yoxlamasını tamamla.");
  }
  if (place.type === "museum" && task.type !== "qr_scan" && !state.completions.some((row) => row.user_id === user.id && row.place_id === place.id && row.season_id === season.id && row.task_id.endsWith("-visit"))) {
    fail(403, "museum_qr_required", "Əvvəl muzeydəki QR kodunu oxut.");
  }
  if (task.type === "qr_scan" && !body.qrToken) fail(403, "invalid_qr", "Demo QR kodunu skan et.");
  let correct = true;
  const normalized = String(body.answer || "").trim().normalize("NFKC").toLowerCase().replaceAll("ə", "e").replaceAll("ı", "i");
  if (task.type === "quiz") {
    if (!normalized) fail(400, "answer_required", "Suala cavab daxil et.");
    correct = normalized === "baki";
  }
  if (task.type === "vote" && !normalized) fail(400, "vote_required", "Seçimlərdən birini seç.");

  const beforeOwner = territoryOwner(state, season, place);
  const now = new Date().toISOString();
  const baseXp = task.type === "quiz" && !correct ? 8 : task.xp;
  const ticketedPlaceBonus = place.ticketed_place_bonus_xp || 0;
  let firstVisitXp = 0;
  if (place.type === "museum" && !user.firstMuseumVisitCompleted) {
    user.firstMuseumVisitCompleted = true;
    if (user.visitedMuseumLast12Months === false) firstVisitXp = 20;
  }
  state.completions.push({ user_id: user.id, task_id: task.id, place_id: place.id, season_id: season.id, correct, completed_at_utc: now });
  state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: place.id, task_id: task.id, kind: "base", amount: baseXp, created_at_utc: now });
  if (ticketedPlaceBonus > 0) state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: place.id, task_id: task.id, kind: "ticketed_place_bonus", amount: ticketedPlaceBonus, created_at_utc: now });
  if (firstVisitXp) state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: place.id, task_id: task.id, kind: "first_visit", amount: firstVisitXp, created_at_utc: now });
  const souvenirDrop = souvenirFor(state, user, place, false);
  const rareFlameDrop = task.type === "qr_scan" && Math.random() < 0.05 ? souvenirFor(state, user, place, true) : null;
  const afterOwner = territoryOwner(state, season, place);
  const level = Math.floor(userXp(state, user.id) / LEVEL_XP) + 1;
  const previousLevel = Math.floor((userXp(state, user.id) - baseXp - ticketedPlaceBonus - firstVisitXp) / LEVEL_XP) + 1;
  return {
    xp_awarded: baseXp + ticketedPlaceBonus + firstVisitXp,
    breakdown: { base_xp: baseXp, ticketed_place_bonus: ticketedPlaceBonus, group_bonus: 0, first_visit: firstVisitXp, multiplier: 0 },
    new_total: userXp(state, user.id), weekly_total: userXp(state, user.id, season.id), level,
    level_up: level > previousLevel,
    avatar_unlocked: AVATARS.filter((avatar) => avatar.unlock_level > previousLevel && avatar.unlock_level <= level).map(({ id, name }) => ({ id, name })),
    souvenir_drop: souvenirDrop, rare_flame_drop: rareFlameDrop,
    territory_change: afterOwner?.university_id === user.universityId && beforeOwner?.university_id !== user.universityId ? { message: takeOverMessage(place, beforeOwner), owner: afterOwner } : null,
    correct, correct_answer: correct ? null : "Bakı", fact: correct ? null : "Bakı Azərbaycanın paytaxtıdır.",
    prize_eligible: true, lantern: lanternProgress(state, user.id),
  };
}

function groupView(state, group, user) {
  return {
    id: group.id, name: group.name, inviteCode: group.inviteCode, open_league: group.open_league,
    members: group.members.map((id) => {
      const member = state.users.find((row) => row.id === id);
      return member ? { id, name: publicName(member.name), current: id === user.id } : null;
    }).filter(Boolean),
    member_count: group.members.length,
  };
}

function coopView(state, session, user) {
  const mine = session.participants.find((participant) => participant.id === user.id);
  const roles = {
    "Kəşfiyyatçı": "Eksponatda diqqətini çəkən bir detalı tap və təsvir et.",
    "Tarixçi": "Tapşırıq kartında oxuduğun ümumi fikri öz sözlərinlə yaz.",
    "Müşahidəçi": "Eksponatda gördüyün rəng və ya formanı təsvir et.",
  };
  return {
    id: session.id, completed: session.completed, expired: Date.now() >= Date.parse(session.expires_at_utc),
    participants: session.participants.map((row) => ({ id: row.id, name: row.name, role: row.role, answered: row.answered })),
    joined: session.participants.length, needed: 3, expires_at_utc: session.expires_at_utc,
    my_role: mine?.role || null, role_question: mine ? { text: roles[mine.role], needs_review: true } : null,
    answered: Boolean(mine?.answered), answered_count: session.participants.filter((row) => row.answered).length,
    xp_awarded: session.completed ? session.xp_awarded || 0 : 0,
    breakdown: { base_xp: session.completed ? session.base_xp || 0 : 0, ticketed_place_bonus: session.completed ? session.ticketed_place_bonus_xp || 0 : 0, group_bonus: 0 },
  };
}

function metricsResponse() {
  return {
    new_users: 0, users_with_museum_completion: 0,
    second_museum_conversion: { eligible_users: 0, converted_users: 0, percent: null },
    first_time_museum_visitors: 0,
    visits_per_place: PLACES.filter((place) => place.type === "museum").map((place) => ({ place: place.name, visits: 0 })),
    visits_per_university: UNIVERSITIES.map((university) => ({ university: university.shortName, visits: 0 })),
    week1_to_week2_retention: { cohort_users: 0, returned_users: 0, percent: null },
  };
}

function adminAuthorized(init) {
  const headers = new Headers(init?.headers || {});
  return (headers.get("X-Admin-Token") || "").trim().length >= 24;
}

function pathParts(pathname) {
  const cleaned = pathname.replace(/^\/api(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  return cleaned.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
}

export async function demoApiRequest(path, init = {}) {
  const url = new URL(path, "http://demo.local");
  const parts = pathParts(url.pathname);
  const method = String(init.method || "GET").toUpperCase();
  const body = parseBody(init);
  const state = readState();
  const user = currentUser(state);
  const season = seasonFor(state);
  let result;

  if (parts.length === 1 && parts[0] === "config" && method === "GET") {
    result = {
      level_xp: LEVEL_XP, outdoor_pin_xp: 10,
      difficulty_xp: { easy: 10, medium: 20, hard: 40 },
      ticketed_places: { bonus_xp: TICKETED_PLACE_BONUS_XP, slugs: [...TICKETED_PLACE_SLUGS] },
      university_ranking: { top_members: 10, minimum_active: 3 },
      group_bonus: { minimum_members: 3, window_minutes: 60, multipliers: GROUP_MULTIPLIERS },
      maximum_week_multiplier: 1.1, time_zone: "Asia/Baku",
      daily_lantern: { streak_days: STREAK_DAYS, milestone_xp: STREAK_REWARD_XP, time_zone: "Asia/Baku" },
      mini_game: { completion_xp: MINI_GAME_CONFIG.completionXp, daily_award_limit: MINI_GAME_CONFIG.dailyAwardLimit, time_zone: MINI_GAME_CONFIG.bakuTimeZone },
      rare_flame: { chance_percent: 5 },
    };
  } else if (parts.length === 1 && parts[0] === "universities" && method === "GET") {
    result = UNIVERSITIES;
  } else if (parts.length === 1 && parts[0] === "avatars" && method === "GET") {
    result = AVATARS;
  } else if (parts[0] === "auth" && parts[1] === "register" && method === "POST") {
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (name.length < 2 || name.length > 50) fail(400, "invalid_name", "Ad 2–50 simvol olmalıdır.");
    if (!email.includes("@")) fail(400, "invalid_email", "Düzgün e-poçt ünvanı daxil et.");
    if (String(body.password || "").length < 10) fail(400, "invalid_password", "Şifrə ən azı 10 simvol olmalıdır.");
    if (state.users.some((row) => row.email === email)) fail(409, "email_in_use", "Bu e-poçt artıq qeydiyyatdan keçib.");
    const university = UNIVERSITIES.find((row) => row.id === body.universityId);
    if (!university) fail(400, "invalid_university", "Universitet siyahısından seçim et.");
    const avatar = AVATARS.find((row) => row.id === (body.avatarId || "nizami"));
    if (!avatar || avatar.unlock_level > 1) fail(400, "avatar_locked", "Bu avatar hələ açılmayıb.");
    const created = {
      id: "demo-user-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      name, email, universityId: university.id, avatarId: avatar.id,
      visitedMuseumLast12Months: body.visitedMuseumLast12Months ?? null,
      firstMuseumVisitCompleted: false,
    };
    state.users.push(created);
    result = { token: "ciraq-demo:" + created.id, user: userView(state, created) };
  } else if (parts[0] === "auth" && parts[1] === "login" && method === "POST") {
    const email = String(body.email || "").trim().toLowerCase();
    const found = state.users.find((row) => row.email === email);
    if (!found || !String(body.password || "")) fail(401, "invalid_credentials", "E-poçt və ya şifrə yanlışdır.");
    result = { token: "ciraq-demo:" + found.id, user: userView(state, found) };
  } else if (parts.length === 1 && parts[0] === "me" && method === "GET") {
    result = user ? userView(state, user) : fail(401, "unauthorized", "Daxil ol və yenidən cəhd et.");
  } else if (parts.length === 1 && parts[0] === "me" && method === "PATCH") {
    if (!user) fail(401, "unauthorized", "Daxil ol və yenidən cəhd et.");
    if (body.name != null && String(body.name).trim()) {
      if (String(body.name).trim().length < 2 || String(body.name).trim().length > 50) fail(400, "invalid_name", "Ad 2–50 simvol olmalıdır.");
      user.name = String(body.name).trim();
    }
    if (body.avatarId) {
      const avatar = AVATARS.find((row) => row.id === body.avatarId);
      const level = Math.floor(userXp(state, user.id) / LEVEL_XP) + 1;
      if (!avatar || avatar.unlock_level > level) fail(400, "avatar_locked", "Bu avatar hələ açılmayıb.");
      user.avatarId = avatar.id;
    }
    result = userView(state, user);
  } else if (parts[0] === "lantern" && parts[1] === "ignite" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Gündəlik çırağı yandırmaq üçün daxil ol.");
    const today = bakuDateKey();
    const rows = state.lantern_ignitions.filter((row) => row.user_id === user.id).sort((a, b) => a.date.localeCompare(b.date));
    const latest = rows.at(-1);
    if (latest?.date === today) {
      result = {
        already_lit_today: true, streak_reset: false, xp_awarded: 0,
        new_total: userXp(state, user.id), weekly_total: userXp(state, user.id, season.id),
        lantern: lanternProgress(state, user.id),
      };
    } else {
      const yesterday = shiftDateKey(today, -1);
      const continues = latest?.date === yesterday;
      const streakReset = Boolean(latest && latest.date < yesterday);
      const streakDays = continues ? latest.consecutive_days + 1 : 1;
      const xpAwarded = streakDays % STREAK_DAYS === 0 ? STREAK_REWARD_XP : 0;
      state.lantern_ignitions.push({ user_id: user.id, date: today, consecutive_days: streakDays });
      if (xpAwarded) state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: "", kind: "daily_lantern_streak", amount: xpAwarded, created_at_utc: new Date().toISOString() });
      result = {
        already_lit_today: false, streak_reset: streakReset, xp_awarded: xpAwarded,
        new_total: userXp(state, user.id), weekly_total: userXp(state, user.id, season.id),
        lantern: lanternProgress(state, user.id),
      };
    }
  } else if (parts.length === 2 && parts[0] === "seasons" && parts[1] === "current" && method === "GET") {
    result = season;
  } else if (parts.length === 4 && parts[0] === "places" && parts[2] === "minigame" && parts[3] === "complete" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Mini oyunun nəticəsini saxlamaq üçün daxil ol.");
    const place = PLACES.find((row) => row.id === parts[1] || row.slug === parts[1]);
    if (!place) fail(404, "place_not_found", "Məkan tapılmadı.");
    const today = bakuDateKey();
    const stars = Math.max(0, Math.min(3, Number(body.stars) || 0));
    const awardsToday = state.xp_events.filter((row) => row.user_id === user.id && row.kind === "minigame" && bakuDateKey(new Date(row.created_at_utc)) === today);
    const alreadyAwarded = awardsToday.some((row) => row.place_id === place.id);
    let reason = null;
    let xpAwarded = 0;
    if (stars < 1) reason = "no_star";
    else if (alreadyAwarded) reason = "already_awarded_today";
    else if (awardsToday.length >= MINI_GAME_CONFIG.dailyAwardLimit) reason = "daily_limit";
    else {
      xpAwarded = MINI_GAME_CONFIG.completionXp;
      state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: place.id, kind: "minigame", amount: xpAwarded, created_at_utc: new Date().toISOString() });
    }
    result = {
      awarded: xpAwarded > 0, reason, xp_awarded: xpAwarded,
      new_total: userXp(state, user.id), weekly_total: userXp(state, user.id, season.id),
    };
  } else if (parts.length === 1 && parts[0] === "places" && method === "GET") {
    result = PLACES.map((place) => {
      const completions = user ? state.completions.filter((row) => row.user_id === user.id && row.season_id === season.id && row.place_id === place.id).length : 0;
      return {
        id: place.id, slug: place.slug, type: place.type, name: place.name, district: place.district,
        description: place.description, lat: place.lat, lng: place.lng, radius_m: place.radius_m,
        is_ticketed: place.is_ticketed, ticketed_place_bonus_xp: place.ticketed_place_bonus_xp,
        status: place.status, task_count: 5, completed_count: completions,
        xp_total: placeXpTotal(state, season, place), territory_owner: territoryOwner(state, season, place),
      };
    }).sort((a, b) => a.name.localeCompare(b.name, "az"));
  } else if (parts.length === 2 && parts[0] === "places" && method === "GET") {
    const place = PLACES.find((row) => row.slug === parts[1] || row.id === parts[1]);
    if (!place) fail(404, "place_not_found", "Məkan tapılmadı.");
    result = detailPlace(state, place, user);
  } else if (parts.length === 1 && parts[0] === "leaderboard" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Reytinqə baxmaq üçün daxil ol.");
    result = leaderboard(state, (url.searchParams.get("scope") || "global").toLowerCase(), user);
  } else if (parts.length === 1 && parts[0] === "territories" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Ərazilərə baxmaq üçün daxil ol.");
    result = { provisional: true, rows: PLACES.map((place) => ({ place_id: place.id, place_slug: place.slug, place: place.name, owner: territoryOwner(state, season, place) })) };
  } else if (parts[0] === "groups" && parts[1] === "me" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Qruplara baxmaq üçün daxil ol.");
    result = groupsForUser(state, user).map((group) => groupView(state, group, user));
  } else if (parts.length === 1 && parts[0] === "groups" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Qrup yaratmaq üçün daxil ol.");
    const name = String(body.name || "").trim();
    if (name.length < 2 || name.length > 40) fail(400, "invalid_group_name", "Qrup adı 2–40 simvol olmalıdır.");
    const group = { id: "demo-group-" + Date.now().toString(36), name, inviteCode: Math.random().toString(36).slice(2, 10).toUpperCase(), open_league: true, members: [user.id] };
    state.groups.push(group);
    result = { ...groupView(state, group, user), members: [publicName(user.name)] };
  } else if (parts[0] === "groups" && parts[1] === "join" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Qrupa qoşulmaq üçün daxil ol.");
    const group = state.groups.find((row) => row.inviteCode === String(body.inviteCode || "").trim().toUpperCase());
    if (!group) fail(404, "group_not_found", "Bu dəvət kodu ilə qrup tapılmadı.");
    if (!group.members.includes(user.id)) {
      if (group.members.length >= 5) fail(409, "group_full", "Qrupda ən çox 5 nəfər ola bilər.");
      group.members.push(user.id);
    }
    result = { ...groupView(state, group, user), member_count: group.members.length };
  } else if (parts.length === 2 && parts[0] === "me" && parts[1] === "collection" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Kolleksiyaya baxmaq üçün daxil ol.");
    result = collection(state, user);
  } else if (parts.length === 2 && parts[0] === "rewards" && parts[1] === "current" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Mükafatlara baxmaq üçün daxil ol.");
    result = rewards(state, user);
  } else if (parts.length === 2 && parts[0] === "rewards" && parts[1] === "claim" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Mükafatı tələb etmək üçün daxil ol.");
    if (String(body.verificationReference || "").trim().length < 4) fail(400, "verification_required", "Tələbə e-poçtu və ya ID kodunu daxil et.");
    result = { id: "demo-claim-" + Date.now().toString(36), status: "pending", message: "Məlumat əl ilə yoxlanacaq. Demo rejimində müraciət yalnız bu brauzerdə saxlanılır." };
  } else if (parts.length === 2 && parts[0] === "me" && parts[1] === "share-card" && method === "GET") {
    if (!user) fail(401, "unauthorized", "Paylaşım kartı üçün daxil ol.");
    const board = seedBoard(state, season).filter((row) => row.weekly_xp > 0);
    const rank = board.findIndex((row) => row.id === user.id) + 1;
    const universityRows = board.filter((row) => row.university_id === user.universityId);
    const universityRank = universityRows.findIndex((row) => row.id === user.id) + 1;
    const placeKey = url.searchParams.get("placeId");
    const place = placeKey && PLACES.find((row) => row.slug === placeKey || row.id === placeKey);
    result = {
      place: place?.name || null, xp: userXp(state, user.id, season.id),
      rank: rank > 0 ? rank : null,
      university: UNIVERSITIES.find((row) => row.id === user.universityId)?.shortName || "",
      university_rank: universityRank > 0 ? universityRank : null,
      territory: place ? territoryOwner(state, season, place) : null,
      brand: "Çıraq",
      share_text: "Çıraq-da " + (place?.name || "Bakıda") + " kəşfini tamamladım və " + userXp(state, user.id, season.id) + " XP qazandım!",
    };
  } else if (parts[0] === "demo" && parts[1] === "qr" && method === "GET") {
    const taskId = parts[2];
    const place = PLACES.find((row) => taskId.startsWith(row.slug + "-"));
    const task = place && makeTasks(place, state, user).find((row) => row.id === taskId);
    if (!task) fail(404, "task_not_found", "Tapşırıq tapılmadı.");
    result = { task_id: task.id, qr_payload: "/q/" + place.slug + "/" + task.code + "/1.demo" };
  } else if (parts[0] === "demo" && parts[1] === "checkin" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Giriş etdikdən sonra yenidən cəhd et.");
    const taskId = parts[2];
    const place = PLACES.find((row) => taskId.startsWith(row.slug + "-"));
    const task = place && makeTasks(place, state, user).find((row) => row.id === taskId);
    if (!task || place.type !== "outdoor") fail(400, "outdoor_place_required", "Demo GPS yoxlaması yalnız açıq hava məkanları üçündür.");
    if (place.status !== "open") fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
    if (!state.checkins.some((row) => row.user_id === user.id && row.place_id === place.id && row.season_id === season.id)) state.checkins.push({ user_id: user.id, place_id: place.id, season_id: season.id });
    result = { valid: true, demo: true, place_id: place.id, already_checked_in: false, checked_at_utc: new Date().toISOString() };
  } else if (parts[0] === "checkins" && method === "POST") {
    if (!user) fail(401, "unauthorized", "GPS yoxlaması üçün daxil ol.");
    const place = PLACES.find((row) => row.id === body.placeId);
    if (!place) fail(404, "place_not_found", "Məkan tapılmadı.");
    if (place.status !== "open") fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
    if (!state.checkins.some((row) => row.user_id === user.id && row.place_id === place.id && row.season_id === season.id)) state.checkins.push({ user_id: user.id, place_id: place.id, season_id: season.id });
    result = { valid: true, place_id: place.id, checked_at_utc: new Date().toISOString(), demo: true };
  } else if (parts[0] === "tasks" && parts[2] === "complete" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Giriş etdikdən sonra yenidən cəhd et.");
    result = completeTask(state, user, parts[1], body);
  } else if (parts[0] === "coop" && parts[2] === "join" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Üçlü alova qoşulmaq üçün daxil ol.");
    const taskId = parts[1];
    const place = PLACES.find((row) => taskId.startsWith(row.slug + "-"));
    const task = place && makeTasks(place, state, user).find((row) => row.id === taskId);
    if (!task || task.type !== "coop") fail(404, "coop_task_not_found", "Ko-op tapşırığı tapılmadı.");
    if (place.status !== "open") fail(409, "place_locked", "Bu məkan hələ açılmayıb.");
    const sessionId = "demo-coop-" + taskId + "-" + user.id;
    let session = state.coop_sessions.find((row) => row.id === sessionId);
    if (!session) {
      session = {
        id: sessionId, task_id: taskId, place_id: place.id, season_id: season.id,
        completed: false, expires_at_utc: new Date(Date.now() + 60 * 60000).toISOString(), xp_awarded: 0, base_xp: 0, ticketed_place_bonus_xp: 0,
        participants: [
          { id: user.id, name: publicName(user.name), role: "Kəşfiyyatçı", answered: false },
          { id: "demo-peer-a", name: "Nihad Q.", role: "Tarixçi", answered: false },
          { id: "demo-peer-b", name: "Leyla H.", role: "Müşahidəçi", answered: false },
        ],
      };
      state.coop_sessions.push(session);
    }
    result = {
      session_id: session.id, joined: session.participants.length, needed: 3,
      expires_at_utc: session.expires_at_utc, completed: session.completed,
      my_role: session.participants.find((row) => row.id === user.id)?.role || "Kəşfiyyatçı",
      role_question: { text: "Eksponatda diqqətini çəkən bir detalı tap və təsvir et.", needs_review: true },
      answered: Boolean(session.participants.find((row) => row.id === user.id)?.answered),
      answered_count: session.participants.filter((row) => row.answered).length,
      participants: session.participants.map(({ id, name, role, answered }) => ({ id, name, role, answered })),
      xp_awarded: session.xp_awarded, message: "3/3 iştirakçı qoşulub.",
    };
  } else if (parts[0] === "coop" && parts.length === 2 && method === "GET") {
    if (!user) fail(401, "unauthorized", "Sessiyaya baxmaq üçün daxil ol.");
    const session = state.coop_sessions.find((row) => row.id === parts[1]);
    if (!session) fail(404, "session_not_found", "Ko-op sessiyası tapılmadı.");
    result = coopView(state, session, user);
  } else if (parts[0] === "coop" && parts[2] === "answer" && method === "POST") {
    if (!user) fail(401, "unauthorized", "Üçlü alova cavab vermək üçün daxil ol.");
    const session = state.coop_sessions.find((row) => row.id === parts[1]);
    if (!session) fail(404, "session_not_found", "Üçlü alov sessiyası tapılmadı.");
    if (String(body.answer || "").trim().length < 2) fail(400, "coop_answer_required", "Cavab 2–240 simvol olmalıdır.");
    if (!session.completed) {
      const participant = session.participants.find((row) => row.id === user.id);
      if (!participant) fail(403, "coop_participant_required", "Əvvəl QR kodunu skan edib rola qoşul.");
      participant.answered = true;
      session.participants.forEach((row) => { row.answered = true; });
      session.completed = true;
      const place = PLACES.find((row) => row.id === session.place_id);
      const task = place && makeTasks(place, state, user).find((row) => row.id === session.task_id);
      const now = new Date().toISOString();
      session.base_xp = task?.xp || 20;
      session.ticketed_place_bonus_xp = place?.ticketed_place_bonus_xp || 0;
      session.xp_awarded = session.base_xp + session.ticketed_place_bonus_xp;
      state.completions.push({ user_id: user.id, task_id: session.task_id, place_id: session.place_id, season_id: season.id, correct: true, completed_at_utc: now });
      state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: session.place_id, task_id: session.task_id, kind: "base", amount: session.base_xp, created_at_utc: now });
      if (session.ticketed_place_bonus_xp > 0) state.xp_events.push({ user_id: user.id, season_id: season.id, place_id: session.place_id, task_id: session.task_id, kind: "ticketed_place_bonus", amount: session.ticketed_place_bonus_xp, created_at_utc: now });
    }
    result = coopView(state, session, user);
  } else if (parts.length === 2 && parts[0] === "me" && parts[1] === "collection" && method !== "GET") {
    fail(405, "method_not_allowed", "Bu əməliyyat dəstəklənmir.");
  } else if (parts[0] === "rewards" && parts[1] === "claim" && method === "GET") {
    fail(405, "method_not_allowed", "Bu əməliyyat dəstəklənmir.");
  } else if (parts[0] === "admin" && parts[1] === "metrics" && method === "GET") {
    if (!adminAuthorized(init)) fail(401, "admin_required", "Demo admin açarı tələb olunur.");
    result = metricsResponse();
  } else if (parts[0] === "admin" && parts[1] === "demo" && parts[2] === "simulate-activity" && method === "POST") {
    if (!adminAuthorized(init)) fail(401, "admin_required", "Demo rejimi və admin açarı tələb olunur.");
    const count = Math.max(1, Math.min(20, Number(body.count) || 1));
    const slug = String(body.placeSlug || "");
    if (slug) {
      const place = PLACES.find((row) => row.slug === slug || row.id === slug);
      if (!place) fail(404, "place_not_found", "Məkan tapılmadı.");
      const before = territoryOwner(state, season, place);
      const targetId = before?.runner_up_id || UNIVERSITIES.find((row) => row.id !== before?.university_id)?.id || "ada";
      const target = UNIVERSITIES.find((row) => row.id === targetId);
      const after = { university_id: targetId, university: target?.shortName || targetId, score: (before?.score || 0) + count * 10, runner_up_id: before?.university_id || null, runner_up: before?.university || null, runner_up_score: before?.score || 0, gap: count * 10, participant_count: 1, tied: false, reached_at_utc: new Date().toISOString(), final: false };
      state.territory_overrides[place.slug] = after;
      result = { simulated: count, place: place.name, target_university_id: targetId, captured: true, before_owner: before, after_owner: after, rows: Array.from({ length: count }, (_, index) => ({ user: publicName(SEEDED_NAMES[index % SEEDED_NAMES.length]), university_id: targetId, task: "Demo tapşırığı", xp: 10 })) };
    } else result = { simulated: count, rows: [] };
  } else if (parts[0] === "admin" && parts[1] === "demo" && parts[2] === "advance-week" && method === "POST") {
    if (!adminAuthorized(init)) fail(401, "admin_required", "Demo rejimi və admin açarı tələb olunur.");
    const previousId = season.id;
    const board = seedBoard(state, season).filter((row) => row.weekly_xp > 0);
    state.previous_final = board.slice(0, 10).map((row, index) => ({ id: row.id, rank: index + 1, name: row.name, weeklyXp: row.weekly_xp, prizeEligible: true, winner: index === 0, label: index === 0 ? "Qalib" : "Reytinq iştirakçısı" }));
    state.territory_overrides = {};
    state.week_advance = (state.week_advance || 0) + 1;
    const next = seasonFor(state);
    result = { finalized_season: previousId, next_season: next.id, users_ranked: board.length, territory_snapshots: PLACES.filter((place) => territoryOwner(state, season, place)).length };
  } else if (parts[0] === "dev" && parts[1] === "qr-sheet" && method === "GET") {
    if (!adminAuthorized(init)) fail(401, "admin_required", "Demo admin açarı tələb olunur.");
    result = PLACES.flatMap((place) => makeTasks(place, state, user).map((task) => ({
      id: task.id, title: task.title, type: task.type, place: place.name, slug: place.slug,
      qr_payload: "/q/" + place.slug + "/" + task.code + "/1.demo",
    })));
  } else {
    fail(404, "demo_endpoint_not_found", "Demo rejimində bu xidmət mövcud deyil: " + method + " " + url.pathname);
  }

  writeState(state);
  return copy(result);
}
