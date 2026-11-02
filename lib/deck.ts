import { LESSONS } from "./lessons";
import { transliterate } from "./translit";
import type { Phrase } from "./phrases";

export type Card = {
  id: string;
  source: string; // lesson title or "My phrases"
  front: string; // Mongolian
  back: string; // meaning / sound
  extra: string; // pronunciation or example
};

/** Your deck = everything from finished lessons + your saved phrases. */
export function buildDeck(completed: string[], saved: Phrase[]): Card[] {
  const cards: Card[] = [];
  for (const l of LESSONS) {
    if (!completed.includes(l.id)) continue;
    for (const it of l.items) {
      if (l.kind === "letters") {
        cards.push({
          id: `${l.id}:${it.id}`,
          source: l.title,
          front: `${it.show} ${it.small}`,
          back: `says “${it.say}”`,
          extra: it.word ? `${it.word.mn} (${it.word.latin}) = ${it.word.en}` : it.hint,
        });
      } else {
        cards.push({ id: `${l.id}:${it.id}`, source: l.title, front: it.show, back: it.meaning ?? "", extra: `“${it.say}”` });
      }
    }
  }
  for (const p of saved) {
    cards.push({ id: `saved:${p.mn}`, source: "My phrases", front: p.mn, back: p.en, extra: `“${transliterate(p.mn)}”` });
  }
  return cards;
}

export type Badge = { id: string; title: string; desc: string; earned: boolean };

export function badges(opts: { completed: string[]; letters: number; bestStreak: number; reviewed: number; talks: string[]; saved: number }): Badge[] {
  const { completed, letters, bestStreak, reviewed, talks, saved } = opts;
  return [
    { id: "first", title: "First step", desc: "Finish your first lesson", earned: completed.length >= 1 },
    { id: "alphabet", title: "Alphabet", desc: "Learn all 35 letters", earned: letters >= 35 },
    { id: "signs", title: "Sign reader", desc: "Finish the street signs lesson", earned: completed.includes("signs") },
    { id: "money", title: "Money ready", desc: "Finish prices and money", earned: completed.includes("money") },
    { id: "taxi", title: "Taxi talk", desc: "Finish the taxi conversation", earned: talks.includes("taxi") },
    { id: "shop", title: "Shopper", desc: "Finish the shop conversation", earned: talks.includes("shop") },
    { id: "streak3", title: "3-day streak", desc: "Practise 3 days in a row", earned: bestStreak >= 3 },
    { id: "cards50", title: "50 cards", desc: "Review 50 flashcards", earned: reviewed >= 50 },
    { id: "collector", title: "Collector", desc: "Save 5 phrases", earned: saved >= 5 },
  ];
}
