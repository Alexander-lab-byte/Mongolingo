export type LearningPathId = "conversation" | "vocabulary";

export const LEARNING_PATHS = {
  conversation: { title: "Conversation road", mn: "Ярианы зам", description: "Everyday situations & Mongolian life", direction: "left" },
  vocabulary: { title: "Words & numbers", mn: "Үг, тооны зам", description: "Street signs, useful words & counting", direction: "right" },
} as const;

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
