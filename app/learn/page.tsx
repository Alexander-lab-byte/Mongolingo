"use client";

import Link from "next/link";
import { Logo, TextSizeControl } from "@/components/Nav";
import { useAuth } from "@/components/Providers";
import { useLearner } from "@/components/useLearner";
import { LESSONS, TOTAL_LETTERS, lettersLearned } from "@/lib/lessons";
import { dueReviews } from "@/lib/progress";
import { Loading } from "@/components/Loading";

export default function LearnHome() {
  const { progress, ready } = useLearner();
  const { signOut } = useAuth();

  if (!ready || !progress) return <Loading />;

  const nextLesson = LESSONS.find((l) => !progress.completed.includes(l.id));
  const reviews = dueReviews(progress);
  const letters = lettersLearned(progress.completed);
  const pct = Math.round((letters / TOTAL_LETTERS) * 100);

  return (
    <div className="min-h-screen">
      <header className="border-b-3 border-line bg-cream">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <TextSizeControl />
            <button type="button" className="btn btn-ghost" onClick={signOut}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-black sm:text-4xl">
          <span className="cyr">Сайн уу</span>, {progress.displayName}! 👋
        </h1>
        <p className="mt-1 text-lg text-ink-soft">“Сайн уу” means “Hello”.</p>

        <ul className="mt-6 grid grid-cols-3 gap-3">
          <Stat emoji="🔤" value={`${letters}/${TOTAL_LETTERS}`} label="letters" />
          <Stat emoji="🔥" value={String(progress.streak)} label={progress.streak === 1 ? "day streak" : "days streak"} />
          <Stat emoji="⭐" value={String(progress.xp)} label="stars" />
        </ul>

        <div className="mt-4">
          <div className="flex justify-between font-bold">
            <span>Alphabet</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Alphabet progress">
            <div className="h-full rounded-full bg-ok" style={{ width: `${Math.max(pct, 3)}%` }} />
          </div>
        </div>

        {reviews.length > 0 && (
          <section className="card mt-8 border-sun bg-sun-soft p-5">
            <h2 className="text-2xl font-black">📅 Time to review ({reviews.length})</h2>
            <p className="text-lg">A quick review today helps you remember for a long time.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {reviews.map((id) => {
                const l = LESSONS.find((x) => x.id === id)!;
                return (
                  <Link key={id} href={`/learn/${id}`} className="btn btn-sun">
                    {l.emoji} {l.title}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {nextLesson ? (
          <Link
            href={`/learn/${nextLesson.id}`}
            className="mt-8 flex items-center gap-4 rounded-3xl bg-brand p-6 text-white shadow-[0_6px_0_#084a8a] transition hover:-translate-y-0.5"
          >
            <span className="text-6xl" aria-hidden>
              {nextLesson.emoji}
            </span>
            <span>
              <span className="block font-extrabold uppercase tracking-wide text-sun-soft">Next lesson · about 3 min</span>
              <span className="block text-2xl font-black sm:text-3xl">{nextLesson.title}</span>
              <span className="block text-lg">{nextLesson.subtitle}</span>
            </span>
            <span className="ml-auto text-4xl" aria-hidden>
              ▶
            </span>
          </Link>
        ) : (
          <div className="card mt-8 p-6 text-center">
            <div className="text-6xl">🏆</div>
            <h2 className="text-2xl font-black">You finished every lesson!</h2>
            <p className="text-lg">Keep your reviews going so you never forget.</p>
          </div>
        )}

        <h2 className="mt-10 text-2xl font-black">Your path</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {LESSONS.map((l, i) => {
            const done = progress.completed.includes(l.id);
            const isNext = nextLesson?.id === l.id;
            const locked = !done && !isNext;
            return (
              <li key={l.id}>
                {locked ? (
                  <div className="flex items-center gap-4 rounded-2xl border-3 border-dashed border-line bg-white/60 p-4 text-ink-soft">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-line text-2xl" aria-hidden>
                      🔒
                    </span>
                    <span>
                      <span className="block font-black">
                        {i + 1}. {l.title}
                      </span>
                      <span className="block">Opens after lesson {i}</span>
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/learn/${l.id}`}
                    className={`flex items-center gap-4 rounded-2xl border-3 p-4 transition hover:-translate-y-0.5 ${
                      done ? "border-ok bg-ok-soft" : "border-brand bg-white"
                    }`}
                  >
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl ${done ? "bg-ok text-white" : "bg-sky"}`}
                      aria-hidden
                    >
                      {done ? "✓" : l.emoji}
                    </span>
                    <span>
                      <span className="block text-lg font-black">
                        {i + 1}. {l.title}
                      </span>
                      <span className="block text-ink-soft">{done ? "Done ✓ · tap to practise again" : l.subtitle}</span>
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <li className="card flex flex-col items-center p-3 text-center">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-2xl font-black">{value}</span>
      <span className="text-ink-soft">{label}</span>
    </li>
  );
}
