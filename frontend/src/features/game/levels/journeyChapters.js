import { LEVEL_IDS } from "./levelRegistry";

// Narrative copy is provisional and must be reviewed by a museum content owner.
export const journeyChapters = [
  {
    id: "journey-1",
    mapLevelId: LEVEL_IDS.ICHERISHEHER,
    placeSlug: "carpet-museum",
    title: "İlk muzey izi",
    clue: "İp və rənglə qurulan naxışların izini hansı muzeydə axtaracaqsan?",
    choiceSlugs: ["national-history", "carpet-museum", "heydar-aliyev"],
    needs_review: true,
  },
  {
    id: "journey-2",
    mapLevelId: LEVEL_IDS.CARPET_MUSEUM,
    placeSlug: "national-history",
    title: "Keçmişin izi",
    clue: "Müxtəlif dövrləri kolleksiyası ilə tanıdan muzeyi seç.",
    choiceSlugs: ["carpet-museum", "national-history", "heydar-aliyev"],
    needs_review: true,
  },
  {
    id: "journey-3",
    mapLevelId: LEVEL_IDS.NATIONAL_HISTORY,
    placeSlug: "heydar-aliyev",
    title: "Axıcı formaların izi",
    clue: "Memarlıq və mədəniyyət sərgilərini bir arada kəşf edə biləcəyin məkanı tap.",
    choiceSlugs: ["literature-museum", "heydar-aliyev", "modern-art"],
    needs_review: true,
  },
];

export const journeyMapOrder = [
  LEVEL_IDS.ICHERISHEHER,
  LEVEL_IDS.CARPET_MUSEUM,
  LEVEL_IDS.NATIONAL_HISTORY,
  LEVEL_IDS.HEYDAR_ALIYEV,
];

export function isJourneyPlaceComplete(place) {
  const tasks = Array.isArray(place?.tasks) ? place.tasks : [];
  const visitComplete = tasks.some((task) => task.code === "visit" && task.completed);
  const museumQuestionComplete = tasks.some((task) => task.code === "quiz" && task.completed);
  return visitComplete && museumQuestionComplete;
}

export function isJourneyChapterComplete(chapter, placesBySlug) {
  return isJourneyPlaceComplete(placesBySlug?.[chapter.placeSlug]);
}
