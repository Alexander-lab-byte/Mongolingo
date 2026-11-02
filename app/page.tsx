import Link from "next/link";
import { Nav, Logo } from "@/components/Nav";
import { SteppeScene } from "@/components/SteppeScene";
import { TryDemo } from "@/components/TryDemo";
import { AlphabetBoard } from "@/components/AlphabetBoard";
import { StreetSigns } from "@/components/StreetSigns";

const METHOD = [
  {
    title: "Learn with a picture",
    body: "Each letter comes with a picture and a short story, like “С is a curvy snake: sss”.",
    source: "Keyword method — Atkinson & Raugh, 1975",
  },
  {
    title: "Answer, don't reread",
    body: "Small quizzes straight away. Remembering an answer builds memory better than reading again. Wrong answers come back at the end.",
    source: "Testing effect — Roediger & Karpicke, 2006",
  },
  {
    title: "Review on the right day",
    body: "We bring each lesson back after 1, 3, 7 and 14 days, just before you would forget it.",
    source: "Spacing effect — Cepeda et al., 2006",
  },
];

const PEOPLE = [
  { who: "Kids", body: "Picture stories, stars and short games. No reading of long rules." },
  { who: "Working adults", body: "Three-minute lessons that fit a bus ride. Words you need at work and in shops." },
  { who: "Grandparents", body: "Big text, big buttons, plain words and no timers. Go at your own speed." },
];

export default function Home() {
  return (
    <>
      <a
        href="#try"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:p-3 focus:font-semibold"
      >
        Skip to the free lesson
      </a>
      <Nav />
      <main>
        <SteppeScene />
        <TryDemo />
        <AlphabetBoard />
        <StreetSigns />

        <section className="bg-white px-4 py-24" aria-labelledby="method">
          <div className="mx-auto max-w-6xl">
            <h2 id="method" className="max-w-2xl text-4xl font-bold sm:text-5xl">
              Every lesson works the same simple way.
            </h2>
            <p className="mt-4 max-w-xl text-xl text-ink-soft">Three steps, about three minutes. Each step comes from memory research.</p>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {METHOD.map((m, i) => (
                <li key={m.title} className="relative border-t-4 border-cobalt pt-6">
                  <span className="font-display text-5xl font-bold text-cobalt">{i + 1}</span>
                  <h3 className="mt-3 text-2xl font-bold">{m.title}</h3>
                  <p className="mt-3 text-lg text-ink-soft">{m.body}</p>
                  <p className="mt-4 text-sm text-ink-soft">{m.source}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-24" aria-labelledby="ages">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <h2 id="ages" className="text-4xl font-bold sm:text-5xl">
                Made for the whole family.
              </h2>
              <p className="mt-5 text-xl text-ink-soft">
                Need bigger text? Tap the largest <strong className="text-ink">A</strong> at the top of any page. Everything grows, and
                it stays that way next time.
              </p>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {PEOPLE.map((p) => (
                <li key={p.who} className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <h3 className="text-2xl font-bold">{p.who}</h3>
                  <p className="text-lg text-ink-soft">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative overflow-hidden bg-night px-4 py-28 text-white">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden" aria-hidden>
            <div className="marquee flex w-max gap-10 whitespace-nowrap font-display text-[9rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(79,195,255,0.28)]">
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
            </div>
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold sm:text-6xl">Your first lesson is three minutes away.</h2>
            <p className="mt-5 text-xl text-white/85">Free to start. Learn on your phone, tablet or computer.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/login?mode=signup" className="btn btn-gold text-lg">
                Create free account
              </Link>
              <a href="#try" className="btn btn-line text-white">
                Try without an account
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-night px-4 pb-10 text-white/75">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <Logo />
          <p>Made in Ulaanbaatar for everyone who moved here.</p>
        </div>
      </footer>
    </>
  );
}
