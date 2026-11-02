"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toCyrillic } from "@/lib/toCyrillic";

export function NameInCyrillic() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const out = toCyrillic(name);

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-line" aria-labelledby="name-cyr">
      <h2 id="name-cyr" className="text-2xl font-bold">
        Your name in Mongolian
      </h2>
      <label htmlFor="name-input" className="mt-4 block font-semibold">
        Type your name
      </label>
      <input
        id="name-input"
        className="input mt-2"
        value={name}
        maxLength={40}
        placeholder="e.g. Sarah"
        autoComplete="given-name"
        onChange={(e) => {
          setName(e.target.value);
          setCopied(false);
        }}
      />
      <div className="mt-4 flex min-h-20 flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-soft p-4" aria-live="polite">
        <span lang="mn" className="font-display text-4xl font-bold">
          {out || "…"}
        </span>
        {out && (
          <button
            type="button"
            className="btn btn-line min-h-11 px-4 text-base text-ink"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(out);
                setCopied(true);
              } catch {}
            }}
          >
            {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />} {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <p className="mt-3 text-sm text-ink-soft">Spelled by sound. A Mongolian friend may write it a little differently.</p>
    </section>
  );
}
