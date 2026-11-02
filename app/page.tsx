import Link from "next/link";
import { Nav, Logo } from "@/components/Nav";
import { SteppeScene } from "@/components/SteppeScene";
import { TryDemo } from "@/components/TryDemo";
import { AlphabetBoard } from "@/components/AlphabetBoard";
import { StreetSigns } from "@/components/StreetSigns";
import { Translator } from "@/components/Translator";

const METHOD = [
  { title: "Picture tricks", body: "Every letter has a picture to remember it by.", source: "Atkinson & Raugh, 1975" },
  { title: "Quick quizzes", body: "Answering beats rereading. Mistakes come back.", source: "Roediger & Karpicke, 2006" },
  { title: "Smart reviews", body: "Lessons return right before you'd forget.", source: "Cepeda et al., 2006" },
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

        <section className="bg-white px-4 py-20" aria-labelledby="need-now">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div>
              <h2 id="need-now" className="text-4xl font-bold sm:text-5xl">
                Need it right now?
              </h2>
              <p className="mt-4 text-xl text-ink-soft">Translate, hear how to say it, or show it full screen.</p>
              <Link href="/translate#phrases" className="btn btn-line mt-6 text-ink">
                Ready phrases for taxi, shop, doctor
              </Link>
            </div>
            <div className="panel p-5 sm:p-8">
              <Translator compact />
            </div>
          </div>
        </section>

        <TryDemo />
        <AlphabetBoard />
        <StreetSigns />

        <section className="bg-paper px-4 py-24" aria-labelledby="method">
          <div className="mx-auto max-w-6xl">
            <h2 id="method" className="text-4xl font-bold sm:text-5xl">
              How every lesson works.
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {METHOD.map((m, i) => (
                <li key={m.title} className="border-t-4 border-cobalt pt-6">
                  <span className="font-display text-5xl font-bold text-cobalt">{i + 1}</span>
                  <h3 className="mt-3 text-2xl font-bold">{m.title}</h3>
                  <p className="mt-2 text-lg text-ink-soft">{m.body}</p>
                  <p className="mt-3 text-sm text-ink-soft">{m.source}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white px-4 py-28">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden" aria-hidden>
            <div className="marquee flex w-max gap-16 whitespace-nowrap font-display text-[9rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(30,91,255,0.18)]">
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
            </div>
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold sm:text-6xl">Start your first lesson.</h2>
            <p className="mt-4 text-xl text-ink-soft">Free. 3 minutes.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login?mode=signup" className="btn btn-primary text-lg">
                Sign up free
              </Link>
              <a href="#try" className="btn btn-line text-ink">
                Try it first
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Logo />
          <p className="text-ink-soft">Made in Ulaanbaatar</p>
        </div>
      </footer>
    </>
  );
}
