export const LEVEL_IDS = {
  ICHERISHEHER: "icherisheher",
  CARPET_MUSEUM: "carpet-museum",
  NATIONAL_HISTORY: "national-history",
  HEYDAR_ALIYEV: "heydar-aliyev",
};

export const levelRegistry = [
  {
    id: LEVEL_IDS.ICHERISHEHER,
    title: "İçərişəhər",
    subtitle: "Qız Qalasının izi",
    location: "Bakı",
    description: "Qədim şəhərin daş küçələrində ilk artefaktını tap.",
    xp: 250,
    difficulty: "Başlanğıc",
    playable: true,
    accent: "gold",
  },
  {
    id: LEVEL_IDS.CARPET_MUSEUM,
    title: "Xalça Muzeyi",
    subtitle: "Naxışların sirri",
    location: "Bakı bulvarı",
    description: "Rənglərdə gizlənən hekayəni aç.",
    xp: 320,
    difficulty: "Orta",
    playable: false,
    requires: LEVEL_IDS.ICHERISHEHER,
    accent: "mint",
  },
  {
    id: LEVEL_IDS.NATIONAL_HISTORY,
    title: "Milli Tarix Muzeyi",
    subtitle: "Zamanın izləri",
    location: "Bakı",
    description: "Azərbaycan tarixinin böyük xəritəsini tamamla.",
    xp: 400,
    difficulty: "Orta",
    playable: false,
    requires: LEVEL_IDS.CARPET_MUSEUM,
    accent: "purple",
  },
  {
    id: LEVEL_IDS.HEYDAR_ALIYEV,
    title: "Heydər Əliyev Mərkəzi",
    subtitle: "Gələcəyə baxış",
    location: "Nərimanov",
    description: "Müasir memarlığın axıcı dünyasına daxil ol.",
    xp: 450,
    difficulty: "Çətin",
    playable: false,
    requires: LEVEL_IDS.NATIONAL_HISTORY,
    accent: "blue",
  },
];

export function getLevel(levelId) {
  return levelRegistry.find((level) => level.id === levelId) ?? levelRegistry[0];
}
