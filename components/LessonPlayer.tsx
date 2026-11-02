"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, Star, X } from "lucide-react";
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
  // Numbers are only mixed with numbers, so wrong answers are believable.
  const isNum = (id: string) => id.startsWith("numbers") || id === "money";
  const pool = LESSONS.slice(0, idx + 1)
    .filter((l) => l.kind === lesson.kind && isNum(l.id) === isNum(lesson.id))
    .flatMap((l) => l.items);
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
    phase === "learn" ? card : phase === "quiz" ? lesson.items.length + Math.min(qi, questionCount) : totalSteps;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  function startQuiz() {
    const qs = buildQuestions(lesson);
    setBaseQuestions(qs);
    setQueue(qs);
    setQi(0);
    setPicked(null);
    setPhase("quiz");
  }

  async function answer(o: string) {
    if (picked) return;
    setPicked(o);
    const q = queue[qi];
    if (o !== q.answer) {
      setMissed((m) => new Set(m).add(q.key));
      // Ask it again at the end: practice what you got wrong.
      setQueue((qq) => [...qq, { ...q, key: q.key + "-again", options: shuffle(q.options, qq.length) }]);
    }
  }

  async function nextQuestion() {
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
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link
            href="/learn"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink ring-1 ring-line hover:bg-paper"
            aria-label="Close lesson and go back"
          >
            <X size={22} aria-hidden />
          </Link>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lesson progress"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-cobalt to-sky transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%` }} />
          </div>
          <div className="hidden sm:block">
            <TextSizeControl />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <p className="font-semibold text-cobalt">
          {lesson.title}
          {isReview && phase !== "done" ? ", review" : ""}
        </p>

        {startPhase === "review-intro" && (
          <div className="panel mt-4 p-8 sm:p-10">
            <CalendarClock size={36} className="text-cobalt" aria-hidden />
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Quick review</h1>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">
              Let&apos;s see what you remember. Trying to remember makes memory stronger, even when you get some wrong.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={startQuiz}>
                Start the quiz
              </button>
              <button type="button" className="btn btn-line text-ink" onClick={() => setShowReviewIntro(false)}>
                Look at the cards first
              </button>
            </div>
          </div>
        )}

        {startPhase === "learn" && item && (
          <div className="panel mt-4 overflow-hidden" key={item.id}>
            <div className="grid md:grid-cols-[1.05fr_1fr]">
              <div className="bg-blend flex flex-col items-center justify-center px-6 py-10">
                <p className="text-white">
                  Card {card + 1} of {lesson.items.length}
                </p>
                {lesson.kind === "letters" ? (
                  <div className="pop mt-3 flex items-end gap-5">
                    <span className="font-display text-[8.5rem] font-bold leading-none">{item.show}</span>
                    <span className="font-display text-7xl font-bold leading-none text-gold">{item.small}</span>
                  </div>
                ) : (
                  <div className="pop mt-5 rounded-xl bg-gold px-6 py-3 text-center font-display text-3xl font-extrabold text-night sm:text-4xl">
                    {item.show}
                  </div>
                )}
              </div>
              <div className="p-7 sm:p-9">
                {lesson.kind === "letters" ? (
                  <>
                    <h1 className="text-3xl font-bold sm:text-4xl">says “{item.say}”</h1>
                    <p className="mt-2 text-xl text-ink-soft">{item.hint}</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold sm:text-4xl">{item.meaning}</h1>
                    <p className="mt-2 text-xl text-ink-soft">Say it: “{item.say}”</p>
                  </>
                )}
                <div className="bg-blend-soft mt-6 flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-3xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <p className="text-lg font-medium">{item.trick}</p>
                </div>
                {item.word && (
                  <p className="mt-5 text-lg">
                    <span className="text-ink-soft">Example: </span>
                    <strong className="font-display">{item.word.mn}</strong> ({item.word.latin}) = {item.word.en}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-4 sm:px-9">
              <Speak text={item.word?.mn ?? item.show} />
              {card >= 1 && (
                <button type="button" className="btn btn-line text-ink" onClick={() => setCard(card - 1)}>
                  <ArrowLeft size={18} aria-hidden /> Back
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (card + 1 < lesson.items.length ? setCard(card + 1) : startQuiz())}
              >
                {card + 1 < lesson.items.length ? "Next card" : "I'm ready, quiz me"}
              </button>
            </div>
          </div>
        )}

        {phase === "quiz" && q && (
          <div className="mt-4">
            <p className="font-semibold text-ink-soft">
              {qi < baseQuestions.length ? `Question ${qi + 1} of ${baseQuestions.length}` : "One more try. You missed this one before."}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{q.prompt}</h1>
            {q.big && (
              <div className="my-8 flex justify-center">
                {lesson.kind === "letters" ? (
                  <span className="grid h-44 w-44 place-items-center rounded-[32px] bg-blend font-display text-[7rem] font-bold leading-none text-white">
                    {q.big}
                  </span>
                ) : (
                  <span className="rounded-xl bg-gold px-6 py-3 font-display text-3xl font-extrabold text-night sm:text-5xl">{q.big}</span>
                )}
              </div>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2" key={q.key}>
              {q.options.map((o) => (
                <OptionButton
                  key={o}
                  label={o}
                  big={q.bigOptions}
                  state={picked == null ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim"}
                  onClick={() => answer(o)}
                />
              ))}
            </div>
            {picked != null && (
              <Feedback ok={picked === q.answer} text={picked === q.answer ? `Correct! ${q.explain}` : `Good try. ${q.explain}`} onNext={nextQuestion} />
            )}
          </div>
        )}

        {phase === "done" && result && (
          <div className="bg-blend relative mt-4 overflow-hidden rounded-[28px] px-6 py-12 text-center sm:px-10">
            <Confetti />
            <div className="flex justify-center gap-2" role="img" aria-label={`${result.stars} of 3 stars`}>
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  size={56}
                  className={`pop ${i < result.stars ? "text-gold" : "text-white/20"}`}
                  fill="currentColor"
                  style={{ animationDelay: `${i * 0.12}s` }}
                  aria-hidden
                />
              ))}
            </div>
            <h1 className="mt-6 text-3xl font-bold sm:text-5xl">{result.wasReview ? "Review done!" : "Lesson complete!"}</h1>
            <p className="mt-4 text-xl text-white/90">
              {result.firstTry} of {baseQuestions.length} right on the first try. You earned {10 + result.firstTry} stars.
            </p>
            <p className="mt-1 text-xl text-white/90">
              Streak: {progress.streak} {progress.streak === 1 ? "day" : "days"}
            </p>
            <p className="mx-auto mt-8 flex max-w-lg items-start gap-3 rounded-2xl bg-white/10 p-5 text-left text-lg">
              <CalendarClock className="mt-0.5 shrink-0 text-gold" size={24} aria-hidden />
              We&apos;ll bring this lesson back for a short review soon. Reviews on different days help you remember for months.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/learn" className="btn btn-gold text-lg">
                Continue
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
