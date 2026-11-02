"use client";

import Link from "next/link";
import { Car, Check, Eye, EyeOff, ShoppingBag, Star, X } from "lucide-react";
import { useState } from "react";
import { Loading } from "@/components/Loading";
import { TextSizeControl } from "@/components/Nav";
import { useLearner } from "@/components/useLearner";
import { DIALOGUES, type Dialogue } from "@/lib/dialogues";
import { finishTalk } from "@/lib/progress";
import { transliterate } from "@/lib/translit";

const ICONS = { car: Car, shop: ShoppingBag };

export default function TalkPage() {
  const { progress, ready, update } = useLearner();
  const [active, setActive] = useState<Dialogue | null>(null);

  if (!ready || !progress) return <Loading />;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          {active ? (
            <button type="button" onClick={() => setActive(null)} className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-line hover:bg-paper" aria-label="Back to conversations">
              <X size={22} aria-hidden />
            </button>
          ) : (
            <Link href="/learn" className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-line hover:bg-paper" aria-label="Close and go back">
              <X size={22} aria-hidden />
            </Link>
          )}
          <TextSizeControl />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {!active ? (
          <>
            <h1 className="text-3xl font-bold sm:text-4xl">Conversations</h1>
            <p className="mt-2 text-lg text-ink-soft">Practise a real situation before it happens.</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {DIALOGUES.map((d) => {
                const Icon = ICONS[d.icon];
                const done = progress.talks.includes(d.id);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setActive(d)}
                      className="flex w-full items-center gap-4 rounded-3xl bg-white p-6 text-left ring-1 ring-line transition hover:ring-cobalt"
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-soft text-cobalt">
                        <Icon size={28} aria-hidden />
                      </span>
                      <span className="flex-1">
                        <span className="block text-xl font-bold">{d.title}</span>
                        <span className="text-ink-soft">
                          {d.turns.length} steps{done ? ", done" : ""}
                        </span>
                      </span>
                      {done && <Check className="text-ok" size={24} aria-label="Done" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <Conversation
            key={active.id}
            d={active}
            onDone={async (firstTry) => {
              await update(finishTalk(progress, active.id, firstTry));
            }}
            onExit={() => setActive(null)}
          />
        )}
      </main>
    </div>
  );
}

function Conversation({ d, onDone, onExit }: { d: Dialogue; onDone: (firstTry: number) => Promise<void>; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [missed, setMissed] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [log, setLog] = useState<{ who: "them" | "me"; mn: string; en: string }[]>([{ who: "them", ...d.turns[0].them }]);

  const turn = d.turns[step];
  const choice = picked != null ? turn.options[picked] : null;

  function pick(idx: number) {
    if (choice?.ok) return;
    setPicked(idx);
    if (!turn.options[idx].ok) setMissed((m) => m + 1);
  }

  async function next() {
    const mine = turn.options.find((o) => o.ok)!;
    const nextLog = [...log, { who: "me" as const, mn: mine.mn, en: mine.en }];
    if (step + 1 < d.turns.length) {
      setLog([...nextLog, { who: "them", ...d.turns[step + 1].them }]);
      setStep(step + 1);
      setPicked(null);
    } else {
      setLog(nextLog);
      setFinished(true);
      await onDone(Math.max(d.turns.length - missed, 0));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{d.title}</h1>
        <button type="button" className="btn btn-line min-h-11 px-4 text-base text-ink" onClick={() => setShowEn(!showEn)} aria-pressed={showEn}>
          {showEn ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />} {showEn ? "Hide English" : "Show English"}
        </button>
      </div>

      {/* Chat */}
      <ol className="mt-6 flex flex-col gap-3" aria-live="polite">
        {log.map((m, k) => (
          <li key={k} className={`flex ${m.who === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`pop max-w-[85%] rounded-3xl px-5 py-3 ${m.who === "me" ? "rounded-br-md bg-cobalt text-white" : "rounded-bl-md bg-white ring-1 ring-line"}`}>
              <p className={`text-sm font-semibold ${m.who === "me" ? "text-white/90" : "text-ink-soft"}`}>{m.who === "me" ? "You" : d.who}</p>
              <p lang="mn" className="font-display text-xl font-bold">
                {m.mn}
              </p>
              <p className={m.who === "me" ? "text-white/90" : "text-ink-soft"}>“{transliterate(m.mn)}”</p>
              {(showEn || m.who === "me") && <p className={`mt-1 ${m.who === "me" ? "text-white" : "text-ink"}`}>{m.en}</p>}
            </div>
          </li>
        ))}
      </ol>

      {!finished ? (
        <div className="mt-8">
          <p className="text-lg font-semibold">What do you say?</p>
          <div className="mt-3 flex flex-col gap-3">
            {turn.options.map((o, idx) => {
              const state = picked === idx ? (o.ok ? "right" : "wrong") : choice?.ok ? "dim" : "idle";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(idx)}
                  disabled={!!choice?.ok}
                  className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left transition ${
                    state === "right" ? "border-ok bg-ok-soft" : state === "wrong" ? "border-bad bg-bad-soft" : state === "dim" ? "border-line bg-white opacity-50" : "border-line bg-white hover:border-cobalt hover:bg-sky-soft"
                  }`}
                >
                  <span>
                    <span lang="mn" className="block font-display text-lg font-bold">
                      {o.mn}
                    </span>
                    <span className="block text-ink-soft">“{transliterate(o.mn)}”</span>
                    {showEn && <span className="block">{o.en}</span>}
                  </span>
                  {state === "right" && <Check className="mt-1 shrink-0 text-ok" aria-label="Correct" />}
                  {state === "wrong" && <X className="mt-1 shrink-0 text-bad" aria-label="Not this one" />}
                </button>
              );
            })}
          </div>
          {choice && (
            <div className={`pop mt-4 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${choice.ok ? "bg-ok-soft" : "bg-gold-soft"}`} role="status">
              <p className="text-lg">
                {choice.ok ? (
                  <>
                    <strong>Yes!</strong> “{choice.en}”
                  </>
                ) : (
                  <>
                    <strong>Not quite.</strong> {choice.why} Try another one.
                  </>
                )}
              </p>
              {choice.ok && (
                <button type="button" className="btn btn-primary shrink-0" onClick={next}>
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] bg-cobalt px-6 py-10 text-center text-white">
          <Star size={48} className="pop mx-auto text-gold" fill="currentColor" aria-hidden />
          <h2 className="mt-3 text-3xl font-bold">You did it!</h2>
          <p className="mt-2 text-xl text-white/90">
            {missed === 0 ? "No mistakes. You're ready for the real thing." : `${missed} wrong ${missed === 1 ? "try" : "tries"}. Try again to make it perfect.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-gold" onClick={onExit}>
              More conversations
            </button>
            <Link href="/learn" className="btn btn-line text-white">
              Back to my lessons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
