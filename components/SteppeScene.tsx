"use client";

import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
  The story — night turns into the Eternal Blue Sky while a ger is built:
  walls (letters) → roof (signs) → felt cover (words) → door opens (welcome home).
  The giant word МОНГОЛ rises behind the mountains with the sun.
  Progress is always visible (goal-gradient effect, Kivetz et al. 2006).
*/

function usePrefersReducedMotion() {
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

const STEPS = [
  { title: "Learn Mongolian for life in Mongolia.", body: "Translate what you need now. Learn to say it yourself in 3-minute lessons." },
  { title: "35 letters. You know 5 already.", body: "" },
  { title: "Read the signs around you.", body: "" },
  { title: "Speak at the shop and market.", body: "" },
  { title: "Сайн уу! Welcome home.", body: "" },
];
const RAIL = ["Letters", "Signs", "Words", "Home"];

const RANGES: [number, number][] = [
  [0, 0.12],
  [0.18, 0.34],
  [0.4, 0.55],
  [0.61, 0.76],
  [0.82, 1],
];

// Deterministic "random" so server and browser draw the same grass.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const R = rng(7);
const GRASS = Array.from({ length: 70 }, (_, i) => ({ x: (i * 23.3 + R() * 18) % 1600, h: 14 + R() * 22, lean: (R() - 0.5) * 14 }));

function lattice() {
  let d = "";
  for (let x = 480; x <= 1080; x += 30) {
    d += `M${x} 790 L${x + 92} 680 M${x + 92} 790 L${x} 680 `;
  }
  return d;
}
function roofPoles() {
  let d = "";
  for (let x = 610; x <= 990; x += 19) d += `M800 548 L${x} 680 `;
  return d;
}

function Caption({ i, p }: { i: number; p: MotionValue<number> }) {
  const [a, b] = RANGES[i];
  const f = 0.05;
  const isFirst = i === 0;
  const isLast = i === STEPS.length - 1;
  const opacity = useTransform(
    p,
    isFirst ? [0, b, b + f] : isLast ? [a - f, a, 1] : [a - f, a, b, b + f],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(opacity, [0, 1], [28, 0]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  const s = STEPS[i];
  const Heading = isFirst ? "h1" : "h2";
  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className={`absolute inset-x-4 mx-auto text-ink md:left-10 md:right-auto md:mx-0 lg:left-16 ${
        isFirst ? "top-28 max-w-[40rem] sm:top-36" : isLast ? "bottom-8 max-w-[26rem] md:bottom-12" : "top-28 max-w-[30rem] sm:top-32"
      } ${isFirst ? "" : "light-glass rounded-[28px] p-6 sm:p-8"}`}
    >
      {!isFirst && <p className="mb-2 font-semibold text-cobalt">Step {i} of 4</p>}
      <Heading
        className={`font-bold ${isFirst ? "text-[2.6rem] leading-[1.02] sm:text-[3.8rem] lg:text-[4.4rem]" : "text-2xl sm:text-4xl"}`}
      >
        {s.title}
      </Heading>
      {s.body && <p className="mt-4 text-xl text-ink-soft sm:text-2xl">{s.body}</p>}
      {(isFirst || isLast) && (
        <div className={`flex flex-wrap gap-3 ${isLast ? "mt-5" : "mt-8"}`}>
          <a href="#try" className="btn btn-primary">
            Try a free lesson
          </a>
          {isFirst && (
            <Link href="/translate" className="btn btn-line text-ink">
              Translate now
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Rail({ p }: { p: MotionValue<number> }) {
  const h = useTransform(p, [0.12, 0.92], ["0%", "100%"]);
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden>
      <div className="relative flex h-80 flex-col justify-between pl-6">
        <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-[2px] bg-ink/15">
          <motion.div className="w-full bg-cobalt" style={{ height: h }} />
        </div>
        {RAIL.map((label, i) => (
          <RailDot key={label} label={label} i={i} p={p} />
        ))}
      </div>
    </div>
  );
}

function RailDot({ label, i, p }: { label: string; i: number; p: MotionValue<number> }) {
  const at = RANGES[i + 1][0];
  const on = useTransform(p, [at - 0.02, at], [0, 1]);
  const bg = useTransform(on, [0, 1], ["rgba(10,15,44,0.18)", "#1e5bff"]);
  const color = useTransform(on, [0, 1], ["rgba(10,15,44,0.5)", "#0a0f2c"]);
  return (
    <div className="relative flex items-center gap-3">
      <motion.span className="absolute -left-6 h-4 w-4 rounded-full ring-4 ring-white" style={{ background: bg }} />
      <motion.span className="font-semibold" style={{ color }}>
        {label}
      </motion.span>
    </div>
  );
}

function Scene({ p }: { p: MotionValue<number> }) {
  // Sky
  const sunrise = useTransform(p, [0.08, 0.32], [0, 1]);
  const day = useTransform(p, [0.32, 0.6], [0, 1]);
  const sunY = useTransform(p, [0.1, 0.62], [720, 230]);
  const sunScale = useTransform(p, [0.1, 0.62], [1.25, 1]);
  // Giant word
  const wordY = useTransform(p, [0.78, 0.96], [300, 0]);
  const wordOpacity = useTransform(p, [0.78, 0.86], [0, 1]);
  // Parallax mountains
  const farY = useTransform(p, [0, 1], [0, -18]);
  const midY = useTransform(p, [0, 1], [0, -40]);
  const nearY = useTransform(p, [0, 1], [0, -70]);
  // Ger
  const wall = useTransform(p, [0.14, 0.32], [0, 1]);
  const wallShow = useTransform(p, [0.13, 0.15], [0, 1]);
  const roof = useTransform(p, [0.36, 0.52], [0, 1]);
  const roofShow = useTransform(p, [0.35, 0.37], [0, 1]);
  const cover = useTransform(p, [0.58, 0.62], [0, 1]);
  const coverY = useTransform(p, [0.58, 0.72], [-300, 0]);
  const door = useTransform(p, [0.8, 0.9], [1, 0.1]);
  const glow = useTransform(p, [0.8, 0.9], [0, 1]);
  const smoke = useTransform(p, [0.62, 0.7, 0.8, 0.84], [0, 0.85, 0.85, 0]);
  const smokeY = useTransform(p, [0.62, 0.84], [10, -50]);
  const birds = useTransform(p, [0.6, 1], [900, 1050]);
  const birdsOpacity = useTransform(p, [0.55, 0.65], [0, 1]);

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Night turns into a bright blue morning over the Mongolian steppe while a ger (round felt home) is built piece by piece."
    >
      <defs>
        <linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f2f6ff" />
          <stop offset="1" stopColor="#ffe8da" />
        </linearGradient>
        <linearGradient id="g-sunrise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f8ff" />
          <stop offset="0.5" stopColor="#ffe2cf" />
          <stop offset="0.8" stopColor="#ffd2a6" />
          <stop offset="1" stopColor="#ffe9b0" />
        </linearGradient>
        <linearGradient id="g-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ccbff" />
          <stop offset="0.6" stopColor="#d4eeff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="g-sun">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.35" stopColor="#ffd75a" />
          <stop offset="0.6" stopColor="#ffc531" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff5a4e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-felt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#eef1fb" />
          <stop offset="1" stopColor="#c9d0e8" />
        </linearGradient>
        <linearGradient id="g-roof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d3d9ef" />
        </linearGradient>
        <linearGradient id="g-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fd08f" />
          <stop offset="1" stopColor="#2f9e5c" />
        </linearGradient>
        <pattern id="p-orn" width="28" height="22" patternUnits="userSpaceOnUse">
          <rect width="28" height="22" fill="#1e5bff" />
          <path d="M5 17 V5 H23 V17 H10 V10 H18" fill="none" stroke="#ffc531" strokeWidth="2.6" />
        </pattern>
        <clipPath id="c-wall">
          <rect x="560" y="680" width="480" height="110" />
        </clipPath>
      </defs>

      {/* Sky layers */}
      <rect width="1600" height="1000" fill="url(#g-night)" />
      <motion.rect width="1600" height="1000" fill="url(#g-sunrise)" style={{ opacity: sunrise }} />
      <motion.rect width="1600" height="1000" fill="url(#g-day)" style={{ opacity: day }} />

      {/* Sun */}
      <motion.circle cx="1060" r="220" fill="url(#g-sun)" style={{ cy: sunY, scale: sunScale }} />
      <motion.circle cx="1060" r="70" fill="#fff3c4" style={{ cy: sunY }} />

      {/* Giant word, rising behind the mountains */}
      <motion.text
        x="800"
        y="455"
        textAnchor="middle"
        fontFamily="Unbounded Variable, sans-serif"
        fontWeight="800"
        fontSize="215"
        className="hero-word"
        letterSpacing="-4"
        fill="#0a0f2c"
        style={{ y: wordY, opacity: wordOpacity }}
      >
        МОНГОЛ
      </motion.text>

      {/* Birds */}
      <motion.g style={{ x: birds, opacity: birdsOpacity }} fill="none" stroke="#0a0f2c" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path d="M300 190 q12 -12 24 0 q12 -12 24 0" />
        <path d="M360 220 q9 -9 18 0 q9 -9 18 0" />
        <path d="M250 235 q8 -8 16 0 q8 -8 16 0" />
      </motion.g>

      {/* Far mountains with snow */}
      <motion.g style={{ y: farY }}>
        <path d="M0 690 L170 520 L300 610 L460 470 L620 600 L760 500 L930 640 L1100 480 L1260 590 L1420 500 L1600 610 L1600 1000 L0 1000Z" fill="#c9d3f5" />
        <motion.path
          d="M0 690 L170 520 L300 610 L460 470 L620 600 L760 500 L930 640 L1100 480 L1260 590 L1420 500 L1600 610 L1600 1000 L0 1000Z"
          fill="#a9c0f3"
          style={{ opacity: day }}
        />
        <path d="M460 470 L505 512 L480 508 L462 525 L440 505 L420 515Z M1100 480 L1142 520 L1118 516 L1100 532 L1080 512 L1060 520Z M170 520 L205 555 L185 551 L170 565 L152 548Z" fill="#fff" opacity="0.95" />
      </motion.g>

      {/* Mid hills */}
      <motion.g style={{ y: midY }}>
        <path d="M0 760 C220 650 420 700 620 720 C820 740 1000 640 1220 680 C1400 712 1500 690 1600 700 L1600 1000 L0 1000Z" fill="#a7bdf0" />
        <motion.path
          d="M0 760 C220 650 420 700 620 720 C820 740 1000 640 1220 680 C1400 712 1500 690 1600 700 L1600 1000 L0 1000Z"
          fill="#7cb3f0"
          style={{ opacity: day }}
        />
      </motion.g>

      {/* Near steppe */}
      <motion.g style={{ y: nearY }}>
        <path d="M0 800 C300 760 560 790 800 790 C1060 790 1300 750 1600 780 L1600 1100 L0 1100Z" fill="#9fdcae" />
        <motion.path
          d="M0 800 C300 760 560 790 800 790 C1060 790 1300 750 1600 780 L1600 1100 L0 1100Z"
          fill="url(#g-ground)"
          style={{ opacity: sunrise }}
        />

        {/* Ger — lattice walls */}
        <ellipse cx="800" cy="796" rx="290" ry="18" fill="#0a0f2c" opacity="0.12" />
        <motion.path
          d={lattice()}
          clipPath="url(#c-wall)"
          fill="none"
          stroke="#d9944f"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ pathLength: wall, opacity: wallShow }}
        />
        {/* Roof poles + crown */}
        <motion.path d={roofPoles()} fill="none" stroke="#ff5a4e" strokeWidth="4.5" style={{ pathLength: roof, opacity: roofShow }} />
        <motion.circle cx="800" cy="548" r="30" fill="none" stroke="#d9944f" strokeWidth="9" style={{ pathLength: roof, opacity: roofShow }} />

        {/* Felt cover */}
        <motion.g style={{ opacity: cover, y: coverY }}>
          <path d="M548 795 L548 678 Q550 668 566 663 L770 552 Q800 536 830 552 L1034 663 Q1050 668 1052 678 L1052 795 Z" fill="url(#g-felt)" />
          <path d="M566 663 L770 552 Q800 536 830 552 L1034 663 Z" fill="url(#g-roof)" />
          <path d="M566 663 L770 552 Q800 536 830 552 L1034 663" fill="none" stroke="#b9c2e0" strokeWidth="3" />
          <rect x="548" y="668" width="504" height="22" fill="url(#p-orn)" />
          <path d="M548 730 H1052 M548 764 H1052" stroke="#3b4466" strokeWidth="3" opacity="0.5" />
          <path d="M680 610 L800 548 L920 610" fill="none" stroke="#3b4466" strokeWidth="3" opacity="0.35" />
          <circle cx="800" cy="548" r="30" fill="#ffc531" stroke="#c97d2e" strokeWidth="7" />
          <path d="M778 548 H822 M800 526 V570 M784 532 L816 564 M816 532 L784 564" stroke="#c97d2e" strokeWidth="3.5" />
        </motion.g>

        {/* Door — warm light, then the door swings open */}
        <motion.rect x="760" y="694" width="80" height="101" rx="5" fill="#ffe08a" style={{ opacity: glow }} />
        <motion.g style={{ opacity: cover, scaleX: door, originX: 0, transformBox: "fill-box" }}>
          <rect x="760" y="694" width="80" height="101" rx="5" fill="#ff5a4e" stroke="#ffc531" strokeWidth="4" />
          <path d="M774 710 H826 V780 H774 Z M786 722 H814 V768 H786 Z" fill="none" stroke="#ffc531" strokeWidth="3" />
        </motion.g>

        {/* Smoke */}
        <motion.g style={{ opacity: smoke, y: smokeY }} fill="#ffffff">
          <circle cx="818" cy="515" r="11" />
          <circle cx="845" cy="500" r="14" />
          <circle cx="880" cy="490" r="17" />
        </motion.g>

        {/* Grass */}
        <motion.g style={{ opacity: sunrise }} stroke="#2a8a50" strokeWidth="3" strokeLinecap="round" fill="none">
          {GRASS.map((g, i) => (
            <path key={i} d={`M${g.x} ${900 + (i % 3) * 30} q${g.lean / 2} ${-g.h / 2} ${g.lean} ${-g.h}`} />
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}

function StaticStory() {
  return (
    <section className="bg-gradient-to-b from-white to-sky-soft px-4 pb-16 pt-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="max-w-3xl text-[2.6rem] font-bold leading-[1.04] sm:text-6xl">{STEPS[0].title}</h1>
        <p className="mt-5 text-xl text-ink-soft sm:text-2xl">{STEPS[0].body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#try" className="btn btn-primary">
            Try a free lesson
          </a>
          <Link href="/translate" className="btn btn-line text-ink">
            Translate now
          </Link>
        </div>
        <ol className="mt-12 grid gap-3 sm:grid-cols-2">
          {STEPS.slice(1).map((s, i) => (
            <li key={s.title} className="rounded-[24px] bg-white p-6 ring-1 ring-line">
              <p className="font-semibold text-cobalt">Step {i + 1} of 4</p>
              <h2 className="mt-1 text-2xl font-bold">{s.title}</h2>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SteppeScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const hint = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  if (reduce) return <StaticStory />;

  return (
    <section ref={ref} className="relative h-[380vh] bg-white" aria-label="The Mongolingo story">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Scene p={scrollYProgress} />
        {STEPS.map((_, i) => (
          <Caption key={i} i={i} p={scrollYProgress} />
        ))}
        <Rail p={scrollYProgress} />
        <motion.div style={{ opacity: hint }} className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 text-ink">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span className="relative flex h-9 w-6 justify-center rounded-full border-2 border-ink/70">
              <span className="mt-1.5 h-2 w-1 animate-bounce rounded-full bg-ink" />
            </span>
            Scroll
          </span>
          <a href="#try" className="rounded-full px-4 py-2 font-semibold text-ink-soft underline underline-offset-4 hover:text-ink">
            Skip to the free lesson
          </a>
        </motion.div>
      </div>
    </section>
  );
}
