import type { ClusterId } from "./curriculum";
import type { Item, Lesson } from "./lessons";
import { WORD_SENTENCES, summerSource, vocabularySentenceLesson } from "./wordSentences";

export const CHAPTERS = {
  everyday: { title: "First encounters", description: "Meet people, order food, and settle in.", color: "#dab692", ink: "#3a2a1f", surface: "#efe2d3", season: 0 },
  around: { title: "On the move", description: "Find your way from the city to the countryside.", color: "#8d9b6a", ink: "#38422b", surface: "#e4e6da", season: 1 },
  practical: { title: "When it matters", description: "Handle everyday problems and ask for help.", color: "#8a9ea7", ink: "#384952", surface: "#dde4e7", season: 2 },
  culture: { title: "Inside Mongolian life", description: "Visit a ger, meet the herd, and join the celebrations.", color: "#d3aa98", ink: "#583d30", surface: "#e8dfe0", season: 3 },
} satisfies Record<ClusterId, { title: string; description: string; color: string; ink: string; surface: string; season: number }>;

type Mission = { scene: string; goal: string; target: number };

function mission(scene: string, goal: string, target: number): Mission {
  return { scene, goal, target };
}

// target is the zero-based index of the phrase that completes the mission.
export const MISSIONS: Record<string, Mission> = {
  "signs": mission("Use the place-finding question from summer camp to ask a local for help.", "Ask where the pharmacy is.", 2),
  "hello": mission("You have chosen something at the summer-camp shop.", "Thank the shopkeeper and say you’ll take it.", 1),
  "numbers1": mission("A friend at summer camp asks about your family.", "Say that there are four people in your family.", 3),
  "numbers2": mission("You and a friend are sharing lunch at the camp.", "Order eight buuz in a complete sentence.", 2),
  "money": mission("A market seller shows you a price of 10,000 tögrög.", "Ask to pay 10,000 tögrög in cash.", 6),
  "greet-1": mission("You arrive early and meet your host at the door.", "Wish your host a good morning.", 4),
  "greet-2": mission("A classmate has just introduced themself.", "Ask where they’re from.", 2),
  "family-1": mission("A friend is showing you a family photo.", "Ask how many people are in their family.", 4),
  "family-2": mission("You are separated from your travel companion at a market.", "Ask a local person for help.", 0),
  "time-money-1": mission("Practice just ended. You and your friend are meeting again tomorrow.", "Say you’ll see them tomorrow.", 4),
  "time-money-2": mission("You’re at a market stall with cash in your pocket.", "Ask whether you can pay in cash.", 3),
  "shopping-1": mission("A shopkeeper points to a jacket you like.", "Ask to try it on.", 3),
  "shopping-2": mission("You like the coat but it’s outside your budget.", "Ask if there’s a cheaper one.", 2),
  "restaurant-1": mission("The server comes back to take your order.", "Order buuz.", 3),
  "restaurant-2": mission("You’re about to order and want a mild dish.", "Ask if the dish is spicy.", 3),
  "lodging-1": mission("You’re at the front desk, planning a three-night stay.", "Ask whether breakfast is included.", 3),
  "lodging-2": mission("Your room gets cold at night.", "Ask for another blanket.", 2),
  "taxi-1": mission("You’ve climbed into a taxi. The driver asks where you’re going.", "Ask to go to Sükhbaatar Square.", 2),
  "taxi-2": mission("Your destination is just outside the window.", "Ask the driver to stop here.", 3),
  "bus-1": mission("A bus pulls up, but the route sign is hard to read.", "Ask if it goes to the centre.", 1),
  "bus-2": mission("You’ve boarded the train and found an empty seat.", "Ask if the seat is free.", 2),
  "directions-1": mission("A local has offered to help. You have a map open.", "Ask them to show you the location on the map.", 3),
  "directions-2": mission("Someone needs directions to the museum.", "Tell them to go straight and then turn left.", 5),
  "countryside-1": mission("You’re driving across the countryside and the fuel is low.", "Ask where to buy petrol.", 2),
  "countryside-2": mission("You see a valley you’d love to photograph.", "Ask your driver if you can stop for a photo.", 3),
  "phone-1": mission("Your battery is nearly empty at a café.", "Ask if you can charge your phone here.", 3),
  "phone-2": mission("Your roaming plan is expensive and you need a local number.", "Ask where to buy a SIM card.", 3),
  "work-1": mission("Someone you just met asks about your job.", "Say you work at a school.", 1),
  "work-2": mission("A friend asks about your Mongolian studies.", "Say that you study Mongolian every day.", 0),
  "doctor-1": mission("A doctor asks how you’re feeling.", "Say that your stomach hurts.", 3),
  "doctor-2": mission("A clinician asks about allergies before prescribing anything.", "Say that you’re allergic to penicillin.", 0),
  "pharmacy-1": mission("You’re at the pharmacy counter with a question.", "Ask if you need a prescription.", 3),
  "pharmacy-2": mission("You need to stock a first-aid kit.", "Ask if the pharmacy has bandages.", 2),
  "emergency-1": mission("Someone nearby needs urgent medical help.", "Ask a bystander to call an ambulance.", 2),
  "emergency-2": mission("You’re talking to someone who can send help.", "Tell them there has been an accident.", 2),
  "weather-1": mission("A friend is deciding whether to take an umbrella.", "Tell them it will rain.", 4),
  "weather-2": mission("Your friend is heading out into a cold evening.", "Tell them to dress warmly.", 3),
  "plans-1": mission("You’ve made plans together and need a place to meet.", "Ask where you’ll meet.", 4),
  "plans-2": mission("The proposed day doesn’t work for you.", "Ask if another day would work.", 3),
  "help-1": mission("Someone just spoke too fast for you to catch the phrase.", "Ask them to speak slowly.", 1),
  "help-2": mission("A passerby gives you a name you want to remember.", "Ask them to write it down.", 1),
  "etiquette-1": mission("You’ve reached the door of your host’s ger.", "Ask if you may come in.", 0),
  "etiquette-2": mission("Your host offers you another helping and you’re full.", "Thank them and say you’ve had enough.", 2),
  "livestock-1": mission("You’re pointing out a distant camel to a friend.", "Choose the Mongolian word for camel.", 1),
  "livestock-2": mission("You’ve arrived at a herder’s camp and want to try riding.", "Ask if you can ride a horse.", 4),
  "food-1": mission("Your host pours fermented mare’s milk.", "Choose its Mongolian name.", 2),
  "food-2": mission("You’re at a market stall looking at a warm fried pastry.", "Say you’d like to try khuushuur.", 1),
  "migration-1": mission("A herder is telling you about moving camp.", "Ask where their winter camp is.", 2),
  "migration-2": mission("You’ve been discussing how the landscape changes through the year.", "Ask which season they like.", 4),
  "naadam-1": mission("A friend is deciding what to watch at the festival.", "Say you’d like to watch wrestling.", 2),
  "naadam-2": mission("You’ve reached the festival grounds and need a ticket.", "Ask where to buy tickets.", 4),
  "tsagaan-sar-1": mission("You’ve arrived to visit relatives for the Lunar New Year.", "Offer a Tsagaan Sar greeting.", 0),
  "tsagaan-sar-2": mission("You’re leaving after a generous holiday meal.", "Thank the hosts for the tasty food.", 3),
};

export type Challenge = {
  id: string;
  kind: "meaning" | "order" | "reply" | "sentence";
  item: Item;
  choices: string[];
  context?: { scene: string; lessonId: string; title: string; phrase: string };
};

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function orderTokens(phrase: string) {
  const words = phrase.split(/\s+/);
  const shuffled = shuffle(words);
  if (shuffled.join(" ") !== phrase) return shuffled;
  const different = words.findIndex((word) => word !== words[0]);
  if (different > 0) [shuffled[0], shuffled[different]] = [shuffled[different], shuffled[0]];
  return shuffled;
}

export function challengeAnswer(challenge: Challenge): string {
  return challenge.kind === "meaning" ? challenge.item.meaning! : challenge.item.show;
}

export function buildFieldChallenges(lesson: Lesson, target: Mission, cluster: ClusterId, format: "phrases" | "vocabulary" = "phrases"): Challenge[] {
  if (format === "vocabulary") lesson = vocabularySentenceLesson(lesson);
  function make(kind: Challenge["kind"], item: Item): Challenge {
    const toChoice = (entry: Item) => kind === "meaning" ? entry.meaning! : entry.show;
    const answer = toChoice(item);
    const other = [...new Set(lesson.items.map(toChoice))].filter((value) => value !== answer);
    const choices = kind === "order" ? orderTokens(item.show) : shuffle([answer, ...shuffle(other).slice(0, 2)]);
    const sentence = format === "vocabulary" ? WORD_SENTENCES[lesson.id]?.find(entry => entry.wordId === item.id) : undefined;
    const context = sentence ? { scene: sentence.scene, ...summerSource(sentence) } : undefined;
    return { id: `${kind}-${item.id}`, kind, item, choices, context };
  }

  const targetItem = lesson.items[target.target];
  const items = shuffle(lesson.items.filter((item) => item !== targetItem));
  if (format === "vocabulary") {
    return [...items.map((item, index) => make(index === 2 ? "order" : index % 2 ? "sentence" : "meaning", item)), make("reply", targetItem)];
  }
  const preferred = cluster === "around" || cluster === "culture" ? 0 : 1;
  const orderItem = items.filter((item) => new Set(item.show.split(/\s+/)).size > 1)
    .sort((a, b) => Math.abs(a.show.split(" ").length - (4 + preferred)) - Math.abs(b.show.split(" ").length - (4 + preferred)))[0];
  const questions = items.map((item) => make(item === orderItem ? "order" : "meaning", item));
  const reply = make("reply", targetItem);
  return cluster === "practical" ? [reply, ...questions] : [...questions, reply];
}
