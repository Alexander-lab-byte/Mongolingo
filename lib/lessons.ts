// All learning content lives here so it is easy to check and fix.
// "trick" = a picture memory trick (keyword/mnemonic method, Atkinson & Raugh 1975).
// Every item has picture + sound + word = dual coding (Paivio; Mayer).

export type Item = {
  id: string;
  show: string; // what we display big (letter, word or phrase)
  small?: string; // lowercase letter
  say: string; // sound / romanization
  hint: string; // "like the 'a' in father"
  emoji: string;
  trick: string;
  word?: { mn: string; latin: string; en: string };
  meaning?: string; // for words and phrases
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  kind: "letters" | "words";
  items: Item[];
};

const L = (
  show: string,
  say: string,
  hint: string,
  emoji: string,
  trick: string,
  word: [string, string, string],
): Item => ({
  id: show,
  show,
  small: show.toLowerCase(),
  say,
  hint,
  emoji,
  trick,
  word: { mn: word[0], latin: word[1], en: word[2] },
});

export const LESSONS: Lesson[] = [
  {
    id: "friends",
    title: "Letters you already know",
    subtitle: "They look and sound like English",
    emoji: "🤝",
    kind: "letters",
    items: [
      L("А", "a", "like the 'a' in 'father'", "🍎", "А looks like A and says 'a'. Easy!", ["аав", "aav", "father"]),
      L("К", "k", "like the 'k' in 'kite'", "🪁", "К is just K. Fly a kite!", ["кофе", "kofe", "coffee"]),
      L("М", "m", "like the 'm' in 'mom'", "👩", "М is M. Mmm, mom!", ["мод", "mod", "tree"]),
      L("О", "o", "like the 'o' in 'orange'", "🍊", "О is round like an orange.", ["ой", "oi", "forest"]),
      L("Т", "t", "like the 't' in 'tea'", "🍵", "Т is T. Time for tea!", ["тал", "tal", "steppe (grassland)"]),
    ],
  },
  {
    id: "tricksters",
    title: "Tricky twins",
    subtitle: "They look English but sound different",
    emoji: "🎭",
    kind: "letters",
    items: [
      L("В", "v", "like the 'v' in 'van'", "🚐", "В has two bumps like the wheels of a Van.", ["вагон", "vagon", "train car"]),
      L("Е", "ye", "like 'ye' in 'yes'", "✅", "Е says 'ye' — say YES to Е!", ["ес", "yös", "nine"]),
      L("Н", "n", "like the 'n' in 'no'", "🚫", "Н looks like H but says N. H? No! N!", ["нар", "nar", "sun"]),
      L("Р", "r", "a rolled 'r', like 'rrr'", "🐯", "Р looks like P but growls 'rrr' like a tiger.", ["ресторан", "restoran", "restaurant"]),
      L("С", "s", "like the 's' in 'sun'", "🐍", "С is a curvy snake: sss!", ["сар", "sar", "moon / month"]),
      L("У", "u", "like the 'oo' in 'book'", "📖", "У looks like Y but says 'oo' as in book.", ["ус", "us", "water"]),
      L("Х", "kh", "like the 'ch' in Scottish 'loch'", "😮‍💨", "Х is an X — breathe out hard: 'kh!'", ["хот", "khot", "city"]),
    ],
  },
  {
    id: "shapes1",
    title: "New shapes, part 1",
    subtitle: "Six new friends",
    emoji: "🧩",
    kind: "letters",
    items: [
      L("Б", "b", "like the 'b' in 'ball'", "🎈", "Б is a b with a hat on.", ["бал", "bal", "honey"]),
      L("Г", "g", "like the 'g' in 'go'", "🚩", "Г is a flag on a pole. Go, go, go!", ["гэр", "ger", "home / ger"]),
      L("Д", "d", "like the 'd' in 'door'", "🏠", "Д looks like a little house with a door.", ["дэлгүүр", "delgüür", "shop"]),
      L("З", "dz", "like the 'ds' in 'adds'", "3️⃣", "З looks like the number 3.", ["зам", "zam", "road"]),
      L("И", "i", "like the 'ee' in 'see'", "👀", "И is a backwards N. I see!", ["би", "bi", "I / me"]),
      L("Л", "l", "an 'l' with air blowing out the sides", "⛺", "Л is a tent. Say 'l' and blow air.", ["лаа", "laa", "candle"]),
    ],
  },
  {
    id: "shapes2",
    title: "New shapes, part 2",
    subtitle: "Seven more — you are halfway!",
    emoji: "🧱",
    kind: "letters",
    items: [
      L("Ж", "j", "like the 'j' in 'jam'", "🐞", "Ж looks like a bug with many legs. Jump, bug!", ["жимс", "jims", "fruit"]),
      L("Й", "y", "a short 'y', like in 'boy'", "👦", "Й is И wearing a little hat.", ["сайн", "sain", "good"]),
      L("П", "p", "like the 'p' in 'pen'", "🥅", "П is a goal post. Pass!", ["паспорт", "pasport", "passport"]),
      L("Ф", "f", "like the 'f' in 'phone'", "🔍", "Ф is a magnifying glass. Find it!", ["фото", "foto", "photo"]),
      L("Ц", "ts", "like the 'ts' in 'cats'", "🐱", "Ц has a little tail, like a cat.", ["цай", "tsai", "tea"]),
      L("Ч", "ch", "like the 'ch' in 'chair'", "🪑", "Ч looks like a chair from the side.", ["чи", "chi", "you"]),
      L("Ш", "sh", "like the 'sh' in 'shop'", "🛒", "Ш looks like a shopping basket. Shhh!", ["шар", "shar", "yellow"]),
    ],
  },
  {
    id: "specials",
    title: "Mongolian specials",
    subtitle: "Letters that make Mongolian unique",
    emoji: "⭐",
    kind: "letters",
    items: [
      L("Ө", "ö", "like 'u' in 'fur', with round lips", "🥚", "Ө is an egg with a line. Say 'ö' with round lips.", ["өдөр", "ödör", "day"]),
      L("Ү", "ü", "like 'oo' in 'food'", "🍜", "Ү is a cup on a stick. Slurp the 'oo' in food!", ["үнэ", "üne", "price"]),
      L("Э", "e", "like the 'e' in 'bed'", "🛏️", "Э is a backwards C. Go to bed!", ["эмч", "emch", "doctor"]),
      L("Ы", "ii", "a long 'ee'", "🦵", "Ы looks like ь plus a stick. Make the sound long: 'iii'.", ["Монголын", "Mongolyn", "of Mongolia"]),
      L("Ь", "(soft)", "no sound — makes the letter before it soft", "🪶", "Ь is a soft feather. It has no sound.", ["морь", "mori", "horse"]),
      L("Ъ", "(hard)", "no sound — very rare", "🧱", "Ъ is a hard brick. You will rarely see it.", ["объект", "obyekt", "object"]),
    ],
  },
  {
    id: "yletters",
    title: "The Y-family",
    subtitle: "Last four letters — finish the alphabet!",
    emoji: "🏁",
    kind: "letters",
    items: [
      L("Ё", "yo", "like 'yo' in 'yo-yo'", "🪀", "Ё has two dots like a yo-yo.", ["ёс", "yos", "custom / tradition"]),
      L("Ю", "yu", "like the word 'you'", "🫵", "Ю: I + O = 'you'!", ["юу", "yuu", "what?"]),
      L("Я", "ya", "like 'ya' in 'yard'", "🙋", "Я is a backwards R. Ya!", ["яаралтай", "yaaraltai", "emergency / urgent"]),
      L("Щ", "shch", "'sh' + 'ch' together (Russian words)", "🍲", "Щ is Ш with a tail.", ["борщ", "borshch", "borscht soup"]),
    ],
  },
  {
    id: "signs",
    title: "Read real street signs",
    subtitle: "Use your letters in the city",
    emoji: "🪧",
    kind: "words",
    items: [
      { id: "taksi", show: "ТАКСИ", say: "taksi", hint: "", emoji: "🚕", trick: "Т-А-К-С-И: you know every letter!", meaning: "Taxi" },
      { id: "delguur", show: "ДЭЛГҮҮР", say: "delgüür", hint: "", emoji: "🏪", trick: "Look for this above shop doors.", meaning: "Shop" },
      { id: "emiin", show: "ЭМИЙН САН", say: "emiin san", hint: "", emoji: "💊", trick: "'Эм' means medicine.", meaning: "Pharmacy" },
      { id: "emneleg", show: "ЭМНЭЛЭГ", say: "emneleg", hint: "", emoji: "🏥", trick: "Starts with 'эм' (medicine) too.", meaning: "Hospital" },
      { id: "orts", show: "ОРЦ", say: "orts", hint: "", emoji: "➡️", trick: "From орох = to go in.", meaning: "Entrance" },
      { id: "garts", show: "ГАРЦ", say: "garts", hint: "", emoji: "🚪", trick: "From гарах = to go out.", meaning: "Exit" },
      { id: "avtobus", show: "АВТОБУС", say: "avtobus", hint: "", emoji: "🚌", trick: "Sounds almost like English.", meaning: "Bus" },
    ],
  },
  {
    id: "hello",
    title: "Hello, thank you & more",
    subtitle: "Your first words to speak",
    emoji: "👋",
    kind: "words",
    items: [
      { id: "sainuu", show: "Сайн байна уу?", say: "sain baina uu?", hint: "", emoji: "👋", trick: "Say it to everyone you meet!", meaning: "Hello (How are you?)" },
      { id: "bayarlalaa", show: "Баярлалаа", say: "bayarlalaa", hint: "", emoji: "🙏", trick: "Buy-ar-la-laa — sing it!", meaning: "Thank you" },
      { id: "tiim", show: "Тийм", say: "tiim", hint: "", emoji: "👍", trick: "Sounds like 'team' — yes, team!", meaning: "Yes" },
      { id: "ugui", show: "Үгүй", say: "ügüi", hint: "", emoji: "👎", trick: "Oo-gooy — no way!", meaning: "No" },
      { id: "hed", show: "Хэд вэ?", say: "khed ve?", hint: "", emoji: "💰", trick: "Use it in every shop and market.", meaning: "How much is it?" },
      { id: "uuchlaarai", show: "Уучлаарай", say: "uuchlaarai", hint: "", emoji: "🙇", trick: "Use it to say sorry or excuse me.", meaning: "Sorry / Excuse me" },
      { id: "bayartai", show: "Баяртай", say: "bayartai", hint: "", emoji: "🫶", trick: "Like 'bayarlalaa' but shorter.", meaning: "Goodbye" },
    ],
  },
  {
    id: "numbers1",
    title: "Numbers 1 to 5",
    subtitle: "Count in Mongolian",
    emoji: "🔢",
    kind: "words",
    items: [
      { id: "n1", show: "нэг", say: "neg", hint: "", emoji: "1️⃣", trick: "Think of one long neck: neg.", meaning: "1" },
      { id: "n2", show: "хоёр", say: "khoyor", hint: "", emoji: "2️⃣", trick: "Two singers in a choir: kho-yor.", meaning: "2" },
      { id: "n3", show: "гурав", say: "gurav", hint: "", emoji: "3️⃣", trick: "Three gurus: gu-rav.", meaning: "3" },
      { id: "n4", show: "дөрөв", say: "döröv", hint: "", emoji: "4️⃣", trick: "Four doors: dö-röv.", meaning: "4" },
      { id: "n5", show: "тав", say: "tav", hint: "", emoji: "5️⃣", trick: "A five-star tavern: tav.", meaning: "5" },
    ],
  },
  {
    id: "numbers2",
    title: "Numbers 6 to 10",
    subtitle: "Finish counting to ten",
    emoji: "🔢",
    kind: "words",
    items: [
      { id: "n6", show: "зургаа", say: "zurgaa", hint: "", emoji: "6️⃣", trick: "Six zebras: zur-gaa.", meaning: "6" },
      { id: "n7", show: "долоо", say: "doloo", hint: "", emoji: "7️⃣", trick: "Seven dollars: do-loo.", meaning: "7" },
      { id: "n8", show: "найм", say: "naim", hint: "", emoji: "8️⃣", trick: "Eight sounds like “name”: naim.", meaning: "8" },
      { id: "n9", show: "ес", say: "yös", hint: "", emoji: "9️⃣", trick: "Nine? Yes! yös.", meaning: "9" },
      { id: "n10", show: "арав", say: "arav", hint: "", emoji: "🔟", trick: "Ten people at a rave: a-rav.", meaning: "10" },
    ],
  },
  {
    id: "money",
    title: "Prices and money",
    subtitle: "Understand prices at the shop",
    emoji: "💰",
    kind: "words",
    items: [
      { id: "n20", show: "хорь", say: "khori", hint: "", emoji: "💵", trick: "Twenty voices in a chorus: khori.", meaning: "20" },
      { id: "n50", show: "тавь", say: "tavi", hint: "", emoji: "💵", trick: "Fifty looks like тав (5) with a soft ь.", meaning: "50" },
      { id: "n100", show: "зуу", say: "zuu", hint: "", emoji: "💯", trick: "A hundred animals at the zoo: zuu.", meaning: "100" },
      { id: "n500", show: "таван зуу", say: "tavan zuu", hint: "", emoji: "💴", trick: "Five hundreds: таван (5) + зуу (100).", meaning: "500" },
      { id: "n1000", show: "мянга", say: "myanga", hint: "", emoji: "💰", trick: "A thousand is many: myanga.", meaning: "1,000" },
      { id: "n5000", show: "таван мянга", say: "tavan myanga", hint: "", emoji: "💰", trick: "Five thousands: таван + мянга.", meaning: "5,000" },
      { id: "n10000", show: "арван мянга", say: "arvan myanga", hint: "", emoji: "🏦", trick: "Ten thousands: арван + мянга. Prices are in төгрөг (₮).", meaning: "10,000" },
    ],
  },
];

export const TOTAL_LETTERS = LESSONS.filter((l) => l.kind === "letters").reduce(
  (n, l) => n + l.items.length,
  0,
);

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function lettersLearned(completed: string[]) {
  return LESSONS.filter((l) => l.kind === "letters" && completed.includes(l.id)).reduce(
    (n, l) => n + l.items.length,
    0,
  );
}
