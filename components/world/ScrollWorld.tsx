"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { World } from "./createWorld";
import { Translator } from "../Translator";
import { TryDemo } from "../TryDemo";
import { AlphabetGrid, AlphabetLegend } from "../AlphabetBoard";
import { SignGrid } from "../StreetSigns";
import { useDecode, useReduced } from "../useDecode";
import { RIBBON, WORDS } from "@/lib/everyday";

/*
  The starting page as one scroll story (inspired by scroll-driven 3D sites like Kage).
  A 3D ger camp sits behind the page; scrolling moves the camera through 7 shots, from sunset to night.
  Each of the 7 sections is a chapter on top of it:
  - "sticky" chapters (hero, method, start) hold still and fade while the camera flies,
  - "flow" chapters (translator, demo, alphabet, signs) are normal glass cards you can use; the page snaps to them.
  Without WebGL, or with reduced motion, the same chapters show over a calm dusk-to-night gradient.
*/

const CHAPTERS = [
  { id: "ch-hello", label: "Hello", mn: "Сайн уу" },
  { id: "ch-translate", label: "Translate", mn: "Орчуулга" },
  { id: "ch-first-word", label: "First word", mn: "Эхний үг" },
  { id: "ch-alphabet", label: "Alphabet", mn: "Цагаан толгой" },
  { id: "ch-signs", label: "Signs", mn: "Гудамжинд" },
  { id: "ch-method", label: "Method", mn: "Арга" },
  { id: "ch-start", label: "Start", mn: "Эхэлцгээе" },
];
const LAST = CHAPTERS.length - 1;

const METHOD = [
  { title: "Picture tricks", body: "Every letter has a picture to remember it by.", source: "Atkinson & Raugh, 1975" },
  { title: "Quick quizzes", body: "Answering beats rereading. Mistakes come back.", source: "Roediger & Karpicke, 2006" },
  { title: "Smart reviews", body: "Lessons return right before you'd forget.", source: "Cepeda et al., 2006" },
];

const KNOWN = ["А", "К", "М", "О", "Т"];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function Kicker({ i, night = false }: { i: number; night?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] ${night ? "text-[#f1e6dc]/85" : "text-ink-soft"}`}>
      <span className="font-display tabular-nums">
        {String(i + 1).padStart(2, "0")} <span className="opacity-50">/ 07</span>
      </span>
      <span className={`h-px w-10 ${night ? "bg-[#f1e6dc]/50" : "bg-ink/30"}`} aria-hidden />
      <span className="normal-case tracking-normal">{CHAPTERS[i].mn}</span>
    </p>
  );
}

function HeroChapter({ reduce }: { reduce: boolean }) {
  const [idx, setIdx] = useState(0);
  const word = WORDS[idx];
  const shown = useDecode(word.mn, !reduce);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="sticky top-0 flex h-svh flex-col">
      <div data-fade className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-[calc(var(--nav-h)+1.5rem)] sm:px-8 lg:pr-24">
        <Kicker i={0} />
        <h1 className="mt-6">
          <span className="sr-only">Learn Mongolian for life in Mongolia.</span>
          <span aria-hidden className="block">
            <span className="block text-2xl font-bold text-ink-soft sm:text-3xl">
              You say <span className="text-ink">“{word.en}”.</span>
            </span>
            <span className="mt-1 block text-xl font-semibold text-ink-soft sm:text-2xl">Mongolia hears:</span>
            <span className="mt-2 block whitespace-nowrap font-display text-[clamp(3.2rem,min(11vw,15svh),9.5rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-cobalt [text-shadow:0_2px_40px_rgba(246,236,224,0.65)]">
              {shown}
              <span className="caret ml-1 inline-block h-[0.78em] w-[0.08em] translate-y-[0.06em] rounded-full bg-wood" />
            </span>
            <span className="mt-3 block font-mono text-lg font-semibold tracking-wide text-wood-dark sm:text-xl">/ {word.say} /</span>
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-xl text-ink sm:text-2xl [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:text-lg">Translate what you need now. Learn to say it yourself in 3-minute lessons.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#try" className="btn btn-primary group text-lg">
            Try a free lesson
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </a>
          <Link href="/translate" className="btn btn-line bg-white/45 text-ink backdrop-blur">
            Translate now
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 max-sm:hidden [@media(max-height:820px)]:hidden">
          <ul className="flex gap-1.5" aria-label="Letters you already know: А, К, М, О, Т">
            {KNOWN.map((c) => (
              <li key={c} aria-hidden className="grid h-11 w-11 place-items-center rounded-xl bg-gold font-display text-xl font-extrabold text-night shadow-[0_2px_0_#b8946f]">
                {c}
              </li>
            ))}
          </ul>
          <p className="text-lg font-semibold text-ink">
            35 letters. <span className="text-ink-soft">You know 5 already.</span>
          </p>
        </div>
      </div>

      <div data-fade className="relative -mx-6 mb-6 shrink-0 -rotate-[1.4deg] bg-blend py-3.5 shadow-[0_24px_40px_-28px_rgba(30,20,12,0.7)]" aria-hidden>
        <div className="flex w-max whitespace-nowrap font-display text-2xl font-bold sm:text-3xl" style={{ animation: "marquee 70s linear infinite" }}>
          {[0, 1].map((k) => (
            <span key={k} className="flex">
              {RIBBON.map((w, j) => (
                <span key={j} className="flex items-center gap-3 px-6">
                  {w.mn}
                  <span className="font-sans text-base font-medium opacity-75 sm:text-lg">{w.en}</span>
                  <span className="text-honey">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterNav({ active }: { active: number }) {
  return (
    <nav aria-label="Chapters" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ol className="flex flex-col gap-1 rounded-full bg-[#1d2630]/35 p-1.5 ring-1 ring-white/15 backdrop-blur-md">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              aria-current={i === active ? "step" : undefined}
              className="group relative grid h-10 w-10 place-items-center rounded-full font-display text-xs font-bold text-[#f6ece0] transition hover:bg-white/15 aria-[current=step]:bg-[#f6ece0] aria-[current=step]:text-night"
            >
              {String(i + 1).padStart(2, "0")}
              <span className="pointer-events-none absolute right-12 whitespace-nowrap rounded-full bg-night/85 px-3 py-1 text-sm font-semibold text-[#f6ece0] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {c.label} · {c.mn}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ScrollWorld() {
  const reduce = useReduced();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dayVeil = useRef<HTMLDivElement>(null);
  const nightVeil = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const show3d = !reduce && !failed;

  /* 3D world: load only in the browser, only when allowed */
  useEffect(() => {
    if (!show3d) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      worldRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVis = () => worldRef.current?.setActive(document.visibilityState === "visible");

    (async () => {
      try {
        const test = document.createElement("canvas");
        if (!test.getContext("webgl2") && !test.getContext("webgl")) throw new Error("no webgl");
        const { createWorld } = await import("./createWorld");
        const world = await createWorld(canvas, { mobile: window.innerWidth < 768 });
        if (disposed) return world.dispose();
        worldRef.current = world;
        ro = new ResizeObserver(([e]) => world.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(canvas);
        io = new IntersectionObserver(([e]) => world.setActive(e.isIntersecting && document.visibilityState === "visible"));
        io.observe(wrap);
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("visibilitychange", onVis);
        window.dispatchEvent(new Event("scroll"));
        canvas.dataset.ready = "1";
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, [show3d]);

  /* Scroll: drive the camera, fade sticky chapters, track the active chapter */
  useEffect(() => {
    const els = Array.from(wrapRef.current?.querySelectorAll<HTMLElement>("[data-ch]") ?? []);
    let tops: number[] = [];
    let hs: number[] = [];
    let lastActive = -1;
    let frame = 0;
    const measure = () => {
      tops = els.map((e) => e.getBoundingClientRect().top + window.scrollY);
      hs = els.map((e) => e.offsetHeight);
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const mid = y + vh * 0.5;

      // camera: hold during the first part of a chapter, fly to the next shot in the second part
      let t = 0;
      for (let i = 0; i < els.length; i++) {
        if (mid >= tops[i]) t = i + (i === LAST ? 0 : smooth(0.45, 1, (mid - tops[i]) / hs[i]));
      }
      worldRef.current?.setTarget(t);

      // veils keep text readable: light at dusk, dark at night
      if (dayVeil.current) dayVeil.current.style.opacity = String(1 - smooth(1.6, 3.2, t));
      if (nightVeil.current) nightVeil.current.style.opacity = String(smooth(2.6, 4.4, t));

      // sticky chapters fade and blur in/out while the camera moves (always fully visible with reduced motion)
      els.forEach((el, i) => {
        if (el.dataset.mode !== "sticky") return;
        const q = (y - tops[i]) / Math.max(1, hs[i] - vh);
        const o = reduce ? 1 : i === 0 ? 1 - smooth(0.55, 0.95, q) : i === LAST ? smooth(-0.6, -0.05, q) : smooth(-0.55, -0.05, q) * (1 - smooth(0.6, 0.95, q));
        el.querySelectorAll<HTMLElement>("[data-fade]").forEach((f) => {
          f.style.opacity = o > 0.999 ? "" : String(o);
          f.style.transform = o > 0.999 ? "" : `translateY(${(1 - o) * 36}px)`;
          f.style.filter = o > 0.98 ? "" : `blur(${(1 - o) * 10}px)`;
          f.style.visibility = o < 0.01 ? "hidden" : "";
        });
      });

      let a = 0;
      for (let i = 0; i < els.length; i++) if (mid >= tops[i]) a = i;
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    const ro = new ResizeObserver(onResize);
    els.forEach((e) => ro.observe(e));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  /* The scene slides up under the sticky menu bar, so the hero fills the whole screen */
  useEffect(() => {
    const header = document.querySelector("header");
    const wrap = wrapRef.current;
    if (!header || !wrap) return;
    const ro = new ResizeObserver(() => wrap.style.setProperty("--nav-h", `${header.offsetHeight}px`));
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  /* Gentle snapping to the cards you can use (translator, demo, alphabet, signs) */
  useEffect(() => {
    const html = document.documentElement;
    const prev = [html.style.scrollSnapType, html.style.scrollPaddingTop];
    html.style.scrollSnapType = "y proximity";
    html.style.scrollPaddingTop = "84px";
    return () => {
      html.style.scrollSnapType = prev[0];
      html.style.scrollPaddingTop = prev[1];
    };
  }, []);

  return (
    <div ref={wrapRef} className="world-bg relative">
      {/* the 3D scene, pinned behind all chapters */}
      <div className="pointer-events-none sticky top-0 -mb-[100svh] h-svh w-full overflow-hidden" aria-hidden>
        {show3d && <canvas ref={canvasRef} className="world-canvas absolute inset-0 h-full w-full" />}
        <div ref={dayVeil} className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_45%,rgba(240,230,226,0.82)_0%,rgba(240,230,226,0.35)_45%,transparent_70%)]" />
        <div
          ref={nightVeil}
          className="absolute inset-0 opacity-0 [background:linear-gradient(90deg,rgba(10,14,20,0.62)_0%,rgba(10,14,20,0.3)_38%,transparent_62%),radial-gradient(110%_80%_at_50%_45%,transparent_40%,rgba(10,14,20,0.5)_100%)]"
        />
      </div>

      <ChapterNav active={active} />

      {/* 01 — hero */}
      <section id={CHAPTERS[0].id} data-ch="0" data-mode="sticky" className="relative h-[220svh]" aria-label="Welcome">
        <HeroChapter reduce={reduce} />
      </section>

      {/* 02 — translator */}
      <section id={CHAPTERS[1].id} data-ch="1" className="relative flex min-h-[170svh] items-center px-4 py-[22svh] sm:px-8 lg:pr-24" aria-labelledby="need-now">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="world-text">
            <Kicker i={1} />
            <h2 id="need-now" className="mt-5 text-5xl font-bold sm:text-6xl">
              Need it right now?
            </h2>
            <p className="mt-4 text-xl text-ink sm:text-2xl">Translate, hear how to say it, or show it full screen.</p>
            <Link href="/translate#phrases" className="btn btn-line mt-7 bg-white/40 text-ink backdrop-blur">
              Ready phrases for taxi, shop, doctor
            </Link>
          </div>
          <div className="glass-card snap-center p-5 sm:p-8">
            <Translator compact />
          </div>
        </div>
      </section>

      {/* 03 — free demo lesson */}
      <section id={CHAPTERS[2].id} data-ch="2" className="relative flex min-h-[170svh] items-center px-4 py-[22svh] sm:px-8 lg:pr-24">
        <div className="glass-card snap-center mx-auto w-full max-w-4xl p-5 sm:p-8">
          <div className="mb-6">
            <Kicker i={2} />
          </div>
          <TryDemo bare />
        </div>
      </section>

      {/* 04 — alphabet */}
      <section id={CHAPTERS[3].id} data-ch="3" className="relative flex min-h-[175svh] items-center px-4 py-[24svh] sm:px-8 lg:pr-24" aria-labelledby="alphabet">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="night-text">
            <Kicker i={3} night />
            <h2 id="alphabet" className="mt-5 text-5xl font-bold sm:text-6xl">
              The whole alphabet.
            </h2>
            <p className="mt-4 text-xl text-[#f1e6dc]/90 sm:text-2xl">35 letters rise over the camp. You already know 5.</p>
            <AlphabetLegend className="mt-7 text-[#f6ece0]" />
          </div>
          <div className="glass-card snap-center p-3 sm:p-5">
            <AlphabetGrid compact />
          </div>
        </div>
      </section>

      {/* 05 — street signs */}
      <section id={CHAPTERS[4].id} data-ch="4" className="relative flex min-h-[175svh] items-center px-4 py-[24svh] sm:px-8 lg:pr-24" aria-labelledby="signs">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="night-text">
            <Kicker i={4} night />
            <h2 id="signs" className="mt-5 text-5xl font-bold sm:text-6xl">
              Read the signs around you.
            </h2>
            <p className="mt-4 text-xl text-[#f1e6dc]/90 sm:text-2xl">Pharmacy, shop, taxi. The signs you pass every day, lit up at night.</p>
          </div>
          <div className="glass-card snap-center p-4 sm:p-6">
            <SignGrid compact />
          </div>
        </div>
      </section>

      {/* 06 — method */}
      <section id={CHAPTERS[5].id} data-ch="5" data-mode="sticky" className="relative h-[200svh]" aria-labelledby="method">
        <div className="sticky top-0 flex h-svh items-center px-5 sm:px-8 lg:pr-24">
          <div data-fade className="night-text mx-auto w-full max-w-6xl">
            <Kicker i={5} night />
            <h2 id="method" className="mt-4 max-w-3xl text-4xl font-bold sm:mt-5 sm:text-7xl">
              How every lesson works.
            </h2>
            <ol className="mt-7 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-8">
              {METHOD.map((m, i) => (
                <li key={m.title} className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-[#f1e6dc]/40 pt-4 sm:block sm:pt-6">
                  <span className="row-span-3 font-display text-4xl font-extrabold text-honey sm:text-6xl">{i + 1}</span>
                  <h3 className="text-xl font-bold sm:mt-3 sm:text-2xl">{m.title}</h3>
                  <p className="mt-1 text-base text-[#f1e6dc]/90 sm:mt-2 sm:text-lg">{m.body}</p>
                  <p className="mt-1 text-sm text-[#f1e6dc]/70 sm:mt-3">{m.source}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 07 — start */}
      <section id={CHAPTERS[6].id} data-ch="6" data-mode="sticky" className="relative h-[170svh]" aria-labelledby="start">
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-5">
          <div data-fade className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden" aria-hidden>
            <div className="marquee flex w-max gap-16 whitespace-nowrap font-display text-[8rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(246,236,224,0.22)] sm:text-[11rem]">
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
              <span>Сайн байна уу  Баярлалаа  Хэд вэ  Уучлаарай  Баяртай</span>
            </div>
          </div>
          <div data-fade className="night-text relative mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Kicker i={6} night />
            </div>
            <h2 id="start" className="mt-5 text-5xl font-bold sm:text-7xl">
              Start your first lesson.
            </h2>
            <p className="mt-4 text-xl text-[#f1e6dc]/90 sm:text-2xl">Free. 3 minutes.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/login?mode=signup" className="btn btn-gold text-lg">
                Sign up free
              </Link>
              <a href="#try" className="btn btn-line text-[#f6ece0]">
                Try it first
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
