"use client";

import { Check, Lightbulb, X } from "lucide-react";
import { useEffect, useRef } from "react";

type State = "idle" | "right" | "wrong" | "dim";

/** Answer button. Right/wrong is shown with color AND an icon AND words,
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
    idle: "border-line bg-white hover:border-cobalt hover:bg-sky-soft",
    right: "border-ok bg-ok-soft",
    wrong: "border-bad bg-bad-soft",
    dim: "border-line bg-white opacity-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle"}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left font-semibold transition disabled:cursor-default ${
        big ? "font-display text-4xl" : "text-xl"
      } ${styles[state]}`}
    >
      <span>{label}</span>
      {state === "right" && (
        <span className="flex shrink-0 items-center gap-1 font-sans text-base font-bold text-ok">
          <Check size={20} strokeWidth={3} aria-hidden /> Correct
        </span>
      )}
      {state === "wrong" && (
        <span className="flex shrink-0 items-center gap-1 font-sans text-base font-bold text-bad">
          <X size={20} strokeWidth={3} aria-hidden /> Not this one
        </span>
      )}
    </button>
  );
}

export function Feedback({
  ok,
  text,
  onNext,
  nextLabel = "Continue",
}: {
  ok: boolean;
  text: string;
  onNext: () => void;
  nextLabel?: string;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    btn.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return (
    <div
      role="status"
      className={`pop mt-5 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between ${
        ok ? "bg-ok-soft" : "bg-beige"
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-ok" : "bg-ink"}`}
          aria-hidden
        >
          {ok ? <Check size={22} strokeWidth={3} /> : <Lightbulb size={20} strokeWidth={2.5} />}
        </span>
        <p className="text-lg font-medium">{text}</p>
      </div>
      <button ref={btn} type="button" className="btn btn-primary shrink-0" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}

const SPARK_COLORS = ["#8f5b34", "#b08a66", "#8d9b6a", "#dab692", "#5e6b42"];

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const dist = 160 + (i % 4) * 60;
        return (
          <span
            key={i}
            className="spark"
            style={
              {
                background: SPARK_COLORS[i % SPARK_COLORS.length],
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
                animationDelay: `${(i % 5) * 0.04}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
