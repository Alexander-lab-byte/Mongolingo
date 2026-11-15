"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LearnHeader } from "@/components/LearnHeader";
import { Loading } from "@/components/Loading";
import { Feedback, OptionButton } from "@/components/QuizBits";
import { useLearner } from "@/components/useLearner";
import { useSaved } from "@/components/useSaved";
import { buildDeck, type Card } from "@/lib/deck";
import { cardResult, cardsToStudy, today } from "@/lib/progress";

/*
  Word herd: spaced repetition drawn as a nomad's herd.
  Every word you learned is one of the five livestock (таван хошуу мал).
  Words you remember graze inside the fence by the ger. Words that are due wander off;
  the longer you leave them, the farther they go, and after a week a wolf appears.
  You bring them home by remembering them (the same Leitner boxes as the flashcards).
*/

const ANIMALS = ["🐎", "🐫", "🐑", "🐐", "🐄"];
const NAMES = ["horse", "camel", "sheep", "goat", "cow"];
const ROUND = 8;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86_400_000);
}

type Beast = { card: Card; animal: string; kind: string; state: "home" | "away" | "wolf" | "new"; x: number; y: number };

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function HerdPage() {
  const { progress, ready, update } = useLearner();
  const { saved } = useSaved();
  const [round, setRound] = useState<Card[] | null>(null);
  const [i, setI] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [rescued, setRescued] = useState(0);

  const deck = useMemo(() => (progress ? buildDeck(progress.completed, saved) : []), [progress, saved]);

  if (!ready || !progress) return <Loading />;

  const t = today();
  const herd: Beast[] = deck.map((card) => {
    const h = hash(card.id);
    const k = h % 5;
    const c = progress.cards[card.id];
    const overdue = c ? daysBetween(c.due, t) : 0;
    const state: Beast["state"] = !c ? "new" : overdue < 0 ? "home" : overdue >= 7 ? "wolf" : "away";
    // Home: inside the fence ring around the ger (left). Away: out on the steppe, farther when more overdue.
    const angle = ((h >>> 8) % 360) * (Math.PI / 180);
    if (state === "home") {
      const r = 9 + ((h >>> 16) % 9);
      return { card, animal: ANIMALS[k], kind: NAMES[k], state, x: 22 + Math.cos(angle) * r, y: 55 + Math.sin(angle) * r * 1.4 };
    }
    if (state === "new") {
      // Just arrived: young animals waiting by the fence for their first check.
      return { card, animal: ANIMALS[k], kind: NAMES[k], state, x: 36 + ((h >>> 4) % 9), y: 40 + ((h >>> 12) % 40) };
    }
    const far = Math.min(1, 0.4 + overdue / 12);
    return { card, animal: ANIMALS[k], kind: NAMES[k], state, x: 40 + far * 52 + ((h >>> 4) % 8) - 4, y: 18 + ((h >>> 12) % 70) };
  });
  const counts = {
    home: herd.filter((b) => b.state === "home").length,
    fresh: herd.filter((b) => b.state === "new").length,
    away: herd.filter((b) => b.state === "away").length,
    wolf: herd.filter((b) => b.state === "wolf").length,
  };

  function ask(cards: Card[], idx: number) {
    const card = cards[idx];
    const pool = [...new Set(deck.filter((c) => c.back !== card.back && c.front !== card.front).map((c) => c.back))];
    setOptions(shuffle([card.back, ...shuffle(pool).slice(0, 3)]));
    setPicked(null);
  }

  function start() {
    const cards = cardsToStudy(progress!, deck, ROUND);
    if (!cards.length) return;
    setRound(cards);
    setI(0);
    setRescued(0);
    ask(cards, 0);
  }

  async function answer(o: string) {
    if (picked || !round) return;
    setPicked(o);
    const knew = o === round[i].back;
    if (knew) setRescued((n) => n + 1);
    await update(cardResult(progress!, round[i].id, knew));
  }

  function next() {
    if (!round) return;
    if (i + 1 >= round.length) {
      setRound(null);
      return;
    }
    setI(i + 1);
    ask(round, i + 1);
  }

  // ---------- the round ----------
  if (round) {
    const card = round[i];
    const beast = herd.find((b) => b.card.id === card.id);
    return (
      <div className="min-h-screen bg-paper">
        <LearnHeader />
        <main className="mx-auto max-w-2xl px-4 pb-20 pt-8">
          <p className="text-lg font-semibold text-ink-soft">
            Calling the herd home · {i + 1} of {round.length}
          </p>
          <div className="panel mt-4 p-6 text-center">
            <p className="text-6xl" aria-hidden>
              {beast?.state === "wolf" ? "🐺" : ""}
              {beast?.animal}
            </p>
            <p className="mt-2 text-ink-soft">
              {beast?.state === "wolf" ? `A wolf is near this ${beast.kind}! ` : beast?.state === "new" ? `A new ${beast.kind} joined your herd. ` : ""}Remember the word to bring it home.
            </p>
            <p className="mt-5 font-display text-5xl font-bold">{card.front}</p>
            <p className="mt-2 text-lg text-ink-soft">{card.extra}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {options.map((o) => (
              <OptionButton
                key={o}
                label={o}
                onClick={() => answer(o)}
                state={!picked ? "idle" : o === card.back ? "right" : o === picked ? "wrong" : "dim"}
              />
            ))}
          </div>
          {picked && (
            <Feedback
              ok={picked === card.back}
              text={picked === card.back ? `Your ${beast?.kind ?? "animal"} runs home!` : `It means “${card.back}”. It stays out tonight; you'll see it again soon.`}
              onNext={next}
              nextLabel={i + 1 >= round.length ? "Back to the pasture" : "Next animal"}
            />
          )}
        </main>
      </div>
    );
  }

  // ---------- the pasture ----------
  return (
    <div className="min-h-screen bg-paper">
      <LearnHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-5xl">Your word herd</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">
          Every word you learn is an animal in your herd. Words you remember graze by your ger. Words you are forgetting wander
          off, and after a week a wolf comes. Bring them home by remembering them.
        </p>
        {rescued > 0 && (
          <p role="status" className="mt-4 inline-flex rounded-full bg-ok-soft px-4 py-2 font-semibold text-ok">
            {rescued} {rescued === 1 ? "animal" : "animals"} brought home!
          </p>
        )}

        <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["At home", counts.home, "🏠"],
            ["New", counts.fresh, "🌱"],
            ["Wandering", counts.away, "🌾"],
            ["Wolf near", counts.wolf, "🐺"],
          ].map(([label, n, icon]) => (
            <div key={label as string} className="rounded-2xl bg-white p-4 ring-1 ring-line">
              <dt className="text-ink-soft">
                <span aria-hidden>{icon}</span> {label}
              </dt>
              <dd className="font-display text-3xl font-bold">{n}</dd>
            </div>
          ))}
        </dl>

        {deck.length === 0 ? (
          <div className="panel mt-8 p-6">
            <p className="text-xl font-bold">Your herd is empty.</p>
            <p className="mt-1 text-ink-soft">Finish any lesson and its words arrive as your first animals.</p>
            <Link href="/learn/packs" className="btn btn-primary mt-4">
              Start a lesson
            </Link>
          </div>
        ) : (
          <>
            <div
              className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[28px] ring-1 ring-line"
              style={{ background: "linear-gradient(180deg,#dde4e7 0%,#e4e6da 38%,#c9cfa9 39%,#aeb88a 100%)" }}
              role="img"
              aria-label={`Pasture: ${counts.home} animals at home, ${counts.fresh} new, ${counts.away} wandering, ${counts.wolf} with a wolf near.`}
            >
              <div className="absolute left-[22%] top-[55%] h-[42%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-dashed border-wood/50" aria-hidden />
              <span className="absolute left-[22%] top-[52%] -translate-x-1/2 -translate-y-1/2 text-5xl" aria-hidden>
                🛖
              </span>
              {herd.slice(0, 160).map((b) => (
                <span
                  key={b.card.id}
                  title={`${b.card.front} = ${b.card.back}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 select-none transition-all duration-700 ${b.state === "home" ? "text-2xl" : "text-xl opacity-80"}`}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  aria-hidden
                >
                  {b.state === "wolf" && <span className="mr-0.5">🐺</span>}
                  {b.animal}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="button" className="btn btn-primary text-lg" onClick={start} disabled={counts.fresh + counts.away + counts.wolf === 0}>
                {counts.fresh + counts.away + counts.wolf === 0 ? "Everyone is home" : `Call ${Math.min(ROUND, counts.fresh + counts.away + counts.wolf)} animals home`}
              </button>
              <p className="text-ink-soft">{deck.length} animals in your herd. The more you learn, the bigger it grows.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
