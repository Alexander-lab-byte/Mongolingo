"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CalendarClock, Check, Flame, Languages, Layers, Lock, MessageSquare, Play, Star } from "lucide-react";
import { Logo, TextSizeControl } from "@/components/Nav";
import { useAuth } from "@/components/Providers";
import { useLearner } from "@/components/useLearner";
import { useSaved } from "@/components/useSaved";
import { NameInCyrillic } from "@/components/NameInCyrillic";
import { LESSONS, TOTAL_LETTERS, lettersLearned } from "@/lib/lessons";
import { buildDeck, badges } from "@/lib/deck";
import { cardsToStudy, dueReviews, endGuest, todayCount } from "@/lib/progress";
import { Loading } from "@/components/Loading";

const GOALS = [10, 20, 30];

export default function LearnHome() {
  const { progress, ready, guest, update } = useLearner();
  const { saved } = useSaved();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!ready || !progress) return <Loading />;

  const nextLesson = LESSONS.find((l) => !progress.completed.includes(l.id));
  const nextIndex = nextLesson ? LESSONS.indexOf(nextLesson) : -1;
  const reviews = dueReviews(progress);
  const letters = lettersLearned(progress.completed);
  const deck = buildDeck(progress.completed, saved);
  const dueCards = cardsToStudy(progress, deck, 999).length;
  const done = todayCount(progress);
  const goal = progress.goal;
  const goalPct = Math.min(done / goal, 1);
  const myBadges = badges({ completed: progress.completed, letters, bestStreak: progress.bestStreak, reviewed: progress.reviewed, talks: progress.talks, saved: saved.length });
  const earned = myBadges.filter((b) => b.earned).length;

  // One clear next step (fewer choices = faster start).
  const today =
    dueCards > 0 && done < goal
      ? { href: "/learn/cards", label: `Review ${Math.min(dueCards, goal - done)} cards`, sub: "About 2 minutes. Keeps words in your memory.", icon: Layers }
      : nextLesson
        ? { href: `/learn/${nextLesson.id}`, label: nextLesson.title, sub: `Lesson ${nextIndex + 1} of ${LESSONS.length}, about 3 minutes`, icon: Play }
        : { href: "/learn/talk", label: "Practise a conversation", sub: "Taxi and shop role-play", icon: MessageSquare };
  const TodayIcon = today.icon;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <TextSizeControl />
            <button
              type="button"
              className="btn btn-line px-4 text-ink"
              onClick={() => {
                if (guest) {
                  endGuest();
                  router.push("/login");
                } else signOut();
              }}
            >
              {guest ? "Exit demo" : "Log out"}
            </button>
          </div>
        </div>
      </header>

      {guest && (
        <div className="bg-blend-soft px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">Demo mode. Your progress stays on this device only.</p>
            <Link href="/login?mode=signup" onClick={endGuest} className="btn btn-primary min-h-11 px-5 text-base">
              Create free account
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        {/* Greeting + daily goal */}
        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-3xl font-bold sm:text-5xl">Сайн уу, {progress.displayName}!</h1>
            <p className="mt-2 text-lg text-ink-soft">“Сайн уу” means hello.</p>
            <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3">
              <Stat icon={<span className="font-display text-base font-bold">Аа</span>} label="Letters" value={`${letters}/${TOTAL_LETTERS}`} />
              <Stat icon={<Flame size={20} aria-hidden />} label={progress.streak === 1 ? "Day streak" : "Days streak"} value={String(progress.streak)} />
              <Stat icon={<Star size={20} aria-hidden />} label="Stars" value={String(progress.xp)} />
            </dl>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-line">
            <Ring pct={goalPct} label={`${done}/${goal}`} />
            <div>
              <p className="text-lg font-bold">{done >= goal ? "Daily goal done!" : "Daily goal"}</p>
              <p className="text-ink-soft">cards per day</p>
              <div className="mt-2 flex gap-1" role="group" aria-label="Choose your daily goal">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={goal === g}
                    onClick={() => update({ ...progress, goal: g })}
                    className={`h-11 min-w-11 rounded-full px-3 font-semibold ${goal === g ? "bg-cobalt text-white" : "bg-paper text-ink ring-1 ring-line hover:bg-sky-soft"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The one next step */}
        <Link
          href={today.href}
          className="bg-blend mt-8 flex flex-col gap-5 rounded-[28px] p-7 transition hover:brightness-95 sm:flex-row sm:items-center sm:p-9"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15">
            <TodayIcon size={30} aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-white">Do this now</span>
            <span className="mt-1 block font-display text-2xl font-bold sm:text-3xl">{today.label}</span>
            <span className="mt-1 block text-lg text-white">{today.sub}</span>
          </span>
          <span className="btn btn-gold self-start sm:self-center">
            <Play size={18} fill="currentColor" aria-hidden /> Start
          </span>
        </Link>

        {reviews.length > 0 && (
          <div className="bg-blend-soft mt-4 flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <CalendarClock size={22} aria-hidden />
            <span className="font-semibold">Lesson review due:</span>
            {reviews.map((id) => {
              const l = LESSONS.find((x) => x.id === id)!;
              return (
                <Link key={id} href={`/learn/${id}`} className="font-semibold text-cobalt underline underline-offset-4">
                  {l.title}
                </Link>
              );
            })}
          </div>
        )}

        {/* Practice tools */}
        <h2 className="mt-12 text-2xl font-bold sm:text-3xl">Practice</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile href="/learn/cards" icon={<Layers size={26} aria-hidden />} title="Flashcards" sub={deck.length === 0 ? "Finish a lesson first" : dueCards ? `${dueCards} ready` : "All done for today"} />
          <Tile href="/learn/talk" icon={<MessageSquare size={26} aria-hidden />} title="Conversations" sub={`Taxi and shop, ${progress.talks.length}/2 done`} />
          <Tile href="/translate" icon={<Languages size={26} aria-hidden />} title="Translate" sub="English ⇄ Mongolian" />
          <Tile href="/translate#phrases" icon={<Star size={26} aria-hidden />} title="My phrases" sub={`${saved.length} saved, also in flashcards`} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <NameInCyrillic />

          <section className="rounded-3xl bg-white p-6 ring-1 ring-line" aria-labelledby="badges">
            <div className="flex items-baseline justify-between">
              <h2 id="badges" className="text-2xl font-bold">
                Badges
              </h2>
              <span className="text-ink-soft">
                {earned} of {myBadges.length}
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {myBadges.map((b) => (
                <li key={b.id} className={`flex flex-col items-center rounded-2xl p-3 text-center ${b.earned ? "bg-blend-soft ring-1 ring-coral" : "bg-paper"}`} title={b.desc}>
                  <Award size={30} className={b.earned ? "text-ink" : "text-ink-soft/50"} aria-hidden />
                  <span className={`mt-1 text-sm font-semibold ${b.earned ? "" : "text-ink-soft"}`}>{b.title}</span>
                  <span className="sr-only">{b.earned ? "earned" : `not yet: ${b.desc}`}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Lesson path */}
        <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Your path</h2>
        <ol className="relative mt-6">
          <span className="absolute bottom-6 left-7 top-6 w-[3px] rounded-full bg-line" aria-hidden />
          {LESSONS.map((l, i) => {
            const isDone = progress.completed.includes(l.id);
            const isNext = nextLesson?.id === l.id;
            const locked = !isDone && !isNext;
            const inner = (
              <>
                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold ${
                    isDone ? "bg-ok text-white" : isNext ? "bg-cobalt text-white ring-8 ring-cobalt/15" : "bg-white text-ink-soft ring-1 ring-line"
                  }`}
                  aria-hidden
                >
                  {isDone ? <Check size={26} strokeWidth={3} /> : locked ? <Lock size={20} /> : i + 1}
                </span>
                <span className="flex-1">
                  <span className={`block text-xl font-bold ${locked ? "text-ink-soft" : ""}`}>
                    {i + 1}. {l.title}
                  </span>
                  <span className="block text-ink-soft">{isDone ? "Done. Tap to practise again." : locked ? `Opens after lesson ${i}` : l.subtitle}</span>
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
    <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
      <dt className="flex items-center gap-2 text-ink-soft">
        <span className="text-cobalt">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
    </div>
  );
}

function Tile({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-line transition hover:ring-cobalt">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-soft text-cobalt">{icon}</span>
      <span>
        <span className="block text-lg font-bold">{title}</span>
        <span className="text-ink-soft">{sub}</span>
      </span>
    </Link>
  );
}

function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center" role="img" aria-label={`Daily goal: ${label} cards`}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e3d6d0" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={pct >= 1 ? "#5e6b42" : "#8f5b34"} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-700" />
      </svg>
      <span className="font-display text-xl font-bold">{label}</span>
    </div>
  );
}
