"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Phrase } from "@/lib/phrases";

// Saved phrases live in this browser, so they work without an account.
const KEY = "mongolingo_saved_phrases";
const EVENT = "mongolingo-saved-change";
const EMPTY: Phrase[] = [];
let cache: { raw: string | null; list: Phrase[] } = { raw: null, list: EMPTY };

function read(): Phrase[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.list;
    cache = { raw, list: raw ? (JSON.parse(raw) as Phrase[]) : EMPTY };
    return cache.list;
  } catch {
    return EMPTY;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((p: Phrase) => {
    const list = read();
    const exists = list.some((x) => x.mn === p.mn);
    const next = exists ? list.filter((x) => x.mn !== p.mn) : [p, ...list].slice(0, 100);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isSaved = useCallback((mn: string) => saved.some((x) => x.mn === mn), [saved]);

  return { saved, toggle, isSaved };
}
