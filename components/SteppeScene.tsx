"use client";

import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
  The story — a street in Ulaanbaatar comes to life as you scroll:
  buildings appear (letters) → shop, pharmacy and café signs light up and a taxi arrives (signs)
  → speech bubbles pop up (words) → windows light up and МОНГОЛ rises over the city (you're ready).
  Everyone understands a street; it also shows exactly what the app helps with.
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
  { title: "Сайн уу! You\u2019re ready.", body: "" },
];
const RAIL = ["Letters", "Signs", "Words", "Ready"];

const RANGES: [number, number][] = [
  [0, 0.12],
  [0.18, 0.34],
  [0.4, 0.55],
  [0.61, 0.76],
  [0.82, 1],
];

const rectPath = (x: number, y: number, w: number, h: number) => `M${x} ${y + h} V${y} H${x + w} V${y + h} Z`;

type Building = { x: number; top: number; w: number; fill: string; cols: number; rows: number };
const BUILDINGS: Building[] = [
  { x: 450, top: 440, w: 250, fill: "#fffdf9", cols: 3, rows: 2 },
  { x: 715, top: 370, w: 210, fill: "#fbf5ec", cols: 3, rows: 3 },
  { x: 940, top: 470, w: 210, fill: "#fbefd6", cols: 3, rows: 2 },
];
const GROUND = 790;

function windows(b: Building) {
  const out: { x: number; y: number }[] = [];
  const gap = (b.w - 40) / b.cols;
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) out.push({ x: b.x + 20 + c * gap + 6, y: b.top + 28 + r * 58 });
  return { list: out, w: gap - 12 };
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
        isFirst ? "top-28 max-w-[40rem] sm:top-36" : isLast ? "bottom-8 max-w-[21rem] md:bottom-12 lg:left-8" : "bottom-6 max-w-[30rem] md:bottom-auto md:top-32"
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
  const bg = useTransform(on, [0, 1], ["rgba(42,36,32,0.18)", "#7a4b2a"]);
  const color = useTransform(on, [0, 1], ["rgba(42,36,32,0.5)", "#2a2420"]);
  return (
    <div className="relative flex items-center gap-3">
      <motion.span className="absolute -left-6 h-4 w-4 rounded-full ring-4 ring-white" style={{ background: bg }} />
      <motion.span className="font-semibold" style={{ color }}>
        {label}
      </motion.span>
    </div>
  );
}

function Bubble({ x, y, w, text, p, at, fill, color }: { x: number; y: number; w: number; text: string; p: MotionValue<number>; at: number; fill: string; color: string }) {
  const scale = useTransform(p, [at, at + 0.04, 0.8, 0.84], [0, 1, 1, 0]);
  return (
    <motion.g style={{ scale, transformBox: "fill-box", originX: 0.5, originY: 1 }}>
      <rect x={x} y={y} width={w} height="56" rx="28" fill={fill} stroke="#7a4b2a" strokeWidth="3" />
      <path d={`M${x + w / 2 - 12} ${y + 54} L${x + w / 2} ${y + 74} L${x + w / 2 + 12} ${y + 54}`} fill={fill} stroke="#7a4b2a" strokeWidth="3" strokeLinejoin="round" />
      <rect x={x + w / 2 - 14} y={y + 50} width="28" height="6" fill={fill} />
      <text x={x + w / 2} y={y + 37} textAnchor="middle" fontFamily="Montserrat Variable, sans-serif" fontWeight="700" fontSize="24" fill={color}>
        {text}
      </text>
    </motion.g>
  );
}

function Sign({ p, at, children }: { p: MotionValue<number>; at: number; children: React.ReactNode }) {
  const scale = useTransform(p, [at, at + 0.04], [0, 1]);
  return <motion.g style={{ scale, transformBox: "fill-box", originX: 0.5, originY: 0.5 }}>{children}</motion.g>;
}

function Scene({ p }: { p: MotionValue<number> }) {
  // Sky
  const sunrise = useTransform(p, [0.08, 0.32], [0, 1]);
  const day = useTransform(p, [0.32, 0.6], [0, 1]);
  const sunY = useTransform(p, [0.1, 0.62], [720, 220]);
  const sunScale = useTransform(p, [0.1, 0.62], [1.25, 1]);
  // Giant word
  const wordY = useTransform(p, [0.8, 0.96], [320, 0]);
  const wordOpacity = useTransform(p, [0.8, 0.86], [0, 1]);
  // Parallax
  const farY = useTransform(p, [0, 1], [0, -18]);
  const midY = useTransform(p, [0, 1], [0, -36]);
  // Buildings
  const outline = useTransform(p, [0.13, 0.3], [0, 1]);
  const outlineShow = useTransform(p, [0.12, 0.14], [0, 1]);
  const fill = useTransform(p, [0.28, 0.34], [0, 1]);
  const lit = useTransform(p, [0.84, 0.92], [0, 1]);
  // Taxi
  const taxiX = useTransform(p, [0.42, 0.55], [-520, 560]);
  const birds = useTransform(p, [0.6, 1], [900, 1050]);
  const birdsOpacity = useTransform(p, [0.55, 0.65], [0, 1]);

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="A street in Ulaanbaatar comes to life: buildings appear, shop, pharmacy and café signs light up, a taxi arrives and people say hello."
    >
      <defs>
        <linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf5ec" />
          <stop offset="0.6" stopColor="#f8eee2" />
          <stop offset="1" stopColor="#f6e2cf" />
        </linearGradient>
        <linearGradient id="g-sunrise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7efe6" />
          <stop offset="0.5" stopColor="#f6dcc6" />
          <stop offset="0.8" stopColor="#f3cfae" />
          <stop offset="1" stopColor="#f5e1bd" />
        </linearGradient>
        <linearGradient id="g-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dcc0" />
          <stop offset="0.6" stopColor="#f8ecdc" />
          <stop offset="1" stopColor="#fbf5ec" />
        </linearGradient>
        <radialGradient id="g-sun">
          <stop offset="0" stopColor="#fff4dc" />
          <stop offset="0.35" stopColor="#f6d58f" />
          <stop offset="0.6" stopColor="#efc06a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e9935a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d6c8b8" />
          <stop offset="1" stopColor="#b09c88" />
        </linearGradient>
        <pattern id="p-checker" width="16" height="8" patternUnits="userSpaceOnUse">
          <rect width="16" height="8" fill="#2a2420" />
          <rect width="8" height="4" fill="#fffdf9" />
          <rect x="8" y="4" width="8" height="4" fill="#fff" />
        </pattern>
      </defs>

      {/* Sky */}
      <rect width="1600" height="1000" fill="url(#g-night)" />
      <motion.rect width="1600" height="1000" fill="url(#g-sunrise)" style={{ opacity: sunrise }} />
      <motion.rect width="1600" height="1000" fill="url(#g-day)" style={{ opacity: day }} />
      <motion.circle cx="1060" r="220" fill="url(#g-sun)" style={{ cy: sunY, scale: sunScale }} />
      <motion.circle cx="1060" r="70" fill="#fff2d6" style={{ cy: sunY }} />

      {/* Birds */}
      <motion.g style={{ x: birds, opacity: birdsOpacity }} fill="none" stroke="#2a2420" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path d="M300 150 q12 -12 24 0 q12 -12 24 0" />
        <path d="M360 180 q9 -9 18 0 q9 -9 18 0" />
        <path d="M250 195 q8 -8 16 0 q8 -8 16 0" />
      </motion.g>

      {/* Mountains around the city */}
      <motion.g style={{ y: farY }}>
        <path d="M0 640 L170 500 L300 580 L460 460 L620 570 L760 490 L930 600 L1100 470 L1260 560 L1420 480 L1600 580 L1600 1000 L0 1000Z" fill="#e2dcd6" />
        <motion.path
          d="M0 640 L170 500 L300 580 L460 460 L620 570 L760 490 L930 600 L1100 470 L1260 560 L1420 480 L1600 580 L1600 1000 L0 1000Z"
          fill="#d8c9b8"
          style={{ opacity: day }}
        />
        <path d="M460 460 L505 500 L480 497 L462 512 L440 494 L420 503Z M1100 470 L1142 508 L1118 505 L1100 520 L1080 501 L1060 508Z M170 500 L205 532 L185 529 L170 542 L152 527Z" fill="#fff" />
      </motion.g>

      {/* Giant word, rising from behind the city */}
      <motion.text
        x="800"
        y="312"
        textAnchor="middle"
        fontFamily="Montserrat Variable, sans-serif"
        fontWeight="800"
        fontSize="200"
        className="hero-word"
        letterSpacing="-4"
        fill="#2a2420"
        style={{ y: wordY, opacity: wordOpacity }}
      >
        МОНГОЛ
      </motion.text>

      {/* Far skyline with Blue Sky Tower */}
      <motion.g style={{ y: midY }}>
        <g fill="#ddd3c8">
          <rect x="0" y="560" width="90" height="240" />
          <rect x="100" y="610" width="80" height="190" />
          <rect x="190" y="520" width="70" height="280" />
          <rect x="270" y="590" width="90" height="210" />
          <rect x="370" y="545" width="70" height="255" />
          <rect x="1160" y="580" width="60" height="220" />
          <rect x="1330" y="600" width="70" height="200" />
          <rect x="1410" y="530" width="90" height="270" />
          <rect x="1510" y="590" width="90" height="210" />
        </g>
        <path d="M1225 800 V470 C1225 420 1262 386 1318 372 V800 Z" fill="url(#g-tower)" />
        <path d="M1240 800 V480 M1260 800 V430 M1280 800 V405 M1300 800 V388" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" />
      </motion.g>

      {/* Sidewalk and road */}
      <rect x="0" y={GROUND} width="1600" height="34" fill="#efe5d8" />
      <rect x="0" y={GROUND + 34} width="1600" height="200" fill="#a59a8e" />
      <path d={`M0 ${GROUND + 110} H1600`} stroke="#ffffff" strokeWidth="6" strokeDasharray="60 50" opacity="0.8" />

      {/* Front buildings: outlines draw, then fill in */}
      {BUILDINGS.map((b, i) => {
        const h = GROUND - b.top;
        const win = windows(b);
        return (
          <g key={i}>
            <motion.path d={rectPath(b.x, b.top, b.w, h)} fill={b.fill} style={{ opacity: fill }} />
            <motion.path
              d={rectPath(b.x, b.top, b.w, h)}
              fill="none"
              stroke="#2a2420"
              strokeWidth="3"
              strokeLinejoin="round"
              style={{ pathLength: outline, opacity: outlineShow }}
            />
            <motion.g style={{ opacity: fill }}>
              <rect x={b.x - 8} y={b.top - 14} width={b.w + 16} height="16" rx="3" fill={i === 1 ? "#276b43" : i === 2 ? "#e9935a" : "#7a4b2a"} />
              {win.list.map((w, j) => (
                <rect key={j} x={w.x} y={w.y} width={win.w} height="36" rx="4" fill="#efe4d6" />
              ))}
            </motion.g>
            <motion.g style={{ opacity: lit }}>
              {win.list.map((w, j) => (j % 2 === 0 ? <rect key={j} x={w.x} y={w.y} width={win.w} height="36" rx="4" fill="#f1cf7a" /> : null))}
            </motion.g>
          </g>
        );
      })}

      {/* Doors and shop windows */}
      <motion.g style={{ opacity: fill }}>
        <rect x="490" y="690" width="56" height="100" rx="4" fill="#d7cfc5" />
        <rect x="565" y="690" width="110" height="70" rx="4" fill="#efe4d6" />
        <rect x="790" y="680" width="60" height="110" rx="4" fill="#d7cfc5" />
        <path d="M955 650 H1135 L1125 680 H965 Z" fill="#e9935a" />
        <path d="M985 650 V680 M1015 650 V680 M1045 650 V680 M1075 650 V680 M1105 650 V680" stroke="#ffffff" strokeWidth="10" />
        <rect x="1020" y="700" width="54" height="90" rx="4" fill="#d7cfc5" />
      </motion.g>

      {/* Signs light up */}
      <Sign p={p} at={0.37}>
        <rect x="485" y="612" width="180" height="48" rx="8" fill="#7a4b2a" />
        <text x="575" y="645" textAnchor="middle" fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="24" fill="#fff">
          ДЭЛГҮҮР
        </text>
      </Sign>
      <Sign p={p} at={0.41}>
        <rect x="728" y="602" width="184" height="50" rx="8" fill="#276b43" />
        <path d="M748 627 H770 M759 616 V638" stroke="#fff" strokeWidth="7" />
        <text x="842" y="635" textAnchor="middle" fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="19" fill="#fff">
          ЭМИЙН САН
        </text>
      </Sign>
      <Sign p={p} at={0.45}>
        <rect x="975" y="592" width="140" height="46" rx="8" fill="#e8b04b" />
        <text x="1045" y="624" textAnchor="middle" fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="24" fill="#2a2420">
          КАФЕ
        </text>
      </Sign>

      {/* Taxi drives in */}
      <g transform={`translate(0 ${GROUND + 2})`}>
        <motion.g style={{ x: taxiX }}>
          <path d="M45 40 L72 8 H160 L192 40 Z" fill="#e8b04b" />
          <path d="M60 38 L80 14 H112 V38 Z M120 38 V14 H154 L176 38 Z" fill="#f3e9dc" />
          <rect x="0" y="38" width="236" height="52" rx="16" fill="#e8b04b" />
          <rect x="0" y="60" width="236" height="8" fill="url(#p-checker)" />
          <rect x="86" y="-14" width="66" height="22" rx="5" fill="#2a2420" />
          <text x="119" y="2" textAnchor="middle" fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="12" fill="#e8b04b">
            ТАКСИ
          </text>
          <circle cx="56" cy="90" r="20" fill="#2a2420" />
          <circle cx="56" cy="90" r="8" fill="#d7cfc5" />
          <circle cx="180" cy="90" r="20" fill="#2a2420" />
          <circle cx="180" cy="90" r="8" fill="#d7cfc5" />
        </motion.g>
      </g>

      {/* People talk */}
      <Bubble p={p} at={0.6} x={560} y={366} w={140} text="Хэд вэ?" fill="#fffdf9" color="#2a2420" />
      <Bubble p={p} at={0.64} x={705} y={286} w={250} text="Сайн байна уу?" fill="#7a4b2a" color="#fffdf9" />
      <Bubble p={p} at={0.68} x={955} y={390} w={190} text="Баярлалаа!" fill="#fffdf9" color="#2a2420" />
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
    <section ref={ref} className="relative h-[380vh] bg-paper" aria-label="The Mongolingo story">
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
