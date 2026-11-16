export type LearningPathId = "foundations" | "conversation" | "vocabulary";

export const PATH_ORDER: LearningPathId[] = ["foundations", "conversation", "vocabulary"];
export const DEFAULT_PATH: LearningPathId = "foundations";

export const LEARNING_PATHS = {
  foundations: { title: "Alphabet & numbers", mn: "Үсэг, тоо", description: "Learn Cyrillic letters and practice numbers", direction: "right" },
  conversation: { title: "Conversation road", mn: "Ярианы зам", description: "Everyday situations & Mongolian life", direction: "left" },
  vocabulary: { title: "Words & sentences", mn: "Үг, өгүүлбэр", description: "Use words in familiar summer-camp sentences", direction: "forward" },
} as const;

// Five foundation gers: all six alphabet lessons and the three number sets.
export const FOUNDATION_GERS = [
  { id: "alphabet-familiar", name: "Meet the alphabet", mn: "Цагаан толгой", emoji: "Аа", caption: "А · К · М · О · Т", lessonIds: ["friends", "tricksters"], description: "Start with familiar letters, then learn the ones that look familiar but sound different." },
  { id: "alphabet-shapes", name: "New letter shapes", mn: "Шинэ үсгүүд", emoji: "Бб", caption: "Б · Г · Д · Ж · Ц", lessonIds: ["shapes1", "shapes2"], description: "Recognize new Cyrillic shapes and match each letter to its sound." },
  { id: "alphabet-specials", name: "Finish the alphabet", mn: "Ө · Ү · Э · Ё · Ю · Я", emoji: "Өө", caption: "Ө · Ү · Э · Ё · Ю · Я", lessonIds: ["specials", "yletters"], description: "Practice Mongolian special letters and the Y-family to complete the alphabet." },
  { id: "foundation-counting", name: "Numbers 1–10", mn: "Тоо 1–10", emoji: "🔢", caption: "1 · 2 · 3 · … · 10", lessonIds: ["numbers1", "numbers2"], description: "Match Mongolian number words to the digits 1–10, in both directions." },
  { id: "foundation-larger", name: "Larger numbers", mn: "Их тоонууд", emoji: "💯", caption: "20 · 50 · 100 · 1,000", lessonIds: ["money"], description: "Recognize 20, 50, 100, 500, 1,000, 5,000 and 10,000 as numbers." },
] as const;

export function foundationGerForLesson(lessonId: string) {
  return FOUNDATION_GERS.find(ger => (ger.lessonIds as readonly string[]).includes(lessonId));
}

export function foundationRoadHref(lessonId?: string) {
  return `/learn?path=foundations${lessonId ? `&stop=${encodeURIComponent(lessonId)}` : ""}`;
}

export function foundationLessonHref(lessonId: string) {
  return `/learn/${encodeURIComponent(lessonId)}?path=foundations`;
}

// Stable lesson IDs reuse lessons 7–11 from Tools → Your path, including saved progress.
export const VOCABULARY_GERS = [
  { id: "vocab-signs", lessonId: "signs", name: "Street signs", mn: "Замын тэмдэг", emoji: "🪧", caption: "Орц · Гарц", note: "Use street-sign words in complete questions. Reuse the summer-camp question хаана байдаг вэ? (where is …?) and the accommodation phrase for calling a taxi." },
  { id: "vocab-hello", lessonId: "hello", name: "Everyday words", mn: "Өдөр тутмын үгс", emoji: "👋", caption: "Сайн байна уу?", note: "Combine greetings, thank you, yes, no, and excuse me with the introductions, shopping, food, and accommodation phrases you met at summer camp." },
  { id: "vocab-numbers1", lessonId: "numbers1", name: "Numbers 1–5", mn: "Тоо 1–5", emoji: "🔢", caption: "Нэг · Хоёр · Гурав", note: "Use numbers one to five in summer-camp sentences about food, travel companions, family, and meeting times. Some number forms change before a noun: гурав → гурван, дөрөв → дөрвөн, тав → таван." },
  { id: "vocab-numbers2", lessonId: "numbers2", name: "Numbers 6–10", mn: "Тоо 6–10", emoji: "🔢", caption: "Зургаа · Долоо · Найм", note: "Practice food orders, booking a room, and arranging a meeting. Before a noun, use зургаан, долоон, найман, есөн, and арван. These sentences reuse summer-camp restaurant, accommodation, and time phrases." },
  { id: "vocab-money", lessonId: "money", name: "Prices & money", mn: "Үнэ, мөнгө", emoji: "💰", caption: "Төгрөг", note: "Practice amounts in complete payment questions using Бэлнээр төлж болох уу? from summer camp. Before төгрөг, use хорин, тавин, зуун, and мянган in the relevant number combinations." },
] as const;

export function vocabularyGerForLesson(lessonId: string) {
  return VOCABULARY_GERS.find(ger => ger.lessonId === lessonId);
}

export function vocabularyRoadHref(lessonId?: string) {
  return `/learn?path=vocabulary${lessonId ? `&stop=${encodeURIComponent(lessonId)}` : ""}`;
}
