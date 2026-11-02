"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

/*
  Starting page hero — "Toono".
  - The toono (ger crown) spins with all 35 letters and everyday words around it. It tilts with your mouse.
  - The big word decodes from random letters into real Mongolian you need on day one (taxi, shop, pharmacy).
  - Floating "tricky twin" tiles flip to show their real sound (Р is r, not P).
  Same sage / wood / cream palette as the rest of the site. Everything stops for prefers-reduced-motion.
*/

const CYR = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ";
const CYR_LOW = CYR.toLowerCase();

const WORDS = [
  { en: "Hello", mn: "Сайн уу", say: "sain uu" },
  { en: "Thank you", mn: "Баярлалаа", say: "bayarlalaa" },
  { en: "How much?", mn: "Хэд вэ?", say: "khed ve?" },
  { en: "Taxi", mn: "Такси", say: "taksi" },
  { en: "Pharmacy", mn: "Эмийн сан", say: "emiin san" },
  { en: "Coffee", mn: "Кофе", say: "kofe" },
];

/* Ribbon: different everyday words from the hero, so nothing repeats on screen. */
const RIBBON = [
  { mn: "Тийм", en: "Yes" },
  { mn: "Үгүй", en: "No" },
  { mn: "Уучлаарай", en: "Sorry" },
  { mn: "Ойлгохгүй байна", en: "I don’t understand" },
  { mn: "Хаана вэ?", en: "Where is it?" },
  { mn: "Тусламж!", en: "Help!" },
  { mn: "Ус", en: "Water" },
  { mn: "Талх", en: "Bread" },
  { mn: "Мөнгө", en: "Money" },
  { mn: "Зах", en: "Market" },
  { mn: "Автобус", en: "Bus" },
  { mn: "Эмнэлэг", en: "Hospital" },
  { mn: "Бие засах газар", en: "Toilet" },
  { mn: "Зүүн", en: "Left" },
  { mn: "Баруун", en: "Right" },
  { mn: "Хүйтэн", en: "Cold" },
  { mn: "Баяртай", en: "Goodbye" },
];

const TILES = [
  { c: "Р", s: "r", note: "not P!", x: "2%", y: "8%", r: -10, d: 0 },
  { c: "Н", s: "n", note: "not H!", x: "76%", y: "4%", r: 8, d: 0.7 },
  { c: "Ж", s: "zh", note: "plea-s-ure", x: "82%", y: "58%", r: -6, d: 1.3 },
  { c: "Ө", s: "ö", note: "b-ir-d", x: "-2%", y: "62%", r: 9, d: 0.4 },
  { c: "В", s: "v", note: "not B!", x: "64%", y: "80%", r: -5, d: 1 },
  { c: "Х", s: "kh", note: "lo-ch", x: "14%", y: "80%", r: 6, d: 1.6 },
];

const KNOWN = ["А", "К", "М", "О", "Т"];

// Round so server and browser print the same numbers (no hydration mismatch).
const r1 = (n: number) => Math.round(n * 10) / 10;

function useReduced() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/* Random letters settle left to right into the real word. */
function useDecode(target: string, run: boolean) {
  const [out, setOut] = useState(target);
  useEffect(() => {
    if (!run) return;
    const total = 26;
    let frame = 0;
    let t = 0;
    const tick = () => {
      frame++;
      const done = Math.floor((frame / total) * (target.length + 1));
      setOut(
        target
          .split("")
          .map((ch, i) => {
            if (i < done || /[\s?!]/.test(ch)) return ch;
            const pool = ch === ch.toLowerCase() ? CYR_LOW : CYR;
            return pool[Math.floor(Math.random() * pool.length)];
          })
          .join(""),
      );
      if (frame < total) t = window.setTimeout(tick, 34);
    };
    t = window.setTimeout(tick, 0);
    return () => window.clearTimeout(t);
  }, [target, run]);
  return run ? out : target;
}

function Toono({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  const rotateX = useTransform(my, [-1, 1], [14, -14]);
  const rotateY = useTransform(mx, [-1, 1], [-16, 16]);
  const C = 300;
  const ring = (r: number) => `M${C},${C} m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`;
  const poles = Array.from({ length: 40 }, (_, i) => (i / 40) * Math.PI * 2);

  return (
    <motion.div style={{ rotateX, rotateY, transformPerspective: 1100 }} className="relative aspect-square w-full">
      <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          <path id="ring-outer" d={ring(262)} />
          <path id="ring-inner" d={ring(196)} />
          <radialGradient id="toono-glow">
            <stop offset="0" stopColor="#f6ece0" />
            <stop offset="0.45" stopColor="#efe2d3" />
            <stop offset="1" stopColor="#efe2d3" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="toono-sky">
            <stop offset="0" stopColor="#e4e6da" />
            <stop offset="1" stopColor="#8a9ea7" />
          </radialGradient>
        </defs>

        <circle cx={C} cy={C} r="300" fill="url(#toono-glow)" />

        {/* roof poles (уни) */}
        <g stroke="#dab692" strokeWidth="5" strokeLinecap="round">
          {poles.map((a, i) => (
            <line key={i} x1={r1(C + Math.cos(a) * 150)} y1={r1(C + Math.sin(a) * 150)} x2={r1(C + Math.cos(a) * 232)} y2={r1(C + Math.sin(a) * 232)} />
          ))}
        </g>

        {/* outer ring: all 35 letters */}
        <g className="spin-slow">
          <circle cx={C} cy={C} r="284" fill="none" stroke="#b08a66" strokeWidth="2" strokeDasharray="3 9" />
          <text fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="30" fill="#6b4426">
            <textPath href="#ring-outer" textLength={Math.round(2 * Math.PI * 262)} lengthAdjust="spacing">
              {CYR.split("").join(" ") + " "}
            </textPath>
          </text>
        </g>

        {/* inner ring: day-one words */}
        <g className="spin-rev">
          <text fontFamily="Montserrat Variable, sans-serif" fontWeight="700" fontSize="19" fill="#5e6b42" letterSpacing="2">
            <textPath href="#ring-inner" textLength={Math.round(2 * Math.PI * 196)} lengthAdjust="spacing">
              САЙН УУ ✦ БАЯРЛАЛАА ✦ ХЭД ВЭ ✦ ТАКСИ ✦ КАФЕ ✦ ЭМИЙН САН ✦ ДЭЛГҮҮР ✦ ЗА ✦
            </textPath>
          </text>
        </g>

        {/* the toono: wooden crown with crossing bands, sky inside */}
        <circle cx={C} cy={C} r="140" fill="url(#toono-sky)" />
        <circle cx={C} cy={C} r="140" fill="none" stroke="#6b4426" strokeWidth="16" />
        <circle cx={C} cy={C} r="122" fill="none" stroke="#b08a66" strokeWidth="4" strokeDasharray="2 11" strokeLinecap="round" />
        <g className="spin-toono" stroke="#6b4426" strokeWidth="11" fill="none" strokeLinecap="round">
          <path d={`M${C} 162 Q 252 ${C} ${C} 438`} />
          <path d={`M${C} 162 Q 348 ${C} ${C} 438`} />
          <path d={`M162 ${C} Q ${C} 252 438 ${C}`} />
          <path d={`M162 ${C} Q ${C} 348 438 ${C}`} />
        </g>
        <circle cx={C} cy={C} r="28" fill="#8d9b6a" stroke="#fbf8f8" strokeWidth="6" />
        <circle cx={C + 46} cy={C - 54} r="14" fill="#dab692" className="pulse-sun" />
      </svg>
    </motion.div>
  );
}

function Tile({ t, mx, my, i }: { t: (typeof TILES)[number]; mx: MotionValue<number>; my: MotionValue<number>; i: number }) {
  const [flip, setFlip] = useState(false);
  const depth = 10 + i * 6;
  const x = useTransform(mx, [-1, 1], [-depth, depth]);
  const y = useTransform(my, [-1, 1], [-depth, depth]);
  return (
    <motion.div className="absolute z-10" style={{ left: t.x, top: t.y, x, y }}>
      <div className="float" style={{ animationDelay: `${t.d}s` }}>
        <button
          type="button"
          onMouseEnter={() => setFlip(true)}
          onMouseLeave={() => setFlip(false)}
          onFocus={() => setFlip(true)}
          onBlur={() => setFlip(false)}
          onClick={() => setFlip((f) => !f)}
          aria-label={`Letter ${t.c} sounds like ${t.s}`}
          className="block h-[76px] w-[76px] [perspective:600px] sm:h-[88px] sm:w-[88px]"
          style={{ rotate: `${t.r}deg` }}
        >
          <motion.span
            className="relative block h-full w-full [transform-style:preserve-3d]"
            animate={{ rotateY: flip ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <span className="absolute inset-0 grid place-items-center rounded-[22px] bg-white font-display text-4xl font-extrabold text-ink shadow-[0_3px_0_#dab692,0_20px_34px_-18px_rgba(59,39,22,0.55)] ring-1 ring-line [backface-visibility:hidden] sm:text-5xl">
              {t.c}
            </span>
            <span className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] bg-blend leading-tight shadow-[0_20px_34px_-18px_rgba(59,39,22,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="font-display text-3xl font-extrabold">{t.s}</span>
              <span className="text-[13px] font-semibold opacity-90">{t.note}</span>
            </span>
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}

export function HeroBlast() {
  const reduce = useReduced();
  const [idx, setIdx] = useState(0);
  const word = WORDS[idx];
  const shown = useDecode(word.mn, !reduce);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);

  // Mouse: -1..1, smoothed
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 70, damping: 18 });
  const my = useSpring(rawY, { stiffness: 70, damping: 18 });
  const px = useMotionValue(50);
  const py = useMotionValue(40);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${px}% ${py}%, rgba(218,182,146,0.34), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    rawX.set(fx * 2 - 1);
    rawY.set(fy * 2 - 1);
    px.set(fx * 100);
    py.set(fy * 100);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate flex min-h-[calc(100svh-4.6rem)] flex-col overflow-hidden bg-paper"
      aria-labelledby="hero-title"
    >
      {/* background: drifting blobs, cursor light, paper grain */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="blob absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-coral/45 blur-3xl" />
        <div className="blob absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-honey/35 blur-3xl [animation-delay:-6s]" />
        <div className="blob absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-soft blur-3xl [animation-delay:-11s]" />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <div className="grain absolute inset-0 opacity-[0.08] mix-blend-multiply" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-6 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:pt-6">
        {/* words */}
        <div className="relative z-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[15px] font-semibold text-ink ring-1 ring-line backdrop-blur">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cobalt" />
            </span>
            For foreigners living in Mongolia
          </p>

          <h1 id="hero-title" className="mt-6">
            <span className="sr-only">Learn Mongolian for life in Mongolia.</span>
            <span aria-hidden className="block">
              <span className="block text-2xl font-bold text-ink-soft sm:text-3xl">
                You say <span className="text-ink">“{word.en}”.</span>
              </span>
              <span className="mt-1 block text-xl font-semibold text-ink-soft sm:text-2xl">Mongolia hears:</span>
              <span className="relative mt-2 inline-block whitespace-nowrap font-display text-[clamp(3.4rem,10.5vw,8.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-cobalt">
                {shown}
                <span className="caret ml-1 inline-block h-[0.8em] w-[0.09em] translate-y-[0.06em] rounded-full bg-wood" />
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-4 w-full" aria-hidden>
                  <motion.path
                    key={idx}
                    d="M4 14 C 80 4, 160 4, 296 10"
                    fill="none"
                    stroke="#dab692"
                    strokeWidth="7"
                    strokeLinecap="round"
                    initial={{ pathLength: reduce ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                  />
                </svg>
              </span>
              <span className="mt-4 block font-mono text-lg font-semibold tracking-wide text-wood-dark sm:text-xl">/ {word.say} /</span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-xl text-ink-soft sm:text-2xl">
            Translate what you need now. Learn to say it yourself in 3-minute lessons.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#try" className="btn btn-primary group text-lg">
              Try a free lesson
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </a>
            <Link href="/translate" className="btn btn-line bg-white/50 text-ink backdrop-blur">
              Translate now
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ul className="flex gap-1.5" aria-label="Letters you already know: А, К, М, О, Т">
              {KNOWN.map((c, i) => (
                <li
                  key={c}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-gold font-display text-xl font-extrabold text-night shadow-[0_2px_0_#b8946f] transition-transform hover:-translate-y-1.5 hover:rotate-[-6deg]"
                  style={{ transitionDelay: `${i * 20}ms` }}
                  aria-hidden
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold text-ink">
              35 letters. <span className="text-ink-soft">You know 5 already.</span>
            </p>
          </div>
        </div>

        {/* toono */}
        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-[38rem]">
          <Toono mx={mx} my={my} />
          {TILES.map((t, i) => (
            <Tile key={t.c} t={t} i={i} mx={mx} my={my} />
          ))}
          <p className="absolute -bottom-10 left-1/2 z-20 hidden -translate-x-1/2 w-max whitespace-nowrap rounded-full bg-night px-4 py-1.5 text-sm font-semibold text-white shadow-lg sm:block">
            Tap a letter. Some are tricksters.
          </p>
        </div>
      </div>

      {/* tilted ribbon */}
      <div className="relative -mx-6 mb-10 -rotate-[1.6deg] bg-blend py-4 shadow-[0_24px_40px_-28px_rgba(59,39,22,0.7)]" aria-hidden>
        <div
          className="flex w-max whitespace-nowrap font-display text-2xl font-bold sm:text-3xl"
          style={{ animation: "marquee 70s linear infinite" }}
        >
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
    </section>
  );
}
