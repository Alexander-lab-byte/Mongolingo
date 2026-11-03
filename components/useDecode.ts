"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const CYR = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ";
const CYR_LOW = CYR.toLowerCase();

export function useReduced() {
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
export function useDecode(target: string, run: boolean) {
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
