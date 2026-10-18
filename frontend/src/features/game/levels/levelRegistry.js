export const LEVEL_IDS = {
  ICHERISHEHER: "icherisheher",
  CARPET_MUSEUM: "carpet-museum",
  NATIONAL_HISTORY: "national-history",
  HEYDAR_ALIYEV: "heydar-aliyev",
};

export const levelRegistry = [
  {
    id: LEVEL_IDS.ICHERISHEHER,
    placeSlug: "icherisheher",
    title: "İçərişəhər",
    subtitle: "Qız Qalasının izi",
    location: "Bakı",
    description: "Qədim şəhərin daş küçələrində ilk artefaktını tap.",
    difficulty: "Başlanğıc",
    playable: true,
    accent: "gold",
  },
  {
    id: LEVEL_IDS.CARPET_MUSEUM,
    placeSlug: "carpet-museum",
    title: "Xalça Muzeyi",
    subtitle: "Naxışların sirri",
    location: "Bakı bulvarı",
    description: "Rənglərdə gizlənən hekayəni aç.",
    difficulty: "Orta",
    playable: false,
    requires: LEVEL_IDS.ICHERISHEHER,
    accent: "mint",
  },
  {
    id: LEVEL_IDS.NATIONAL_HISTORY,
    placeSlug: "national-history",
    title: "Milli Tarix Muzeyi",
    subtitle: "Zamanın izləri",
    location: "Bakı",
    description: "Azərbaycan tarixinin böyük xəritəsini tamamla.",
    difficulty: "Orta",
    playable: false,
    requires: LEVEL_IDS.CARPET_MUSEUM,
    accent: "purple",
  },
  {
    id: LEVEL_IDS.HEYDAR_ALIYEV,
    placeSlug: "heydar-aliyev",
    title: "Heydər Əliyev Mərkəzi",
    subtitle: "Gələcəyə baxış",
    location: "Nərimanov",
    description: "Müasir memarlığın axıcı dünyasına daxil ol.",
    difficulty: "Çətin",
    playable: false,
    requires: LEVEL_IDS.NATIONAL_HISTORY,
    accent: "blue",
  },
];

export function getLevel(levelId) {
  return levelRegistry.find((level) => level.id === levelId) ?? levelRegistry[0];
}
