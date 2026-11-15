// Seasonal journey: every 12 DISTINCT curriculum lessons finished moves the camp to the next season.
// Everything is derived from the saved lesson IDs, so reloads and replays can never change it.
import { CURRICULUM_IDS, GERS } from "./curriculum";
import { transliterate } from "./translit";

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

/* ---- town layout: 4 clusters of 6 gers; the whole camp moves to the season's site ---- */
// Trail start per season (x, z); the trail runs forward along -x through the valley. Flat, river-free lines chosen
// from the terrain function: summer near the river, autumn open pasture, winter in the sheltered foothills, spring a sunny slope.
// Regional pattern from Fernández-Giménez 2000 (a regional example, not a universal rule).
export const SITES: { x: number; z: number }[] = [
  { x: 250, z: 10 },
  { x: 250, z: -20 },
  { x: 250, z: -105 },
  { x: 250, z: -70 },
];

// One row of gers beside a gently curving road (-x). The camera drives forward along the road; each door faces the oncoming camera.
export const trailZ = (lx: number) => 9 * Math.sin(lx * 0.013);
export const DOOR = 1.17; // door turned toward +x (oncoming) and the road side
export const TOWN = GERS.map((g, i) => ({ id: g.id, i, x: -i * 21, z: trailZ(-i * 21) - 9, rot: DOOR }));
