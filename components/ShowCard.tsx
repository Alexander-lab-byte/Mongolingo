"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { transliterate } from "@/lib/translit";
import type { Phrase } from "@/lib/phrases";

/** Full-screen card to hand your phone to a driver, shopkeeper or doctor. */
export function ShowCard({ phrase, onClose }: { phrase: Phrase; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Show this to someone"
      className="pop fixed inset-0 z-[100] flex flex-col bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-semibold text-ink-soft">Show this screen</p>
        <button ref={closeBtn} type="button" className="btn btn-line text-ink" onClick={onClose}>
          <X size={20} aria-hidden /> Close
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <p lang="mn" className="font-display text-[clamp(2.4rem,9vw,6.5rem)] font-bold leading-tight text-ink">
          {phrase.mn}
        </p>
        <div>
          <p className="text-2xl text-ink-soft">“{transliterate(phrase.mn)}”</p>
          <p className="mt-2 text-xl text-ink-soft">{phrase.en}</p>
        </div>
      </div>
    </div>
  );
}
