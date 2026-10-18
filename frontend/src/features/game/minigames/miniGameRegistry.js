import { lazy } from "react";
import { MINI_GAME_CONFIG } from "./miniGameConfig";

export const miniGameRegistry = {
  "place-carpet-museum": {
    title: "Xalça toxu",
    ...MINI_GAME_CONFIG.carpet,
    instructions: "Naxışın göstərdiyi sütuna toxun. Düz toxunuş xalçaya yeni sıra əlavə edir.",
    Component: lazy(() => import("./games/CarpetGame")),
  },
  "place-national-history": {
    title: "Qazıntı",
    ...MINI_GAME_CONFIG.history,
    instructions: "Barmağınla və ya siçanla torpağı sil. Kövrək sahələrdə uzun dayanma.",
    Component: lazy(() => import("./games/HistoryGame")),
  },
  "place-heydar-aliyev": {
    title: "Axın",
    ...MINI_GAME_CONFIG.flow,
    instructions: "İşıqlı kürəni əyri cığırın içində saxla. Ekranda toxunub sürüşdür və ya ox düymələrini istifadə et.",
    Component: lazy(() => import("./games/FlowGame")),
  },
  "place-icherisheher": {
    title: "Qüllə qur",
    ...MINI_GAME_CONFIG.tower,
    instructions: "Hərəkət edən daş cığırın üstünə gələndə toxun. Mümkün qədər enli qüllə qur.",
    Component: lazy(() => import("./games/TowerGame")),
  },
};

export function getMiniGame(placeId) {
  return miniGameRegistry[placeId] || null;
}
