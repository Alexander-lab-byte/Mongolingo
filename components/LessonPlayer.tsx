"use client";

import Link from "next/link";
import { useState } from "react";
import { getLesson, LESSONS, type Item, type Lesson } from "@/lib/lessons";
import { finishLesson } from "@/lib/progress";
import { Confetti, Feedback, OptionButton } from "./QuizBits";
import { Loading } from "./Loading";
import { Speak } from "./Speak";
import { TextSizeControl } from "./Nav";
import { useLearner } from "./useLearner";

type Question = {
  key: string;
  itemId: string;
  prompt: string;
  big?: string;
  options: string[];
  answer: string;
  bigOptions: boolean;
  explain: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shuffle<T>(arr: T[], _seed?: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrong(pool: string[], answer: string, seed: number) {
  return shuffle(
    pool.filter((x) => x !== answer),
    seed,
  ).slice(0, 3);
}

/** Retrieval practice: two kinds of questions per item, in both directions. */
function buildQuestions(lesson: Lesson): Question[] {
  // Wrong answers come from this lesson AND earlier ones, so the quiz is not too easy.
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const pool = LESSONS.slice(0, idx + 1).filter((l) => l.kind === lesson.kind).flatMap((l) => l.items);
  const qs: Question[] = [];
  lesson.items.forEach((it, i) => {
    if (lesson.kind === "letters") {
      const sounds = pool.map((p) => `“${p.say}”`);
      const letters = pool.map((p) => p.show);
      const a1 = `“${it.say}”`;
      qs.push({
        key: it.id + "-sound",
        itemId: it.id,
        prompt: "What sound does this letter make?",
        big: it.show,
        options: shuffle([a1, ...pickWrong(sounds, a1, i + 3)], i + 7),
        answer: a1,
        bigOptions: false,
        explain: `${it.show} says “${it.say}” — ${it.hint}. ${it.emoji} ${it.trick}`,
      });
      qs.push({
        key: it.id + "-letter",
        itemId: it.id,
        prompt: `Find the letter that says “${it.say}”`,
        options: shuffle([it.show, ...pickWrong(letters, it.show, i + 11)], i + 13),
        answer: it.show,
        bigOptions: true,
        explain: `${it.show} says “${it.say}”. ${it.emoji} ${it.trick}`,
      });
    } else {
      const meanings = pool.map((p) => p.meaning!);
      const words = pool.map((p) => p.show);
      qs.push({
        key: it.id + "-meaning",
        itemId: it.id,
        prompt: "What does this mean?",
        big: it.show,
        options: shuffle([it.meaning!, ...pickWrong(meanings, it.meaning!, i + 5)], i + 17),
        answer: it.meaning!,
        bigOptions: false,
        explain: `${it.show} (${it.say}) = ${it.meaning}. ${it.emoji}`,
      });
      qs.push({
        key: it.id + "-word",
        itemId: it.id,
        prompt: `How do you write “${it.meaning}”?`,
        options: shuffle([it.show, ...pickWrong(words, it.show, i + 19)], i + 23),
        answer: it.show,
        bigOptions: false,
        explain: `“${it.meaning}” is ${it.show} (${it.say}).`,
      });
    }
  });
  // Mix the order so the two questions about one item are not next to each other (interleaving).
  const first = shuffle(qs.filter((_, i) => i % 2 === 0));
  let second = shuffle(qs.filter((_, i) => i % 2 === 1));
  if (second.length > 1 && second[0].itemId === first[first.length - 1].itemId) second = [...second.slice(1), second[0]];
  return [...first, ...second];
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!;
  const { progress, ready, update } = useLearner();
  const isReview = !!progress?.completed.includes(lesson.id);

  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [card, setCard] = useState(0);
  // Questions are shuffled when the quiz starts (in the browser), so every try is different.
  const [baseQuestions, setBaseQuestions] = useState<Question[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [qi, setQi] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ stars: number; firstTry: number; wasReview: boolean } | null>(null);
  const [showReviewIntro, setShowReviewIntro] = useState(true);

  if (!ready || !progress) return <Loading />;

  // Review = skip the teaching cards and go straight to questions (testing effect).
  const startPhase = isReview && phase === "learn" && showReviewIntro ? "review-intro" : phase;

  const questionCount = lesson.items.length * 2;
  const totalSteps = lesson.items.length + questionCount;
  const doneSteps =
    phase === "learn" ? card : phase === "quiz" ? lesson.items.length + correctAnswers : totalSteps;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  function startQuiz() {
    const qs = buildQuestions(lesson);
    setBaseQuestions(qs);
    setQueue(qs);
    setQi(0);
    setCorrectAnswers(0);
    setPicked(null);
    setPhase("quiz");
  }

  async function answer(o: string) {
    if (picked != null) return;
    setPicked(o);
    const q = queue[qi];
    if (o !== q.answer) {
      // Only first tries count toward the score, not misses on the repeat questions.
      if (qi < baseQuestions.length) setMissed((m) => new Set(m).add(q.key));
      // Ask it again at the end: practice what you got wrong.
      setQueue((qq) => [...qq, { ...q, key: q.key + "-again", options: shuffle(q.options, qq.length) }]);
    }
  }

  async function nextQuestion() {
    if (picked == null) return;
    // Moving to another question only fills the bar after a correct answer.
    if (picked === queue[qi].answer) setCorrectAnswers((count) => count + 1);
    if (qi + 1 < queue.length) {
      setQi(qi + 1);
      setPicked(null);
      return;
    }
    const firstTry = baseQuestions.length - missed.size;
    const stars = firstTry === baseQuestions.length ? 3 : firstTry >= baseQuestions.length * 0.7 ? 2 : 1;
    setResult({ stars, firstTry, wasReview: isReview });
    setPhase("done");
    await update(finishLesson(progress!, lesson.id, firstTry, baseQuestions.length));
  }

  const item: Item | undefined = lesson.items[card];
  const q = queue[qi];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-3 border-line bg-cream">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/learn" className="btn btn-ghost px-4" aria-label="Close lesson and go back">
            ✕
          </Link>
          <div
            className="h-5 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lesson progress"
          >
            <div className="h-full rounded-full bg-ok transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%` }} />
          </div>
          <div className="hidden sm:block">
            <TextSizeControl />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="font-extrabold uppercase tracking-wide text-mn-red">
          {lesson.emoji} {lesson.title} {isReview && phase !== "done" && "· Review"}
        </p>

        {startPhase === "review-intro" && (
          <div className="card mt-4 p-6 text-center">
            <div className="text-6xl" aria-hidden>
              📅
            </div>
            <h1 className="mt-2 text-3xl font-black">Quick review</h1>
            <p className="mt-2 text-lg">
              Let&apos;s see what you remember. Trying to remember makes your memory stronger — even if you get some wrong.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-primary" onClick={startQuiz}>
                Start the quiz →
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowReviewIntro(false)}>
                Look at the cards first
              </button>
            </div>
          </div>
        )}

        {startPhase === "learn" && item && (
          <div className="card mt-4 p-6 text-center sm:p-8" key={item.id}>
            <p className="font-bold text-ink-soft">
              Card {card + 1} of {lesson.items.length}
            </p>
            {lesson.kind === "letters" ? (
              <>
                <div className="pop mt-2 flex items-end justify-center gap-4">
                  <span className="cyr text-9xl font-black leading-none">{item.show}</span>
                  <span className="cyr text-6xl font-black leading-none text-ink-soft">{item.small}</span>
                </div>
                <h1 className="mt-4 text-3xl font-black">says “{item.say}”</h1>
                <p className="text-xl text-ink-soft">{item.hint}</p>
              </>
            ) : (
              <>
                <div className="pop cyr mx-auto mt-3 w-fit rounded-xl border-4 border-ink bg-sun px-6 py-3 text-4xl font-black shadow-[0_6px_0_#14213d] sm:text-5xl">
                  {item.show}
                </div>
                <h1 className="mt-5 text-3xl font-black">{item.meaning}</h1>
                <p className="text-xl text-ink-soft">Say: “{item.say}”</p>
              </>
            )}
            <div className="mx-auto mt-5 flex max-w-md items-center gap-4 rounded-2xl bg-sun-soft p-4 text-left">
              <span className="text-5xl" aria-hidden>
                {item.emoji}
              </span>
              <p className="text-lg font-bold">{item.trick}</p>
            </div>
            {item.word && (
              <p className="mt-4 text-xl">
                Example: <strong className="cyr">{item.word.mn}</strong> ({item.word.latin}) = {item.word.en}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Speak text={item.word?.mn ?? item.show} />
              {card >= 1 && (
                <button type="button" className="btn btn-ghost" onClick={() => setCard(card - 1)}>
                  ← Back
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (card + 1 < lesson.items.length ? setCard(card + 1) : startQuiz())}
              >
                {card + 1 < lesson.items.length ? "Next card →" : "I'm ready — quiz me →"}
              </button>
            </div>
          </div>
        )}

        {phase === "quiz" && q && (
          <div className="mt-4">
            <p className="font-bold text-ink-soft">
              {qi < baseQuestions.length ? `Question ${qi + 1} of ${baseQuestions.length}` : "🔁 One more try — you missed this one before"}
            </p>
            <h1 className="text-2xl font-black sm:text-3xl">{q.prompt}</h1>
            {q.big && (
              <div
                className={`cyr mx-auto my-5 w-fit text-center font-black ${
                  lesson.kind === "letters"
                    ? "text-9xl"
                    : "rounded-xl border-4 border-ink bg-sun px-6 py-3 text-4xl shadow-[0_6px_0_#14213d] sm:text-5xl"
                }`}
              >
                {q.big}
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2" key={q.key}>
              {q.options.map((o) => (
                <OptionButton
                  key={o}
                  label={o}
                  big={q.bigOptions}
                  state={picked == null ? "idle" : o !== picked ? "dim" : o === q.answer ? "right" : "wrong"}
                  onClick={() => answer(o)}
                />
              ))}
            </div>
            {picked != null && (
              <Feedback
                ok={picked === q.answer}
                text={picked === q.answer ? `Correct! ${q.explain}` : "That’s incorrect."}
                onNext={nextQuestion}
              />
            )}
          </div>
        )}

        {phase === "done" && result && (
          <div className="card relative mt-4 overflow-hidden p-8 text-center">
            <Confetti />
            <div className="pop text-6xl tracking-widest" aria-label={`${result.stars} of 3 stars`}>
              {"⭐".repeat(result.stars)}
              <span className="opacity-25">{"⭐".repeat(3 - result.stars)}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black">{result.wasReview ? "Review done!" : "Lesson complete!"}</h1>
            <p className="mt-2 text-xl">
              You got <strong>{result.firstTry}</strong> of {baseQuestions.length} right on the first try.
            </p>
            <p className="mt-1 text-xl">
              +{10 + result.firstTry} stars ⭐ · 🔥 {progress.streak} day streak
            </p>
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-sky p-4 text-lg">
              📅 We will ask you to review this lesson again soon. Short reviews on different days help you remember for
              months.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/learn" className="btn btn-primary text-xl">
                Continue →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
