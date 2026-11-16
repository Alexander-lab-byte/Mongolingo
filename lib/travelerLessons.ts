import type { GerSpec } from "./curriculum";

// Traveler priorities informed by FCDO's Mongolia guidance: communication,
// money, safe food/water, accommodation and access to help. These are authored
// teaching phrases, not quotations or translations supplied by FCDO.
export const TRAVEL_SOURCES = [
  { name: "FCDO: Mongolia — safety and security", url: "https://www.gov.uk/foreign-travel-advice/mongolia/safety-and-security" },
  { name: "FCDO: Mongolia — health", url: "https://www.gov.uk/foreign-travel-advice/mongolia/health" },
];

export const TRAVELER_GERS: GerSpec[] = [
  { id: "greet", name: "Greetings & introductions", mn: "Мэндчилгээ", cluster: "everyday", emoji: "👋", lessons: [
    { t: "Hello, Mongolia", p: [
      ["Hello. (polite)", "Сайн байна уу?"], ["Thank you.", "Баярлалаа."], ["Excuse me / I'm sorry.", "Уучлаарай."], ["Yes / No.", "Тийм / Үгүй."], ["Good morning.", "Өглөөний мэнд."], ["Goodbye. (to someone staying)", "Баяртай."],
    ], d: [0, ["Сайн, сайн байна уу?", "Hello, how are you?"], ["Сайн, баярлалаа.", "I'm well, thank you."], 5], n: ["Start with Сайн байна уу? when greeting a host or shopkeeper. The question mark belongs to the Mongolian greeting; its everyday meaning is hello.", "Traveler communication · Mongolian polite usage"] },
    { t: "Introduce yourself & ask for help", p: [
      ["What is your name?", "Таныг хэн гэдэг вэ?"], ["My name is Anna.", "Намайг Анна гэдэг."], ["Where are you from?", "Та хаанаас ирсэн бэ?"], ["I'm from America.", "Би Америкаас ирсэн."], ["Please speak slowly.", "Та удаан ярина уу."], ["I don't understand.", "Би ойлгохгүй байна."],
    ], d: [0, 1, 2, 3, 4, ["За, болно.", "Of course."]], n: ["Keep your accommodation address written in Mongolian. Asking someone to slow down is useful before asking them to repeat an address or price.", "Traveler communication · FCDO Mongolia: safety and security"] },
  ] },
  { id: "family", name: "Family & travel companions", mn: "Гэр бүл, хамт аялагчид", cluster: "everyday", emoji: "👪", lessons: [
    { t: "Traveling together", p: [
      ["This is my family.", "Энэ миний гэр бүл."], ["This is my friend.", "Энэ миний найз."], ["We are traveling together.", "Бид хамт аялж байна."], ["There are two of us.", "Бид хоёулаа."], ["How many people are in your family?", "Танай гэр бүл хэдэн хүнтэй вэ?"], ["We have a child with us.", "Бид хүүхэдтэй явж байна."],
    ], d: [0, 4, ["Манай гэр бүл дөрвөн хүнтэй.", "There are four people in my family."], 5], n: ["Бид хоёулаа means there are two of us. Use it when asking for seats, meals or a room for two people.", "Traveler communication · group travel"] },
    { t: "Find your companion", p: [
      ["Can you help me?", "Та надад тусалж чадах уу?"], ["I'm looking for my friend.", "Би найзыгаа хайж байна."], ["Please call this number.", "Энэ дугаар руу залгаж өгнө үү."], ["Please wait here.", "Энд хүлээнэ үү."], ["Where is the meeting point?", "Уулзах газар хаана байдаг вэ?"], ["Please write it down.", "Үүнийг бичиж өгнө үү."],
    ], d: [0, ["Тэгэлгүй яах вэ.", "Of course."], 1, 2], n: ["Agree on a meeting point before entering a crowded market. Keep your host's contact number offline; large areas of rural Mongolia have no mobile coverage.", "FCDO Mongolia: safety and security — phone coverage"] },
  ] },
  { id: "time-money", name: "Numbers, time & money", mn: "Тоо, цаг, мөнгө", cluster: "everyday", emoji: "🕒", lessons: [
    { t: "Numbers & meeting times", p: [
      ["One, two, three", "Нэг, хоёр, гурав"], ["Four, five, six", "Дөрөв, тав, зургаа"], ["Seven, eight, nine, ten", "Долоо, найм, ес, арав"], ["What time is it?", "Одоо хэдэн цаг болж байна вэ?"], ["See you tomorrow.", "Маргааш уулзъя."], ["Let's meet at three o'clock.", "Гурван цагт уулзъя."],
    ], d: [3, ["Гурван цаг болж байна.", "It is three o'clock."], 4], n: ["Write down times and prices when you are unsure. Mongolian currency is the төгрөг (tögrög), commonly written ₮ or MNT.", "Traveler essentials · money and meeting times"] },
    { t: "Prices & payment", p: [
      ["How much is this?", "Энэ хэд вэ?"], ["Ten thousand tögrög.", "Арван мянган төгрөг."], ["Do you accept cards?", "Картаар төлж болох уу?"], ["Can I pay in cash?", "Бэлнээр төлж болох уу?"], ["Please give me the receipt.", "Баримт өгнө үү."], ["Please give me the change.", "Хариулт мөнгөө өгнө үү."],
    ], d: [0, 1, 2, ["Болно.", "Yes, you can."], 4], n: ["Ask about payment before ordering or buying. Keep money secured in crowded places, especially markets and festival areas.", "FCDO Mongolia: safety and security — protecting belongings"] },
  ] },
  { id: "shopping", name: "Shopping", mn: "Дэлгүүр, зах", cluster: "everyday", emoji: "🛍️", lessons: [
    { t: "At the souvenir stall", p: [
      ["Do you have a deel?", "Танайд дээл байгаа юу?"], ["Is this made in Mongolia?", "Үүнийг Монголд хийсэн үү?"], ["How much is this?", "Энэ хэд вэ?"], ["May I try it on?", "Өмсөж үзэж болох уу?"], ["I'm just looking, thank you.", "Зүгээр үзэж байна, баярлалаа."], ["I'll take this one.", "Би үүнийг авъя."],
    ], d: [0, ["Байгаа. Энэ дээлийг үзээрэй.", "Yes. Have a look at this deel."], 3, ["Тэгэлгүй яах вэ.", "Of course."], 5], n: ["A дээл is a traditional robe. Felt crafts and cashmere are other local goods. Check material and origin before buying; avoid protected wildlife products.", "FCDO Mongolia: safety and security — souvenirs"] },
    { t: "Choose the right size", p: [
      ["Do you have a larger size?", "Үүнээс том хэмжээтэй байна уу?"], ["Do you have a smaller size?", "Үүнээс жижиг хэмжээтэй байна уу?"], ["Do you have a cheaper one?", "Үүнээс хямд нь байна уу?"], ["What is this made of?", "Үүнийг юугаар хийсэн бэ?"], ["Is this cashmere?", "Энэ ноолуур уу?"], ["Thank you, I'll take it.", "Баярлалаа, би үүнийг авъя."],
    ], d: [3, ["Ноолуураар хийсэн.", "It is made of cashmere."], 0, ["Байгаа.", "Yes, we do."], 5], n: ["Хямд means inexpensive; том and жижиг mean large and small. Ask the price politely and accept the seller's answer.", "Traveler essentials · shopping vocabulary"] },
  ] },
  { id: "restaurant", name: "Food & drinking water", mn: "Хоол, унд", cluster: "everyday", emoji: "🍜", lessons: [
    { t: "Order a meal", p: [
      ["May I see the menu?", "Хоолны цэс үзэж болох уу?"], ["What do you recommend?", "Та ямар хоол санал болгох вэ?"], ["Drinking water, please.", "Ундны ус өгнө үү."], ["I'd like buuz.", "Бууз авъя."], ["The bill, please.", "Тооцоогоо хийе."], ["It is delicious, thank you.", "Амттай байна, баярлалаа."],
    ], d: [0, ["Энэ байна.", "Here you are."], 3, 2, 4], n: ["Buuz are steamed dumplings, usually filled with meat. Ask for safe drinking water and choose food that is freshly cooked and served hot.", "Traveler essentials · food and drinking water"] },
    { t: "Dietary needs & allergies", p: [
      ["I don't eat meat.", "Би мах иддэггүй."], ["Does this contain nuts?", "Үүнд самар орсон уу?"], ["I am allergic to nuts.", "Би самрын харшилтай."], ["Is this spicy?", "Энэ халуун ногоотой юу?"], ["Does this contain milk?", "Үүнд сүү орсон уу?"], ["Without meat, please.", "Махгүй хийж өгнө үү."],
    ], d: [2, 1, ["Орсон. Өөр хоол сонгоно уу.", "Yes. Please choose another dish."], 0, 5], n: ["For a serious allergy, carry a written allergy card in Mongolian and confirm ingredients and preparation with staff. This practice lesson cannot guarantee a meal is safe.", "FCDO Mongolia: health · plan for your medical needs"] },
  ] },
  { id: "lodging", name: "Accommodation", mn: "Байрлах газар", cluster: "everyday", emoji: "🛏️", lessons: [
    { t: "Check in", p: [
      ["I have a reservation.", "Би захиалга өгсөн."], ["Do you have a room available?", "Сул өрөө байна уу?"], ["How much is one night?", "Нэг хоноход хэд вэ?"], ["Is breakfast included?", "Өглөөний цай багтсан уу?"], ["I'd like to stay three nights.", "Би гурав хоног байрламаар байна."], ["Here is my passport.", "Миний паспорт энэ байна."],
    ], d: [0, ["Паспортоо үзүүлнэ үү.", "Please show your passport."], 5, 3, ["Тийм, багтсан.", "Yes, it is included."]], n: ["Confirm the nightly rate and what it includes. Keep your host's address and phone number saved offline. In Mongolia, carry your original passport as required for identification.", "FCDO Mongolia: safety and security — personal ID"] },
    { t: "Settle in & get connected", p: [
      ["What is the Wi-Fi password?", "Вайфайн нууц үг юу вэ?"], ["Where is the bathroom?", "Ариун цэврийн өрөө хаана вэ?"], ["May I have another blanket?", "Нэмэлт хөнжил өгч болох уу?"], ["Is there hot water?", "Халуун ус байгаа юу?"], ["Could you call a taxi?", "Такси дуудаж өгнө үү."], ["What time is check-out?", "Хэдэн цагт өрөөгөө хүлээлгэж өгөх вэ?"],
    ], d: [0, ["Нууц үг нь энд байна.", "The password is here."], 2, ["Тэгье.", "Certainly."], 5], n: ["Wi-Fi is common in city hotels, but rural camps may have limited connectivity. Ask accommodation staff to arrange a licensed taxi, particularly at night.", "FCDO Mongolia: safety and security — taxis and connectivity"] },
  ] },
];
