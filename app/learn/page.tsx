"use client";

import Link from "next/link";
import { CalendarClock, Check, Flame, Lock, Play, Star } from "lucide-react";
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
  const nextIndex = nextLesson ? LESSONS.indexOf(nextLesson) : -1;
  const reviews = dueReviews(progress);
  const letters = lettersLearned(progress.completed);
  const pct = Math.round((letters / TOTAL_LETTERS) * 100);

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-night">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <TextSizeControl />
            <button type="button" className="btn btn-line px-4 text-white" onClick={signOut}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <section className="bg-night px-4 pb-24 pt-8 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold sm:text-5xl">Сайн уу, {progress.displayName}!</h1>
          <p className="mt-2 text-lg text-white/80">“Сайн уу” means hello. Here&apos;s where you are.</p>

          <dl className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
            <Stat icon={<span className="font-display text-lg font-bold">Аа</span>} label="Letters" value={`${letters}/${TOTAL_LETTERS}`} />
            <Stat icon={<Flame size={22} aria-hidden />} label={progress.streak === 1 ? "Day streak" : "Days streak"} value={String(progress.streak)} />
            <Stat icon={<Star size={22} aria-hidden />} label="Stars" value={String(progress.xp)} />
          </dl>

          <div className="mt-6 sm:max-w-xl">
            <div className="flex justify-between text-white/85">
              <span>Alphabet</span>
              <span className="font-semibold text-white">{pct}%</span>
            </div>
            <div
              className="mt-2 h-3 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Alphabet progress"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-sky to-gold" style={{ width: `${Math.max(pct, 3)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-16 max-w-5xl px-4 pb-20 sm:px-6">
        {nextLesson ? (
          <Link
            href={`/learn/${nextLesson.id}`}
            className="group flex flex-col gap-6 rounded-[28px] bg-cobalt p-7 text-white shadow-[0_30px_60px_-25px_rgba(30,91,255,0.8)] transition hover:bg-cobalt-dark sm:flex-row sm:items-center sm:p-9"
          >
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/15 font-display text-4xl font-bold">
              {nextLesson.items[0].show.slice(0, 1)}
            </span>
            <span className="flex-1">
              <span className="block text-white">
                Next up: lesson {nextIndex + 1} of {LESSONS.length}, about 3 minutes
              </span>
              <span className="mt-1 block font-display text-2xl font-bold sm:text-3xl">{nextLesson.title}</span>
              <span className="mt-1 block text-lg text-white/90">{nextLesson.subtitle}</span>
            </span>
            <span className="btn btn-gold self-start sm:self-center">
              <Play size={18} fill="currentColor" aria-hidden /> Start lesson
            </span>
          </Link>
        ) : (
          <div className="panel p-8 text-center">
            <h2 className="text-3xl font-bold">You finished every lesson.</h2>
            <p className="mt-2 text-lg text-ink-soft">Keep doing your reviews so you don&apos;t forget.</p>
          </div>
        )}

        {reviews.length > 0 && (
          <section className="mt-6 rounded-[28px] bg-gold-soft p-6 sm:p-8" aria-labelledby="reviews">
            <div className="flex items-start gap-4">
              <CalendarClock className="mt-1 shrink-0" size={28} aria-hidden />
              <div>
                <h2 id="reviews" className="text-2xl font-bold">
                  Review today
                </h2>
                <p className="mt-1 text-lg text-ink-soft">A two-minute review now helps you remember it for weeks.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {reviews.map((id) => {
                    const l = LESSONS.find((x) => x.id === id)!;
                    return (
                      <Link key={id} href={`/learn/${id}`} className="btn btn-primary">
                        {l.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        <h2 className="mt-14 text-3xl font-bold">Your path</h2>
        <ol className="relative mt-8">
          <span className="absolute bottom-6 left-7 top-6 w-[3px] rounded-full bg-line" aria-hidden />
          {LESSONS.map((l, i) => {
            const done = progress.completed.includes(l.id);
            const isNext = nextLesson?.id === l.id;
            const locked = !done && !isNext;
            const inner = (
              <>
                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold ${
                    done ? "bg-ok text-white" : isNext ? "bg-cobalt text-white ring-8 ring-cobalt/15" : "bg-white text-ink-soft ring-1 ring-line"
                  }`}
                  aria-hidden
                >
                  {done ? <Check size={26} strokeWidth={3} /> : locked ? <Lock size={20} /> : i + 1}
                </span>
                <span className="flex-1">
                  <span className={`block text-xl font-bold ${locked ? "text-ink-soft" : ""}`}>
                    {i + 1}. {l.title}
                  </span>
                  <span className="block text-ink-soft">
                    {done ? "Done. Tap to practise again." : locked ? `Opens after lesson ${i}` : l.subtitle}
                  </span>
                </span>
              </>
            );
            return (
              <li key={l.id} className="relative mb-3">
                {locked ? (
                  <div className="flex items-center gap-5 rounded-2xl p-3">{inner}</div>
                ) : (
                  <Link href={`/learn/${l.id}`} className="flex items-center gap-5 rounded-2xl p-3 transition hover:bg-white">
                    {inner}
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <dt className="flex items-center gap-2 text-white/85">
        <span className="text-gold">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
    </div>
  );
}
