// Short real-life conversations. The other person speaks; you pick the right reply.

export type Turn = {
  them: { mn: string; en: string };
  options: { mn: string; en: string; ok: boolean; why?: string }[];
};
export type Dialogue = { id: string; title: string; who: string; icon: "car" | "shop"; turns: Turn[] };

export const DIALOGUES: Dialogue[] = [
  {
    id: "taxi",
    title: "Take a taxi",
    who: "Driver",
    icon: "car",
    turns: [
      {
        them: { mn: "Сайн байна уу? Хаашаа явах вэ?", en: "Hello! Where are you going?" },
        options: [
          { mn: "Сайн байна уу. Сүхбаатарын талбай руу.", en: "Hello. To Sükhbaatar Square.", ok: true },
          { mn: "Би мах иддэггүй.", en: "I don't eat meat.", ok: false, why: "That's for a café, not a taxi." },
          { mn: "Баяртай!", en: "Goodbye!", ok: false, why: "You just got in! Say where you're going." },
        ],
      },
      {
        them: { mn: "За. Арван мянган төгрөг.", en: "OK. Ten thousand tögrög." },
        options: [
          { mn: "Хэтэрхий үнэтэй байна. Найман мянга болох уу?", en: "That's too expensive. Is eight thousand OK?", ok: true },
          { mn: "Цэс өгөөч.", en: "The menu, please.", ok: false, why: "Taxis don't have menus! Talk about the price." },
          { mn: "Би халуурч байна.", en: "I have a fever.", ok: false, why: "That's for the doctor." },
        ],
      },
      {
        them: { mn: "За, болно.", en: "OK, fine." },
        options: [
          { mn: "Баярлалаа!", en: "Thank you!", ok: true },
          { mn: "Уучлаарай, би ойлгохгүй байна.", en: "Sorry, I don't understand.", ok: false, why: "“За, болно” means “OK, fine”. You got your price!" },
          { mn: "Туслаарай!", en: "Help!", ok: false, why: "Only for emergencies." },
        ],
      },
      {
        them: { mn: "Ирлээ.", en: "We've arrived." },
        options: [
          { mn: "Энд зогсоорой. Баярлалаа!", en: "Stop here, please. Thank you!", ok: true },
          { mn: "Зүүн тийш эргээрэй.", en: "Turn left.", ok: false, why: "You've arrived. Ask him to stop." },
          { mn: "Энэ хэд вэ?", en: "How much is this?", ok: false, why: "You already agreed on the price." },
        ],
      },
    ],
  },
  {
    id: "shop",
    title: "Buy something",
    who: "Seller",
    icon: "shop",
    turns: [
      {
        them: { mn: "Сайн байна уу? Юу авах вэ?", en: "Hello! What would you like?" },
        options: [
          { mn: "Сайн байна уу. Энэ хэд вэ?", en: "Hello. How much is this?", ok: true },
          { mn: "Чигээрээ яваарай.", en: "Go straight.", ok: false, why: "That's for a taxi driver." },
          { mn: "Цагдаа дуудаарай!", en: "Call the police!", ok: false, why: "Only for emergencies." },
        ],
      },
      {
        them: { mn: "Таван мянга.", en: "Five thousand." },
        options: [
          { mn: "Карт авдаг уу?", en: "Do you take cards?", ok: true },
          { mn: "Би төөрчихлөө.", en: "I'm lost.", ok: false, why: "You're in the shop. Ask about paying." },
          { mn: "Ус өгөөч.", en: "Water, please.", ok: false, why: "The seller told you the price: таван мянга = 5,000." },
        ],
      },
      {
        them: { mn: "Тийм, авна.", en: "Yes, we do." },
        options: [
          { mn: "Би үүнийг авъя.", en: "I'll take this.", ok: true },
          { mn: "Үгүй.", en: "No.", ok: false, why: "They said yes to cards. Now buy it!" },
          { mn: "Миний толгой өвдөж байна.", en: "I have a headache.", ok: false, why: "That's for the doctor." },
        ],
      },
      {
        them: { mn: "Баярлалаа!", en: "Thank you!" },
        options: [
          { mn: "Баяртай!", en: "Goodbye!", ok: true },
          { mn: "Хаашаа явах вэ?", en: "Where are you going?", ok: false, why: "That's what a taxi driver asks." },
          { mn: "Хэд вэ?", en: "How much?", ok: false, why: "You already paid. Say goodbye." },
        ],
      },
    ],
  },
];
