"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bus, RotateCcw, Trophy } from "lucide-react";
import { LearnHeader } from "@/components/LearnHeader";
import { useReduced } from "@/components/useDecode";
import { getLesson } from "@/lib/lessons";
import { transliterate } from "@/lib/translit";

/*
  Sign rush: reading at street speed. You ride a bus; real signs slide past the window.
  Tap the sign that matches the English word before it is gone. Speed goes up as you score.
  Trains fast, automatic reading of Cyrillic (the skill you need on a moving bus), not just recognition in a quiz.
*/

const SOURCES = ["signs", "city-p1", "city-p2", "city-p4", "city-p5", "travel-p1", "drinks-p1", "winter-p1"];
const SIGNS = SOURCES.flatMap((id) => getLesson(id)?.items ?? []).map((it) => ({ mn: it.show.toUpperCase(), en: (it.meaning ?? "").replace(/\s*\(.*\)/, "") }));
const SECONDS = 60;
const BEST_KEY = "yarii_rush_best";

type Board = { key: number; mn: string; en: string; lane: number; dur: number };

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function RushPage() {
  const reduced = useReduced();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [target, setTarget] = useState(SIGNS[0]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const key = useRef(0);
  const sinceTarget = useRef(0);
  const lastLane = useRef(0);
  const scoreRef = useRef(0);
  const targetRef = useRef(target);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {}
  }, []);

  const newTarget = useCallback(() => {
    let t = pick(SIGNS);
    while (t.mn === targetRef.current.mn) t = pick(SIGNS);
    targetRef.current = t;
    setTarget(t);
    sinceTarget.current = 3; // make sure it shows up soon
  }, []);

  // spawn signs
  useEffect(() => {
    if (phase !== "play" || reduced) return;
    const speed = Math.max(3.2, 7 - scoreRef.current * 0.25);
    const id = setInterval(() => {
      sinceTarget.current += 1;
      const isTarget = sinceTarget.current >= 3 || Math.random() < 0.3;
      if (isTarget) sinceTarget.current = 0;
      const s = isTarget ? targetRef.current : pick(SIGNS.filter((x) => x.mn !== targetRef.current.mn));
      // Never the same lane twice in a row, one speed per ride level: signs never overlap or overtake.
      lastLane.current = (lastLane.current + 1 + Math.floor(Math.random() * 2)) % 3;
      setBoards((b) => [...b.slice(-9), { key: key.current++, ...s, lane: lastLane.current, dur: speed }]);
    }, 900);
    return () => clearInterval(id);
  }, [phase, reduced, score]);

  // clock
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && left <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("over");
      setBoards([]);
      if (scoreRef.current > best) {
        setBest(scoreRef.current);
        try {
          localStorage.setItem(BEST_KEY, String(scoreRef.current));
        } catch {}
      }
    }
  }, [left, phase, best]);

  function start() {
    scoreRef.current = 0;
    setScore(0);
    setLeft(SECONDS);
    setBoards([]);
    setFlash(null);
    newTarget();
    setPhase("play");
  }

  function tap(b: { mn: string; en: string; key?: number }) {
    if (phase !== "play") return;
    if (b.mn === targetRef.current.mn) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFlash({ ok: true, text: `${b.mn} = “${transliterate(b.mn).toLowerCase()}” = ${b.en}` });
      setBoards((all) => all.filter((x) => x.key !== b.key));
      newTarget();
    } else {
      setLeft((s) => Math.max(0, s - 3));
      setFlash({ ok: false, text: `${b.mn} means “${b.en}”. −3 seconds` });
    }
  }

  // Still version for reduced motion: a grid of six signs, same rules.
  const grid = useStaticGrid(target, phase === "play" && reduced, score);

  return (
    <div className="min-h-screen bg-paper">
      <LearnHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold sm:text-5xl">
          <Bus size={40} aria-hidden /> Sign rush
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">
          You are on a bus. Real signs fly past the window. Tap the one you are told to find before it is gone. Read fast, like on a real street.
        </p>

        {phase !== "play" && (
          <div className="panel mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {phase === "over" ? (
                <>
                  <p className="text-2xl font-bold">Time! You read {score} signs.</p>
                  <p className="text-ink-soft">{score >= best && score > 0 ? "New best score!" : `Best: ${best}`}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold">60 seconds. {SIGNS.length} real signs.</p>
                  <p className="flex items-center gap-2 text-ink-soft">
                    <Trophy size={18} aria-hidden /> Best: {best}
                  </p>
                </>
              )}
            </div>
            <button type="button" className="btn btn-primary text-lg" onClick={start}>
              {phase === "over" ? (
                <>
                  <RotateCcw size={20} aria-hidden /> Ride again
                </>
              ) : (
                "Start the ride"
              )}
            </button>
          </div>
        )}

        {phase === "play" && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-line" aria-live="polite">
              <p className="text-xl">
                Find: <span className="font-display text-2xl font-bold uppercase">{target.en}</span>
              </p>
              <p className="font-semibold tabular-nums">
                ⏱ {left}s · ⭐ {score}
              </p>
            </div>

            {!reduced ? (
              <div
                className="relative mt-4 h-[22rem] overflow-hidden rounded-[28px] ring-8 ring-night/80"
                style={{ background: "linear-gradient(180deg,#e9d5c8 0%,#dcc0b6 45%,#8a9ea7 46%,#6f7f93 100%)" }}
              >
                {boards.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => tap(b)}
                    onAnimationEnd={() => setBoards((all) => all.filter((x) => x.key !== b.key))}
                    className="rush-board absolute left-full whitespace-nowrap rounded-xl border-4 border-night bg-[#fbf8f8] px-4 py-2 font-display text-2xl font-bold text-night shadow-lg"
                    style={{ top: `${8 + b.lane * 30}%`, animationDuration: `${b.dur}s` }}
                  >
                    {b.mn}
                  </button>
                ))}
                <span className="pointer-events-none absolute bottom-3 left-4 text-4xl" aria-hidden>
                  🚌
                </span>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {grid.map((s) => (
                  <button key={s.mn} type="button" onClick={() => tap(s)} className="min-h-20 rounded-xl border-4 border-night bg-white px-3 font-display text-xl font-bold">
                    {s.mn}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {flash && (
          <p role="status" className={`mt-4 rounded-2xl p-4 text-lg font-semibold ${flash.ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}>
            {flash.text}
          </p>
        )}
      </main>
    </div>
  );
}

function useStaticGrid(target: { mn: string; en: string }, on: boolean, score: number) {
  const [grid, setGrid] = useState<{ mn: string; en: string }[]>([]);
  useEffect(() => {
    if (!on) return;
    const others = SIGNS.filter((s) => s.mn !== target.mn).sort(() => Math.random() - 0.5).slice(0, 5);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid([...others, target].sort(() => Math.random() - 0.5));
  }, [on, target, score]);
  return grid;
}
