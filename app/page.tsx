import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SteppeScene } from "@/components/SteppeScene";
import { TryDemo } from "@/components/TryDemo";

const METHODS = [
  {
    emoji: "🖼️",
    title: "Picture tricks",
    body: "Every letter comes with a picture and a funny story. Pictures + words are remembered better than words alone.",
  },
  {
    emoji: "❓",
    title: "Little quizzes",
    body: "Answering a question helps you remember more than reading again. So we ask a lot of small, easy questions.",
  },
  {
    emoji: "📅",
    title: "Come back tomorrow",
    body: "Short reviews spread over days beat one long study session. We remind you what to review and when.",
  },
  {
    emoji: "🧩",
    title: "Small pieces",
    body: "Only 4–7 new things per lesson, so your brain never feels full. Each lesson takes about 3 minutes.",
  },
];

const LIFE = [
  { emoji: "🚕", title: "Taxi & bus", mn: "ТАКСИ" },
  { emoji: "🏪", title: "Shop & market", mn: "ДЭЛГҮҮР" },
  { emoji: "💊", title: "Pharmacy", mn: "ЭМИЙН САН" },
  { emoji: "🏥", title: "Hospital", mn: "ЭМНЭЛЭГ" },
  { emoji: "👋", title: "Hello & thanks", mn: "Баярлалаа" },
  { emoji: "💰", title: "How much?", mn: "Хэд вэ?" },
];

const PEOPLE = [
  { emoji: "👧", who: "Kids", body: "Big pictures, fun stars and short games." },
  { emoji: "🧑‍💼", who: "Working adults", body: "3-minute lessons for the bus ride to work." },
  { emoji: "👵", who: "Grandparents", body: "Big text, big buttons, no rush and no timers." },
];

export default function Home() {
  return (
    <>
      <a href="#try" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:p-3">
        Skip to the free lesson
      </a>
      <Nav />
      <main>
        <SteppeScene />

        <TryDemo />

        <section className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-center font-extrabold uppercase tracking-wide text-mn-red">Learn for real life</p>
          <h2 className="mt-1 text-center text-4xl font-black">Words you will use this week</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {LIFE.map((l) => (
              <li key={l.title} className="card flex flex-col items-center p-5 text-center">
                <span className="text-5xl" aria-hidden>
                  {l.emoji}
                </span>
                <span className="cyr mt-3 rounded-lg bg-sun px-3 py-1 text-xl font-black">{l.mn}</span>
                <span className="mt-2 text-lg font-bold">{l.title}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-extrabold uppercase tracking-wide text-mn-red">Why it works</p>
            <h2 className="mt-1 text-center text-4xl font-black">Built on how memory really works</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {METHODS.map((m) => (
                <li key={m.title} className="card flex gap-4 p-6">
                  <span className="text-5xl" aria-hidden>
                    {m.emoji}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black">{m.title}</h3>
                    <p className="mt-1 text-lg text-ink-soft">{m.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-4xl font-black">Made for every age</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {PEOPLE.map((p) => (
              <li key={p.who} className="card p-6 text-center">
                <span className="text-6xl" aria-hidden>
                  {p.emoji}
                </span>
                <h3 className="mt-2 text-2xl font-black">{p.who}</h3>
                <p className="mt-1 text-lg text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-lg">
            Need bigger text? Use the <strong>A A A</strong> buttons at the top of the page.
          </p>
        </section>

        <section className="bg-brand px-4 py-16 text-center text-white">
          <h2 className="text-4xl font-black">Your first lesson takes 3 minutes.</h2>
          <p className="mt-2 text-xl">Free. No credit card. Start today, read signs this week.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login?mode=signup" className="btn btn-sun text-xl">
              Create free account
            </Link>
            <a href="#try" className="btn btn-ghost">
              Try without account
            </a>
          </div>
        </section>
      </main>
      <footer className="px-4 py-8 text-center text-ink-soft">
        <p>
          <span className="cyr font-bold">Монгол хэл</span> · Mongolingo · Made in Ulaanbaatar 🇲🇳
        </p>
      </footer>
    </>
  );
}
