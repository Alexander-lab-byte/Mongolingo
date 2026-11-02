"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { DEMO_KEY } from "@/lib/progress";
import { Confetti, Feedback, OptionButton } from "./QuizBits";

const KNOWN = [
  { ch: "А", say: "a", word: "аав", en: "father" },
  { ch: "К", say: "k", word: "кофе", en: "coffee" },
  { ch: "М", say: "m", word: "мод", en: "tree" },
  { ch: "О", say: "o", word: "ой", en: "forest" },
  { ch: "Т", say: "t", word: "тал", en: "steppe" },
];

const NEW = [
  { ch: "С", say: "s", pic: "🐍", trick: "Looks like an English C, but it's a curvy snake that says “sss”." },
  { ch: "И", say: "ee", pic: "👀", trick: "A backwards N. Remember it as “I see” and say “ee”." },
];

const QUESTIONS = [
  { q: "Which letter says “s”?", big: null, options: ["Р", "С", "Н", "К"], answer: "С", why: "С is the curvy snake: sss." },
  {
    q: "What sound does this letter make?",
    big: "И",
    options: ["“ee” as in see", "“n” as in no", "“i” as in ice", "“u” as in up"],
    answer: "“ee” as in see",
    why: "И is a backwards N. I see: “ee”.",
  },
  {
    q: "You see this sign on the street. What does it say?",
    big: "ТАКСИ",
    options: ["Bank", "Taxi", "Cafe", "Shop"],
    answer: "Taxi",
    why: "Т-А-К-С-И = t-a-k-s-i. Taxi!",
  },
];

const STAGES = ["Letters you know", "Two new letters", "Quiz"];

export function TryDemo() {
  const [step, setStep] = useState(0); // 0 known, 1 new, 2 quiz, 3 done
  const [flipped, setFlipped] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const progress = step === 3 ? 1 : (step + (step === 2 ? qi / QUESTIONS.length : 0)) / 3;
  const q = QUESTIONS[qi];

  function next() {
    if (step === 2) {
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

  function restart() {
    setStep(0);
    setFlipped([]);
    setQi(0);
    setPicked(null);
  }

  return (
    <section id="try" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-[#c9efff] via-sky-soft to-paper px-4 pb-24 pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold sm:text-5xl">Read your first Mongolian word in two minutes.</h2>
          <p className="mt-4 text-xl text-ink-soft">No account needed. Just tap.</p>
        </div>

        <div className="panel relative mt-10 overflow-hidden">
          {/* Stage bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line px-6 py-4 sm:px-8">
            <ol className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Mini lesson steps">
              {STAGES.map((s, i) => (
                <li
                  key={s}
                  className={`flex items-center gap-2 font-semibold ${i < step || step === 3 ? "text-ok" : i === step ? "text-ink" : "text-ink-soft"}`}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-sm ${
                      i < step || step === 3 ? "bg-ok text-white" : i === step ? "bg-cobalt text-white" : "bg-line text-ink-soft"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div
              className="ml-auto h-2.5 w-full overflow-hidden rounded-full bg-line sm:w-40"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label="Mini lesson progress"
            >
              <div className="h-full rounded-full bg-cobalt transition-all duration-500" style={{ width: `${Math.max(progress * 100, 4)}%` }} />
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {step === 0 && (
              <div>
                <h3 className="text-2xl font-bold sm:text-3xl">You already know these five.</h3>
                <p className="mt-2 text-lg text-ink-soft">They look and sound like English. Tap each one to check.</p>
                <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {KNOWN.map((k) => {
                    const open = flipped.includes(k.ch);
                    return (
                      <button
                        key={k.ch}
                        type="button"
                        aria-pressed={open}
                        aria-label={open ? `${k.ch} says ${k.say}` : `Letter ${k.ch}. Tap to see the sound.`}
                        onClick={() => setFlipped(open ? flipped : [...flipped, k.ch])}
                        className={`group relative flex aspect-[4/5] flex-col items-center justify-center rounded-3xl border-2 transition ${
                          open ? "border-ok bg-ok-soft" : "border-line bg-paper hover:-translate-y-1 hover:border-cobalt"
                        }`}
                      >
                        <span className="font-display text-6xl font-bold">{k.ch}</span>
                        <span className={`mt-2 text-base font-semibold ${open ? "text-ok" : "text-ink-soft"}`}>
                          {open ? `says “${k.say}”` : "Tap"}
                        </span>
                        {open && (
                          <span className="pop mt-1 text-sm text-ink-soft">
                            {k.word} = {k.en}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-lg font-semibold" aria-live="polite">
                    {flipped.length < KNOWN.length ? `${flipped.length} of 5 checked` : "That's 5 of 35 letters. You've already started."}
                  </p>
                  <button type="button" className="btn btn-primary" onClick={next} disabled={flipped.length < KNOWN.length}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-bold sm:text-3xl">Two new letters, each with a picture trick.</h3>
                <p className="mt-2 text-lg text-ink-soft">A picture and a short story make a new letter much easier to remember.</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {NEW.map((l) => (
                    <div key={l.ch} className="flex items-center gap-5 rounded-3xl bg-paper p-6">
                      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-night font-display text-6xl font-bold text-white">
                        {l.ch}
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold">
                          says “{l.say}” <span aria-hidden>{l.pic}</span>
                        </p>
                        <p className="mt-1 text-lg text-ink-soft">{l.trick}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex justify-end">
                  <button type="button" className="btn btn-primary" onClick={next}>
                    I&apos;m ready, quiz me
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="font-semibold text-ink-soft">
                  Question {qi + 1} of {QUESTIONS.length}
                </p>
                <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{q.q}</h3>
                {q.big && (
                  <div className="my-7 flex justify-center">
                    {q.big.length > 1 ? (
                      <TaxiSign />
                    ) : (
                      <span className="font-display text-[7rem] font-bold leading-none">{q.big}</span>
                    )}
                  </div>
                )}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <OptionButton
                      key={o}
                      label={o}
                      big={o.length === 1}
                      state={picked == null ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim"}
                      onClick={() => picked == null && setPicked(o)}
                    />
                  ))}
                </div>
                {picked != null && (
                  <Feedback
                    ok={picked === q.answer}
                    text={picked === q.answer ? `Yes! ${q.why}` : `Good try. The answer is ${q.answer}. ${q.why}`}
                    onNext={next}
                    nextLabel={qi < QUESTIONS.length - 1 ? "Next question" : "See my result"}
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className="relative py-4 text-center">
                <Confetti />
                <div className="flex justify-center">
                  <TaxiSign />
                </div>
                <h3 className="mx-auto mt-8 max-w-xl text-3xl font-bold sm:text-4xl">You just read your first Mongolian word.</h3>
                <p className="mx-auto mt-3 max-w-lg text-xl text-ink-soft">
                  You now know <strong className="text-ink">7 of the 35 letters</strong>. That&apos;s 20% of the alphabet.
                </p>
                <div className="mx-auto mt-6 h-3 max-w-md overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-ok" style={{ width: "20%" }} />
                </div>
                <p className="mt-6 text-lg">Create a free account to keep going. You start with 5 bonus stars.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/login?mode=signup" className="btn btn-primary text-lg">
                    Create free account
                  </Link>
                  <button type="button" className="btn btn-line text-ink" onClick={restart}>
                    <RotateCcw size={18} aria-hidden /> Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TaxiSign() {
  return (
    <div className="inline-flex flex-col items-center" role="img" aria-label="A yellow taxi roof sign that says ТАКСИ">
      <div className="rounded-t-2xl bg-gold px-8 pb-2 pt-3 shadow-[0_18px_40px_-18px_rgba(255,197,49,0.9)]">
        <span className="font-display text-5xl font-extrabold tracking-wide text-night sm:text-6xl" aria-hidden>
          ТАКСИ
        </span>
      </div>
      <div
        className="h-4 w-full rounded-b-md"
        style={{ background: "repeating-linear-gradient(90deg,#0a0f2c 0 16px,#fff 16px 32px)" }}
        aria-hidden
      />
    </div>
  );
}
