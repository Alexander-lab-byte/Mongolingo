"use client";

import { useEffect, useRef } from "react";

type State = "idle" | "right" | "wrong" | "dim";

/** Big answer button. Right/wrong is shown with color AND an icon AND words,
 *  so it also works for color-blind people (about 1 in 12 men). */
export function OptionButton({
  label,
  state,
  onClick,
  big,
}: {
  label: string;
  state: State;
  onClick: () => void;
  big?: boolean;
}) {
  const styles: Record<State, string> = {
    idle: "border-ink bg-white hover:bg-sun-soft hover:-translate-y-0.5",
    right: "border-ok bg-ok-soft",
    wrong: "border-bad bg-bad-soft",
    dim: "border-line bg-white opacity-60",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle"}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-3 px-5 py-3 text-left font-extrabold transition disabled:cursor-default ${
        big ? "cyr text-4xl" : "text-xl"
      } ${styles[state]}`}
    >
      <span>{label}</span>
      {state === "right" && <span className="text-base text-ok">✓ Correct</span>}
      {state === "wrong" && <span className="text-base text-bad">✗ Not this one</span>}
    </button>
  );
}

export function Feedback({
  ok,
  text,
  onNext,
  nextLabel = "Continue →",
}: {
  ok: boolean;
  text: string;
  onNext: () => void;
  nextLabel?: string;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
  }, []);
  return (
    <div
      role="status"
      className={`pop mt-5 flex flex-col gap-3 rounded-2xl border-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
        ok ? "border-ok bg-ok-soft" : "border-bad bg-bad-soft"
      }`}
    >
      <p className="text-lg font-bold">
        <span className="mr-2 text-2xl" aria-hidden>
          {ok ? "✅" : "💡"}
        </span>
        {text}
      </p>
      <button ref={btn} type="button" className="btn btn-primary shrink-0" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}

export function Confetti() {
  const bits = ["🎉", "⭐", "🎊", "✨", "🟡", "🔵", "🔴"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="confetti text-2xl"
          style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }}
        >
          {bits[i % bits.length]}
        </span>
      ))}
    </div>
  );
}
