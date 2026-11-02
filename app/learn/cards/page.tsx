"use client";

import Link from "next/link";
import { Check, RotateCcw, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { TextSizeControl } from "@/components/Nav";
import { useLearner } from "@/components/useLearner";
import { useSaved } from "@/components/useSaved";
import { buildDeck, type Card } from "@/lib/deck";
import { cardResult, cardsToStudy, todayCount, type Progress } from "@/lib/progress";
import type { Phrase } from "@/lib/phrases";

export default function CardsPage() {
  const { progress, ready, update } = useLearner();
  const { saved } = useSaved();
  const [session, setSession] = useState(0);

  if (!ready || !progress) return <Loading />;
  return <Session key={session} progress={progress} saved={saved} update={update} onMore={() => setSession((n) => n + 1)} />;
}

function Session({
  progress,
  saved,
  update,
  onMore,
}: {
  progress: Progress;
  saved: Phrase[];
  update: (p: Progress) => Promise<void>;
  onMore: () => void;
}) {
  // The session's cards are chosen once, when it starts.
  const [queue, setQueue] = useState<Card[]>(() => {
    const deck = buildDeck(progress.completed, saved);
    const left = Math.max(progress.goal - todayCount(progress), 5);
    return cardsToStudy(progress, deck, Math.min(left, 30));
  });
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [done, setDone] = useState(false);
  const [retried, setRetried] = useState<string[]>([]);

  async function answer(knew: boolean) {
    const card = queue[i];
    await update(cardResult(progress, card.id, knew));
    if (knew) setKnewCount((n) => n + 1);
    // Missed cards come back once more at the end of this session.
    const again = !knew && !retried.includes(card.id);
    if (again) setRetried([...retried, card.id]);
    const nextQueue = again ? [...queue, card] : queue;
    setQueue(nextQueue);
    setFlipped(false);
    if (i + 1 >= nextQueue.length) setDone(true);
    else setI(i + 1);
  }

  // Keyboard: Space flips, 1 = didn't know, 2 = knew it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !queue.length) return;
      if (e.target instanceof HTMLElement && ["BUTTON", "INPUT", "TEXTAREA"].includes(e.target.tagName) && e.key === " ") return;
      if (e.key === " " && !flipped) {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && e.key === "1") answer(false);
      else if (flipped && e.key === "2") answer(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const card = queue[i];
  const goal = progress.goal;
  const todayN = todayCount(progress);
  const pct = queue.length ? Math.round((Math.min(i, queue.length) / queue.length) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/learn" className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink ring-1 ring-line hover:bg-paper" aria-label="Close and go back">
            <X size={22} aria-hidden />
          </Link>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={done ? 100 : pct} aria-valuemin={0} aria-valuemax={100} aria-label="Session progress">
            <div className="h-full rounded-full bg-gradient-to-r from-cobalt to-sky transition-all duration-500" style={{ width: `${done ? 100 : Math.max(pct, 3)}%` }} />
          </div>
          <div className="hidden sm:block">
            <TextSizeControl />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-3xl font-bold sm:text-4xl">Flashcards</h1>
          <p className="text-lg text-ink-soft">
            Today: <strong className="text-ink">{todayN}</strong> / {goal} cards
          </p>
        </div>

        {queue.length === 0 ? (
          <div className="panel mt-6 p-8 text-center">
            <h2 className="text-2xl font-bold">No cards yet</h2>
            <p className="mt-2 text-lg text-ink-soft">Finish a lesson or save a phrase in the translator. They become your cards.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/learn" className="btn btn-primary">
                Go to lessons
              </Link>
              <Link href="/translate#phrases" className="btn btn-line text-ink">
                Save phrases
              </Link>
            </div>
          </div>
        ) : done ? (
          <div className="bg-blend mt-6 rounded-[28px] px-6 py-12 text-center">
            <Star size={56} className="pop mx-auto text-gold" fill="currentColor" aria-hidden />
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{todayN >= goal ? "Daily goal done!" : "Session done!"}</h2>
            <p className="mt-3 text-xl text-white/90">
              You knew {knewCount} cards. Today: {todayN} / {goal}.
            </p>
            <p className="mx-auto mt-3 max-w-md text-lg text-white/90">Cards you knew come back later. Cards you missed come back sooner.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/learn" className="btn btn-gold">
                Back to my lessons
              </Link>
              <button type="button" className="btn btn-line text-white" onClick={onMore}>
                <RotateCcw size={18} aria-hidden /> More cards
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-6 text-ink-soft">
              Card {i + 1} of {queue.length} · from {card.source}
            </p>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              disabled={flipped}
              aria-label={flipped ? undefined : "Show the answer"}
              className="panel mt-3 flex min-h-[20rem] w-full flex-col items-center justify-center gap-4 p-8 text-center disabled:cursor-default"
            >
              <span lang="mn" className="pop font-display text-6xl font-bold sm:text-7xl" key={card.id + flipped}>
                {card.front}
              </span>
              {flipped ? (
                <span className="pop">
                  <span className="block text-3xl font-bold text-cobalt">{card.back}</span>
                  <span className="mt-2 block text-xl text-ink-soft">{card.extra}</span>
                </span>
              ) : (
                <span className="text-lg text-ink-soft">Say it in your head, then tap to check</span>
              )}
            </button>

            {flipped ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" className="btn min-h-16 bg-bad-soft text-lg text-ink ring-2 ring-bad/40 hover:ring-bad" onClick={() => answer(false)}>
                  <X size={22} className="text-bad" aria-hidden /> I didn&apos;t know
                </button>
                <button type="button" className="btn min-h-16 bg-ok-soft text-lg text-ink ring-2 ring-ok/40 hover:ring-ok" onClick={() => answer(true)}>
                  <Check size={22} className="text-ok" aria-hidden /> I knew it
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-primary mt-5 w-full min-h-16 text-lg" onClick={() => setFlipped(true)}>
                Show answer
              </button>
            )}
            <p className="mt-4 hidden text-center text-sm text-ink-soft sm:block">Keyboard: Space to flip, 1 = didn&apos;t know, 2 = knew it</p>
          </>
        )}
      </main>
    </div>
  );
}
