// Seasonal journey: every 12 DISTINCT curriculum lessons finished moves the camp to the next season.
// Everything is derived from the saved lesson IDs, so reloads and replays can never change it.
import { CURRICULUM_IDS, GERS } from "./curriculum";
import { transliterate } from "./translit";
import { FOUNDATION_GERS, VOCABULARY_GERS, type LearningPathId } from "./learningPaths";

export const PER_SEASON = 12;
export const TOTAL_CURRICULUM = CURRICULUM_IDS.size; // 48

export type Season = {
  id: "summer" | "autumn" | "winter" | "spring";
  en: string;
  mn: string; // camp name
  mood: string;
  note: string; // regional example, not a universal rule
  phrase: { mn: string; en: string };
  source: string;
};

export const SEASONS: Season[] = [
  { id: "summer", en: "Summer", mn: "Зуслан", mood: "Green pasture by the water",
    note: "Summer camp (зуслан): many herders choose open, green pasture close to a river or well, where animals can drink easily and graze fresh grass.",
    phrase: { mn: "Зун дулаан байна.", en: "Summer is warm." }, source: "Fernández-Giménez 2000" },
  { id: "autumn", en: "Autumn", mn: "Намаржаа", mood: "Golden pasture to fatten the herd",
    note: "Autumn camp (намаржаа): herders look for nutritious pasture so animals gain condition before winter. Grazed summer land is left to recover. In some regions the herd also moves toward its winter area.",
    phrase: { mn: "Мал сайн бэлчээрлэж байна.", en: "The animals are grazing well." }, source: "Fernández-Giménez 2000" },
  { id: "winter", en: "Winter", mn: "Өвөлжөө", mood: "Sheltered, sunny foothills",
    note: "Winter camp (өвөлжөө): in many regions families settle in sheltered, sunny foothills or valleys that block the prevailing wind, with a shelter (хашаа) for the livestock. Snow cover, cold and wind decide where it is safe to stay.",
    phrase: { mn: "Өвөл хүйтэн байна.", en: "Winter is cold." }, source: "Fernández-Giménez 2000; Bold 2001" },
  { id: "spring", en: "Spring", mn: "Хаваржаа", mood: "Shelter for newborn animals",
    note: "Spring camp (хаваржаа): the most delicate time. Many herders pick sheltered sites to protect newborn lambs, kids and calves while animals are weak and new grass is still sparse. Water, late snow and weather affect how soon they move on.",
    phrase: { mn: "Хавар болж байна.", en: "Spring is coming." }, source: "Fernández-Giménez 2000" },
];

/** How many different curriculum lessons are finished (replays and non-curriculum lessons never count). */
export const curriculumDone = (completed: string[]) => new Set(completed.filter((id) => CURRICULUM_IDS.has(id))).size;
/** Season reached: 0 summer, 1 autumn, 2 winter, 3 spring. */
export const seasonOf = (done: number) => Math.min(SEASONS.length - 1, Math.floor(done / PER_SEASON));
/** After all 48 lessons the person may visit any season. */
export const freeExplore = (done: number) => done >= TOTAL_CURRICULUM;

export const say = (mn: string) => transliterate(mn).toLowerCase();

/* Each chapter uses a different arrangement along the valley trail. */
export const SITES = [
  { x: 250, z: 4 },
  { x: 250, z: -20 },
  { x: 250, z: -105 },
  { x: 250, z: -70 },
];

const SETBACKS = [
  [-9, -14, -9, 10, -8, -13],
  [11, -10, 12, -10, 11, -13],
  [-10, -15, -11, -16, -11, -14],
  [13, 9, -11, -9, 10, -14],
];
const CAMERA_DISTANCES = [16, 18, 16, 17, 20, 15];
const CAMERA_HEIGHTS = [5.3, 6.6, 5.6, 7.3, 6.5, 5.7];

export const trailZ = (x: number) => 7 * Math.sin(x * 0.016) + 3 * Math.sin(x * 0.037);
const CONVERSATION_TOWN = GERS.map((ger, i) => {
  const chapter = Math.floor(i / 6);
  const stop = i % 6;
  const x = -i * 21;
  const z = trailZ(x) + SETBACKS[chapter][stop];
  const cameraX = x + CAMERA_DISTANCES[stop];
  const cameraZ = trailZ(cameraX);
  return {
    id: ger.id, i, x, z, cameraX, cameraZ, path: "conversation" as LearningPathId, number: i + 1,
    cameraHeight: CAMERA_HEIGHTS[stop],
    rot: Math.atan2(cameraX - x, cameraZ - z),
  };
});

// Conversation heads west; alphabet/number foundations head east.
const FOUNDATION_TOWN = FOUNDATION_GERS.map((ger, i) => {
  const x = 42 + i * 24;
  const z = trailZ(x) - (i % 2 ? 15 : 11);
  const cameraX = x - 17;
  const cameraZ = trailZ(cameraX);
  return {
    id: ger.id, i: GERS.length + i, x, z, cameraX, cameraZ,
    path: "foundations" as LearningPathId, number: i + 1,
    cameraHeight: 6.2,
    rot: Math.atan2(cameraX - x, cameraZ - z),
  };
});

// The separate word/sentence road branches north, clear of the foundation gers.
export const vocabularyTrailZ = (x: number) => {
  const t = Math.max(0, Math.min(1, (x - 22) / 20));
  return trailZ(x) - 52 * t * t * (3 - 2 * t);
};
const VOCABULARY_TOWN = VOCABULARY_GERS.map((ger, i) => {
  const x = 42 + i * 24;
  const z = vocabularyTrailZ(x) - (i % 2 ? 15 : 11);
  const cameraX = x - 17;
  const cameraZ = vocabularyTrailZ(x);
  return {
    id: ger.id, i: GERS.length + FOUNDATION_GERS.length + i, x, z, cameraX, cameraZ,
    path: "vocabulary" as LearningPathId, number: i + 1,
    cameraHeight: 6.2, rot: Math.atan2(cameraX - x, cameraZ - z),
  };
});

export const TOWN = [...CONVERSATION_TOWN, ...FOUNDATION_TOWN, ...VOCABULARY_TOWN];
