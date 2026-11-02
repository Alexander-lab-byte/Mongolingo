"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_KEY } from "@/lib/progress";
import { Confetti, Feedback, OptionButton } from "./QuizBits";

const KNOWN = [
  { ch: "А", say: "a", emoji: "🍎" },
  { ch: "К", say: "k", emoji: "🪁" },
  { ch: "М", say: "m", emoji: "👩" },
  { ch: "О", say: "o", emoji: "🍊" },
  { ch: "Т", say: "t", emoji: "🍵" },
];

const QUESTIONS = [
  { q: "Which letter says “s”?", big: null, options: ["Р", "С", "Н", "К"], answer: "С", why: "С is the curvy snake: sss!" },
  { q: "What sound does this letter make?", big: "И", options: ["“ee” as in see", "“n” as in no", "“i” as in ice", "“u” as in up"], answer: "“ee” as in see", why: "И is a backwards N. I see — “ee”!" },
  { q: "You see this sign on the street. What does it say?", big: "ТАКСИ", options: ["Bank", "Taxi", "Cafe", "Shop"], answer: "Taxi", why: "Т-А-К-С-И = t-a-k-s-i = Taxi!" },
];

export function TryDemo() {
  const [step, setStep] = useState(0); // 0 known letters, 1 new letters, 2 quiz, 3 done
  const [flipped, setFlipped] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const totalSteps = 3;
  const progress = (Math.min(step, 2) + (step >= 2 ? correctAnswers / QUESTIONS.length : 0)) / totalSteps;
  const q = QUESTIONS[qi];

  function next() {
    if (step === 2) {
      if (picked == null) return;
      if (picked === q.answer) setCorrectAnswers((count) => count + 1);
      if (qi < QUESTIONS.length - 1) {
        setQi(qi + 1);
        setPicked(null);
        return;
      }
      try {
        localStorage.setItem(DEMO_KEY, "1");
      } catch {}
    }
    setStep(step + 1);
  }

  return (
    <section id="try" className="scroll-mt-24 bg-sky px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-center font-extrabold uppercase tracking-wide text-mn-red">Free mini lesson · 2 minutes</p>
        <h2 className="mt-1 text-center text-4xl font-black">Can you read Mongolian? Let&apos;s see!</h2>

        <div className="card relative mt-8 overflow-hidden p-5 sm:p-8">
          {/* Progress bar: a visible finish line keeps people going (goal-gradient effect) */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-5 flex-1 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label="Mini lesson progress"
            >
              <div className="h-full rounded-full bg-ok transition-all duration-500" style={{ width: `${Math.max(progress * 100, 6)}%` }} />
            </div>
            <span className="font-extrabold">{Math.round(progress * 100)}%</span>
          </div>

          {step === 0 && (
            <div>
              <h3 className="text-2xl font-black">Good news: you already know these 5 letters!</h3>
              <p className="mt-1 text-lg text-ink-soft">Tap each card to check.</p>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {KNOWN.map((k) => {
                  const open = flipped.includes(k.ch);
                  return (
                    <button
                      key={k.ch}
                      type="button"
                      aria-pressed={open}
                      aria-label={open ? `${k.ch} says ${k.say}` : `Letter ${k.ch}. Tap to see the sound.`}
                      onClick={() => setFlipped(open ? flipped : [...flipped, k.ch])}
                      className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-3 text-5xl font-black transition ${
                        open ? "border-ok bg-ok-soft" : "border-ink bg-white hover:bg-sun-soft"
                      }`}
                    >
                      <span className="cyr">{k.ch}</span>
                      {open && (
                        <span className="pop mt-1 text-base font-extrabold">
                          {k.emoji} “{k.say}” ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 text-lg font-bold" aria-live="polite">
                {flipped.length < KNOWN.length
                  ? `${flipped.length} of 5 checked`
                  : "🎉 See? You already know 5 of the 35 letters!"}
              </p>
              <div className="mt-4 flex justify-end">
                <button type="button" className="btn btn-primary" onClick={next} disabled={flipped.length < KNOWN.length}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-2xl font-black">Now learn 2 new letters with a picture trick</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { ch: "С", say: "s", emoji: "🐍", trick: "Looks like C, but it is a curvy snake: “sss”." },
                  { ch: "И", say: "ee", emoji: "👀", trick: "A backwards N. Say: “I see!” — “ee”." },
                ].map((l) => (
                  <div key={l.ch} className="rounded-2xl border-3 border-line bg-cream p-5 text-center">
                    <div className="cyr text-7xl font-black">{l.ch}</div>
                    <div className="mt-1 text-2xl font-extrabold">says “{l.say}”</div>
                    <div className="mt-2 text-5xl" aria-hidden>
                      {l.emoji}
                    </div>
                    <p className="mt-2 text-lg">{l.trick}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" className="btn btn-primary" onClick={next}>
                  I&apos;m ready — quiz me →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="font-bold text-ink-soft">
                Question {qi + 1} of {QUESTIONS.length}
              </p>
              <h3 className="text-2xl font-black">{q.q}</h3>
              {q.big && (
                <div
                  className={`cyr mx-auto my-5 w-fit px-8 py-3 text-center font-black ${
                    q.big.length > 1
                      ? "rounded-xl border-4 border-ink bg-sun text-5xl tracking-widest shadow-[0_6px_0_#14213d]"
                      : "text-8xl"
                  }`}
                >
                  {q.big}
                </div>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {q.options.map((o) => (
                  <OptionButton
                    key={o}
                    label={o}
                    big={o.length === 1}
                    state={picked == null ? "idle" : o !== picked ? "dim" : o === q.answer ? "right" : "wrong"}
                    onClick={() => picked == null && setPicked(o)}
                  />
                ))}
              </div>
              {picked != null && (
                <Feedback
                  ok={picked === q.answer}
                  text={picked === q.answer ? `Yes! ${q.why}` : "That’s incorrect."}
                  onNext={next}
                  nextLabel={qi < QUESTIONS.length - 1 ? "Next question →" : "See my result →"}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <Confetti />
              <div className="pop text-7xl" aria-hidden>
                🚕
              </div>
              <h3 className="mt-2 text-3xl font-black">You just read your first Mongolian word!</h3>
              <p className="mx-auto mt-2 max-w-lg text-xl">
                You know <strong>7 of 35 letters</strong> already. That is 20% of the alphabet in 2 minutes.
              </p>
              <div className="mx-auto mt-5 h-6 max-w-md overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-ok" style={{ width: "20%" }} />
              </div>
              <p className="mt-5 text-lg text-ink-soft">Make a free account to keep going — you start with 5 bonus stars ⭐</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/login?mode=signup" className="btn btn-sun text-xl">
                  Create free account
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setStep(0);
                    setFlipped([]);
                    setQi(0);
                    setCorrectAnswers(0);
                    setPicked(null);
                  }}
                >
                  ↺ Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
