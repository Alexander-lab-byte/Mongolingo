"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Bookmark, BookmarkCheck, Copy, Check, Maximize2, Loader2 } from "lucide-react";
import { useState } from "react";
import { hasCyrillic, transliterate } from "@/lib/translit";
import { SITUATIONS, type Phrase } from "@/lib/phrases";
import { ShowCard } from "./ShowCard";
import { useSaved } from "./useSaved";

type Result = { from: "en" | "mn"; source: string; text: string; checked: boolean };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
const ALL = SITUATIONS.flatMap((s) => s.phrases);

function findChecked(text: string, from: "en" | "mn"): string | null {
  const n = norm(text);
  for (const p of ALL) {
    if (from === "en" && p.en.split(" / ").some((part) => norm(part) === n)) return p.mn;
    if (from === "mn" && norm(p.mn) === n) return p.en;
  }
  return null;
}

const COUNT_KEY = "mongolingo_translate_count";

export function Translator({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [show, setShow] = useState<Phrase | null>(null);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);
  const { toggle, isSaved } = useSaved();

  const from: "en" | "mn" = hasCyrillic(input) ? "mn" : "en";

  async function translate(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return setError("Type a word or a sentence first.");
    setError("");
    setCopied(false);

    const checked = findChecked(text, from);
    let next: Result | null = null;
    if (checked) {
      next = { from, source: text, text: checked, checked: true };
    } else {
      setBusy(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from }),
        });
        const data = await res.json();
        if (!res.ok) setError(data.error ?? "Something went wrong. Try again.");
        else next = { from, source: text, text: data.text, checked: false };
      } catch {
        setError("Can't reach the translator. Check your internet and try again.");
      }
      setBusy(false);
    }
    if (next) {
      setResult(next);
      try {
        const c = Number(localStorage.getItem(COUNT_KEY) ?? 0) + 1;
        localStorage.setItem(COUNT_KEY, String(c));
        setCount(c);
      } catch {}
    }
  }

  const mnText = result ? (result.from === "en" ? result.text : result.source) : "";
  const enText = result ? (result.from === "en" ? result.source : result.text) : "";
  const phrase: Phrase = { en: enText, mn: mnText };

  return (
    <div className={compact ? "" : "panel p-5 sm:p-8"}>
      <form onSubmit={translate}>
        <label htmlFor={compact ? "tr-compact" : "tr-main"} className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-lg font-semibold">Type English or Mongolian</span>
          <span className="flex items-center gap-2 text-ink-soft" aria-live="polite">
            {from === "en" ? "English" : "Mongolian"} <ArrowRight size={16} aria-hidden /> {from === "en" ? "Mongolian" : "English"}
          </span>
        </label>
        <textarea
          id={compact ? "tr-compact" : "tr-main"}
          className="input mt-2 min-h-28 resize-y py-3"
          value={input}
          maxLength={450}
          placeholder="e.g. Where is the bus stop?"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              translate();
            }
          }}
        />
        {from === "mn" && input.trim() && (
          <p className="mt-2 text-lg">
            <span className="text-ink-soft">Say it: </span>
            <span className="font-semibold">“{transliterate(input.trim())}”</span>
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
            {busy ? "Translating…" : "Translate"}
          </button>
          {input && (
            <button
              type="button"
              className="btn px-4 text-ink-soft hover:text-ink"
              onClick={() => {
                setInput("");
                setResult(null);
                setError("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-bad-soft p-4 font-medium">
          {error}
        </p>
      )}

      {result && !error && (
        <div className="pop mt-6 rounded-3xl bg-sky-soft p-5 sm:p-7" role="status">
          {result.from === "en" ? (
            <>
              <p lang="mn" className="font-display text-3xl font-bold leading-snug sm:text-4xl">
                {result.text}
              </p>
              <p className="mt-2 text-xl">
                <span className="text-ink-soft">Say it: </span>“{transliterate(result.text)}”
              </p>
            </>
          ) : (
            <p className="text-2xl font-semibold sm:text-3xl">{result.text}</p>
          )}
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
            {result.checked ? (
              <>
                <BadgeCheck size={18} className="text-ok" aria-hidden /> Checked phrase
              </>
            ) : (
              "Machine translation. Short, simple sentences work best."
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => setShow(phrase)}>
              <Maximize2 size={18} aria-hidden /> Show to someone
            </button>
            <button
              type="button"
              className="btn btn-line text-ink"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(mnText);
                  setCopied(true);
                } catch {}
              }}
            >
              {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />} {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" className="btn btn-line text-ink" onClick={() => toggle(phrase)} aria-pressed={isSaved(mnText)}>
              {isSaved(mnText) ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
              {isSaved(mnText) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* After a few translations, invite them to learn it (curiosity + commitment, never blocking). */}
      {count >= 3 && result && (
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg">
          <span>Want to read signs without your phone?</span>
          <Link href="/#try" className="font-semibold text-cobalt underline underline-offset-4">
            Try a 2-minute lesson
          </Link>
        </p>
      )}

      {show && <ShowCard phrase={show} onClose={() => setShow(null)} />}
    </div>
  );
}
