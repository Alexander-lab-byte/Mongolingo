"use client";

import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

// Reads the "reduce motion" setting in a way that does not break server rendering.
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

/*
  The story: as you scroll, a Mongolian ger (home) is built piece by piece —
  walls (letters) → roof (reading) → felt cover (speaking) → the door opens (welcome home).
  Metaphor = the learning path. Each step is also a "goal gradient" (Kivetz 2006):
  people speed up as they see they are close to finishing.
*/

const STEPS = [
  {
    kicker: "Welcome!",
    title: "Learn Mongolian, one piece at a time.",
    body: "For foreigners living in Mongolia — kids, parents and grandparents. Short, simple lessons with pictures.",
  },
  {
    kicker: "Piece 1 of 4 · The walls",
    title: "Learn the 35 letters",
    body: "Letters are the walls of your Mongolian home. Good news: you already know 5 of them!",
  },
  {
    kicker: "Piece 2 of 4 · The roof",
    title: "Read real street signs",
    body: "Taxi, shop, pharmacy, exit. Read them on the street in Ulaanbaatar.",
  },
  {
    kicker: "Piece 3 of 4 · The cover",
    title: "Speak everyday words",
    body: "Say hello, thank you and “how much?” at the market.",
  },
  {
    kicker: "Piece 4 of 4 · The door",
    title: "Welcome home. Сайн уу!",
    body: "“Сайн уу” means “Hello”. Your new life in Mongolia starts here.",
  },
];

const RANGES: [number, number][] = [
  [0, 0.14],
  [0.2, 0.36],
  [0.42, 0.56],
  [0.62, 0.76],
  [0.82, 1],
];

const GREETING = "Сайн уу!".split("");

function lattice() {
  // Crisscross wall lattice (khana) between x 440..760 and y 520..620.
  let d = "";
  for (let x = 340; x <= 760; x += 34) {
    d += `M${x} 620 L${x + 100} 520 `;
    d += `M${x + 100} 620 L${x} 520 `;
  }
  return d;
}

function roofPoles() {
  let d = "";
  for (let x = 440; x <= 760; x += 20) d += `M600 405 L${x} 520 `;
  return d;
}

function Caption({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const [a, b] = RANGES[i];
  const fade = 0.05;
  const isFirst = i === 0;
  const isLast = i === STEPS.length - 1;
  const opacity = useTransform(
    progress,
    isFirst ? [0, b, b + fade] : isLast ? [a - fade, a, 1] : [a - fade, a, b, b + fade],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(opacity, [0, 1], [24, 0]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  const s = STEPS[i];
  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className={`card absolute inset-x-4 mx-auto max-w-xl p-5 shadow-[0_8px_0_rgba(20,33,61,0.12)] sm:p-7 md:left-8 md:right-auto md:mx-0 ${
        isLast ? "bottom-6 md:bottom-10" : "top-24 sm:top-28"
      }`}
    >
      <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-mn-red">{s.kicker}</p>
      {isFirst ? (
        <h1 className="text-3xl font-black leading-tight sm:text-5xl">{s.title}</h1>
      ) : (
        <h2 className="text-3xl font-black leading-tight sm:text-4xl">{s.title}</h2>
      )}
      <p className="mt-3 text-lg text-ink-soft">{s.body}</p>
      {isFirst && (
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#try" className="btn btn-sun">
            ▶ Try a free lesson
          </a>
          <Link href="/login" className="btn btn-ghost">
            Sign up free
          </Link>
        </div>
      )}
      {isLast && (
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#try" className="btn btn-sun">
            ▶ Start now — it&apos;s free
          </a>
        </div>
      )}
    </motion.div>
  );
}

function Scene({ p }: { p: MotionValue<number> }) {
  const dayOpacity = useTransform(p, [0, 0.4], [0, 1]);
  const sunY = useTransform(p, [0, 0.5], [640, 170]);
  const cloudX = useTransform(p, [0, 1], [-60, 140]);
  const wall = useTransform(p, [0.14, 0.34], [0, 1]);
  const wallShow = useTransform(p, [0.13, 0.15], [0, 1]);
  const roofShow = useTransform(p, [0.35, 0.37], [0, 1]);
  const roof = useTransform(p, [0.36, 0.54], [0, 1]);
  const ring = useTransform(p, [0.36, 0.42], [0, 1]);
  const cover = useTransform(p, [0.58, 0.62], [0, 1]);
  const coverY = useTransform(p, [0.58, 0.72], [-260, 0]);
  const door = useTransform(p, [0.8, 0.9], [1, 0.12]);
  const glow = useTransform(p, [0.8, 0.9], [0, 1]);
  const smoke = useTransform(p, [0.88, 1], [0, 0.9]);
  const smokeY = useTransform(p, [0.88, 1], [0, -40]);
  const wordFloat = useTransform(p, [0, 0.8], [0, 1]);
  const birdsOpacity = useTransform(p, [0, 0.1, 0.7, 0.8], [0.9, 0.9, 0.9, 0]);

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="A Mongolian ger (round tent home) on the green steppe is built piece by piece as the sun rises."
    >
      <defs>
        <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#ffe8c7" />
        </linearGradient>
        <linearGradient id="day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5db7ff" />
          <stop offset="1" stopColor="#d7ecff" />
        </linearGradient>
        <pattern id="orn" width="24" height="18" patternUnits="userSpaceOnUse">
          <rect width="24" height="18" fill="#0b5fb0" />
          <path d="M4 14 V4 H20 V14 H8 V8 H16" fill="none" stroke="#ffc93c" strokeWidth="2.5" />
        </pattern>
        <clipPath id="wallClip">
          <rect x="440" y="520" width="320" height="100" />
        </clipPath>
      </defs>

      <rect width="1200" height="800" fill="url(#dawn)" />
      <motion.rect width="1200" height="800" fill="url(#day)" style={{ opacity: dayOpacity }} />

      <motion.circle cx="930" r="70" fill="#ffc93c" style={{ cy: sunY }} />

      <motion.g style={{ x: cloudX }} fill="#fff" opacity="0.9">
        <ellipse cx="200" cy="150" rx="90" ry="30" />
        <ellipse cx="260" cy="130" rx="60" ry="30" />
        <ellipse cx="640" cy="90" rx="70" ry="22" />
      </motion.g>

      {/* Floating letters, like birds over the steppe */}
      <motion.g style={{ opacity: birdsOpacity }} fontWeight="900" fill="#14213d">
        {["А", "Б", "Ө", "Ү", "Ж", "Я"].map((ch, i) => (
          <FloatingLetter key={ch} ch={ch} i={i} p={wordFloat} />
        ))}
      </motion.g>

      {/* Mountains and steppe */}
      <path d="M0 560 L180 420 L320 520 L470 390 L640 540 L820 400 L1000 520 L1200 430 L1200 800 L0 800Z" fill="#8fb3d9" />
      <path d="M0 600 Q300 520 600 590 T1200 570 L1200 800 L0 800Z" fill="#7cb342" />
      <path d="M0 640 Q400 590 800 630 T1200 625 L1200 800 L0 800Z" fill="#9ccc65" />

      {/* Ger: walls (lattice) */}
      <motion.path
        d={lattice()}
        clipPath="url(#wallClip)"
        fill="none"
        stroke="#9c5a2b"
        strokeWidth="6"
        strokeLinecap="round"
        style={{ pathLength: wall, opacity: wallShow }}
      />
      {/* Roof poles + crown ring (toono) */}
      <motion.path d={roofPoles()} fill="none" stroke="#c0392b" strokeWidth="5" style={{ pathLength: roof, opacity: roofShow }} />
      <motion.circle cx="600" cy="405" r="26" fill="none" stroke="#9c5a2b" strokeWidth="8" style={{ pathLength: ring, opacity: roofShow }} />

      {/* Felt cover */}
      <motion.g style={{ opacity: cover, y: coverY }}>
        <path
          d="M430 625 L430 520 Q432 512 445 508 L575 410 Q600 396 625 410 L755 508 Q768 512 770 520 L770 625 Z"
          fill="#ffffff"
          stroke="#d9d2c3"
          strokeWidth="4"
        />
        <rect x="430" y="512" width="340" height="18" fill="url(#orn)" />
        <path d="M430 560 H770 M430 595 H770" stroke="#14213d" strokeWidth="3" opacity="0.5" />
        <circle cx="600" cy="405" r="26" fill="#ffc93c" stroke="#9c5a2b" strokeWidth="6" />
      </motion.g>

      {/* Door: warm light behind, door swings open */}
      <motion.rect x="568" y="535" width="64" height="90" rx="4" fill="#ffe08a" style={{ opacity: glow }} />
      <motion.g style={{ opacity: cover, scaleX: door, originX: 0, transformBox: "fill-box" }}>
        <rect x="568" y="535" width="64" height="90" rx="4" fill="#c8102e" stroke="#ffc93c" strokeWidth="4" />
        <path d="M580 550 H620 V610 H580 Z M590 560 H610 V600 H590 Z" fill="none" stroke="#ffc93c" strokeWidth="3" />
      </motion.g>

      {/* Smoke from the crown — someone is home */}
      <motion.g style={{ opacity: smoke, y: smokeY }} fill="#ffffff">
        <circle cx="612" cy="372" r="12" />
        <circle cx="632" cy="350" r="15" />
        <circle cx="660" cy="330" r="18" />
      </motion.g>

      {/* Greeting letters fly in and land above the ger */}
      <g fontWeight="900" fontSize="64" fill="#14213d" textAnchor="middle">
        {GREETING.map((ch, i) => (
          <GreetingLetter key={i} ch={ch} i={i} p={p} />
        ))}
      </g>
    </svg>
  );
}

function FloatingLetter({ ch, i, p }: { ch: string; i: number; p: MotionValue<number> }) {
  const y = useTransform(p, [0, 1], [0, i % 2 ? -50 : -90]);
  return (
    <motion.text x={120 + i * 170} y={260 + (i % 2) * 70} fontSize={i % 2 ? 44 : 56} style={{ y }} opacity={0.55}>
      {ch}
    </motion.text>
  );
}

function GreetingLetter({ ch, i, p }: { ch: string; i: number; p: MotionValue<number> }) {
  const endX = 600 + (i - (GREETING.length - 1) / 2) * 44;
  const startX = 100 + ((i * 197) % 1000);
  const startY = 80 + ((i * 89) % 200);
  const x = useTransform(p, [0.82, 0.95], [startX, endX]);
  const y = useTransform(p, [0.82, 0.95], [startY, 250]);
  const opacity = useTransform(p, [0.8, 0.86], [0, 1]);
  if (ch === " ") return null;
  return (
    <motion.text style={{ x, y, opacity }} x={0} y={0}>
      {ch}
    </motion.text>
  );
}

function StaticStory() {
  // For people who turned on "reduce motion": same story, no movement.
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black leading-tight sm:text-5xl">{STEPS[0].title}</h1>
      <p className="mt-3 max-w-2xl text-xl text-ink-soft">{STEPS[0].body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="#try" className="btn btn-sun">
          ▶ Try a free lesson
        </a>
        <Link href="/login" className="btn btn-ghost">
          Sign up free
        </Link>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2">
        {STEPS.slice(1).map((s) => (
          <li key={s.title} className="card p-5">
            <p className="text-sm font-extrabold uppercase text-mn-red">{s.kicker}</p>
            <h2 className="text-2xl font-black">{s.title}</h2>
            <p className="text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SteppeScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (reduce) return <StaticStory />;

  return (
    <section ref={ref} className="relative h-[420vh]" aria-label="The Mongolingo story">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Scene p={scrollYProgress} />
        {STEPS.map((_, i) => (
          <Caption key={i} i={i} progress={scrollYProgress} />
        ))}
        <motion.div
          style={{ opacity: hint }}
          className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-center"
        >
          <span className="nudge rounded-full bg-white px-5 py-2 text-lg font-extrabold shadow">Scroll down ↓</span>
          <a href="#try" className="rounded-full bg-ink px-4 py-2 font-bold text-white underline-offset-4 hover:underline">
            Skip the story
          </a>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-white/50" aria-hidden>
          <motion.div className="h-full bg-mn-red" style={{ width: bar }} />
        </div>
      </div>
    </section>
  );
}
