import { CURRICULUM } from "./curriculum";
import type { Lesson } from "./lessons";
import { transliterate } from "./translit";

type Sentence = {
  wordId: string;
  mn: string;
  en: string;
  scene: string;
  summerLessonId: string;
  phraseIndex: number;
  formNote?: string;
};

// One authored sentence per original word. Keep the source word/lesson IDs so
// completion, flashcards and Tools → Your path continue to share progress.
export const WORD_SENTENCES: Record<string, Sentence[]> = {
  signs: [
    { wordId: "taksi", mn: "Уучлаарай, такси дуудаж өгнө үү.", en: "Excuse me, please call a taxi.", scene: "You are leaving your accommodation and need a ride.", summerLessonId: "lodging-2", phraseIndex: 4 },
    { wordId: "delguur", mn: "Уучлаарай, дэлгүүр хаана байдаг вэ?", en: "Excuse me, where is the shop?", scene: "Use the summer-camp pattern for asking where a place is.", summerLessonId: "family-2", phraseIndex: 4 },
    { wordId: "emiin", mn: "Уучлаарай, эмийн сан хаана байдаг вэ?", en: "Excuse me, where is the pharmacy?", scene: "Ask a local person to help you find a pharmacy.", summerLessonId: "family-2", phraseIndex: 4 },
    { wordId: "emneleg", mn: "Уучлаарай, эмнэлэг хаана байдаг вэ?", en: "Excuse me, where is the hospital?", scene: "Use the same familiar question to find a hospital.", summerLessonId: "family-2", phraseIndex: 4 },
    { wordId: "orts", mn: "Орц хаана байдаг вэ?", en: "Where is the entrance?", scene: "You have arrived at a building and are looking for the entrance.", summerLessonId: "family-2", phraseIndex: 4 },
    { wordId: "garts", mn: "Гарц хаана байдаг вэ?", en: "Where is the exit?", scene: "You are leaving a building and need to find the exit.", summerLessonId: "family-2", phraseIndex: 4 },
    { wordId: "avtobus", mn: "Уучлаарай, автобус хаана байдаг вэ?", en: "Excuse me, where is the bus?", scene: "Ask where to find the bus for your journey.", summerLessonId: "family-2", phraseIndex: 4 },
  ],
  hello: [
    { wordId: "sainuu", mn: "Сайн байна уу? Намайг Анна гэдэг.", en: "Hello. My name is Anna.", scene: "Greet your summer-camp host and introduce yourself.", summerLessonId: "greet-2", phraseIndex: 1 },
    { wordId: "bayarlalaa", mn: "Баярлалаа, би үүнийг авъя.", en: "Thank you, I'll take it.", scene: "You have chosen something at the summer-camp shop.", summerLessonId: "shopping-2", phraseIndex: 5 },
    { wordId: "tiim", mn: "Тийм, би захиалга өгсөн.", en: "Yes, I have a reservation.", scene: "The receptionist asks whether you have a reservation.", summerLessonId: "lodging-1", phraseIndex: 0 },
    { wordId: "ugui", mn: "Үгүй, би мах иддэггүй.", en: "No, I don't eat meat.", scene: "Someone offers you a meat dish. Explain your dietary preference.", summerLessonId: "restaurant-2", phraseIndex: 0 },
    { wordId: "hed", mn: "Уучлаарай, энэ хэд вэ?", en: "Excuse me, how much is this?", scene: "Ask the price politely, just as you practiced at summer camp.", summerLessonId: "time-money-2", phraseIndex: 0 },
    { wordId: "uuchlaarai", mn: "Уучлаарай, би ойлгохгүй байна.", en: "Sorry, I don't understand.", scene: "Your host speaks quickly and you need help understanding.", summerLessonId: "greet-2", phraseIndex: 5 },
    { wordId: "bayartai", mn: "Баяртай, маргааш уулзъя.", en: "Goodbye, see you tomorrow.", scene: "Say goodbye to a friend you will meet again tomorrow.", summerLessonId: "time-money-1", phraseIndex: 4 },
  ],
  numbers1: [
    { wordId: "n1", mn: "Нэг бууз авъя.", en: "I'd like one buuz.", scene: "Order one dumpling using the summer-camp restaurant phrase.", summerLessonId: "restaurant-1", phraseIndex: 3 },
    { wordId: "n2", mn: "Бид хоёулаа хамт аялж байна.", en: "The two of us are traveling together.", scene: "Introduce yourself and your travel companion to a camp host.", summerLessonId: "family-1", phraseIndex: 2, formNote: "Хоёр appears as хоёулаа when referring to two people together: бид хоёулаа." },
    { wordId: "n3", mn: "Гурван цагт уулзъя.", en: "Let's meet at three o'clock.", scene: "You and a friend are choosing a time to meet again.", summerLessonId: "time-money-1", phraseIndex: 5, formNote: "Гурав becomes гурван before a noun: гурван цагт." },
    { wordId: "n4", mn: "Манай гэр бүл дөрвөн хүнтэй.", en: "There are four people in my family.", scene: "A friend at summer camp asks you about your family.", summerLessonId: "family-1", phraseIndex: 4, formNote: "Дөрөв becomes дөрвөн before a noun: дөрвөн хүнтэй." },
    { wordId: "n5", mn: "Таван бууз авъя.", en: "I'd like five buuz.", scene: "You are hungry. Order five dumplings.", summerLessonId: "restaurant-1", phraseIndex: 3, formNote: "Тав becomes таван before a noun: таван бууз." },
  ],
  numbers2: [
    { wordId: "n6", mn: "Зургаан бууз авъя.", en: "I'd like six buuz.", scene: "Order six dumplings to share with a friend.", summerLessonId: "restaurant-1", phraseIndex: 3, formNote: "Зургаа becomes зургаан before a noun: зургаан бууз." },
    { wordId: "n7", mn: "Би долоон хоног байрламаар байна.", en: "I'd like to stay seven nights.", scene: "Tell the receptionist how long you would like to stay.", summerLessonId: "lodging-1", phraseIndex: 4, formNote: "Долоо becomes долоон before a noun: долоон хоног." },
    { wordId: "n8", mn: "Найман бууз авъя.", en: "I'd like eight buuz.", scene: "You are sharing lunch. Order eight dumplings.", summerLessonId: "restaurant-1", phraseIndex: 3, formNote: "Найм becomes найман before a noun: найман бууз." },
    { wordId: "n9", mn: "Есөн цагт уулзъя.", en: "Let's meet at nine o'clock.", scene: "Arrange a meeting time with your travel companions.", summerLessonId: "time-money-1", phraseIndex: 5, formNote: "Ес becomes есөн before a noun: есөн цагт." },
    { wordId: "n10", mn: "Арван бууз авъя.", en: "I'd like ten buuz.", scene: "Order ten dumplings for everyone at the table.", summerLessonId: "restaurant-1", phraseIndex: 3, formNote: "Арав becomes арван before a noun: арван бууз." },
  ],
  money: [
    { wordId: "n20", mn: "Би хорин төгрөг бэлнээр төлж болох уу?", en: "Can I pay twenty tögrög in cash?", scene: "Practice the cash-payment question with an amount of 20 tögrög.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Хорь becomes хорин before төгрөг." },
    { wordId: "n50", mn: "Би тавин төгрөг бэлнээр төлж болох уу?", en: "Can I pay fifty tögrög in cash?", scene: "Use the summer-camp payment phrase for 50 tögrög.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Тавь becomes тавин before төгрөг." },
    { wordId: "n100", mn: "Би зуун төгрөг бэлнээр төлж болох уу?", en: "Can I pay one hundred tögrög in cash?", scene: "Ask whether you can pay 100 tögrög in cash.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Зуу becomes зуун before төгрөг." },
    { wordId: "n500", mn: "Би таван зуун төгрөг бэлнээр төлж болох уу?", en: "Can I pay five hundred tögrög in cash?", scene: "You have cash for a 500-tögrög payment.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Таван зуу becomes таван зуун before төгрөг." },
    { wordId: "n1000", mn: "Би мянган төгрөг бэлнээр төлж болох уу?", en: "Can I pay one thousand tögrög in cash?", scene: "Ask the shopkeeper to accept 1,000 tögrög in cash.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Мянга becomes мянган before төгрөг." },
    { wordId: "n5000", mn: "Би таван мянган төгрөг бэлнээр төлж болох уу?", en: "Can I pay five thousand tögrög in cash?", scene: "Use your summer-camp phrase for a 5,000-tögrög purchase.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Таван мянга becomes таван мянган before төгрөг." },
    { wordId: "n10000", mn: "Би арван мянган төгрөг бэлнээр төлж болох уу?", en: "Can I pay ten thousand tögrög in cash?", scene: "At the market, ask to pay 10,000 tögrög in cash.", summerLessonId: "time-money-2", phraseIndex: 3, formNote: "Арван мянга becomes арван мянган before төгрөг." },
  ],
};

export function summerSource(sentence: Sentence) {
  const lesson = CURRICULUM.find(entry => entry.id === sentence.summerLessonId);
  const phrase = lesson?.items[sentence.phraseIndex];
  if (!lesson || lesson.ger === undefined || !phrase) throw new Error(`Missing summer-camp source for ${sentence.wordId}`);
  return { lessonId: lesson.id, title: lesson.title, phrase: phrase.show };
}

export function vocabularySentenceLesson(lesson: Lesson): Lesson {
  const sentences = WORD_SENTENCES[lesson.id];
  if (!sentences) return lesson;
  return {
    ...lesson,
    items: lesson.items.map(item => {
      const sentence = sentences.find(entry => entry.wordId === item.id);
      if (!sentence) throw new Error(`Missing sentence for ${lesson.id}/${item.id}`);
      return {
        ...item,
        show: sentence.mn,
        meaning: sentence.en,
        say: transliterate(sentence.mn).toLowerCase(),
        word: item.word ?? { mn: item.show, latin: item.say, en: item.meaning! },
        hint: summerSource(sentence).phrase,
        trick: sentence.formNote ?? "Use the familiar summer-camp phrase in a complete sentence.",
      };
    }),
  };
}
