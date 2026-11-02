"use client";

import { AlertTriangle, Bookmark, BookmarkCheck, Car, Coffee, MessageCircle, Phone, ShoppingBag, Stethoscope, Maximize2 } from "lucide-react";
import { useState } from "react";
import { SITUATIONS, EMERGENCY_NUMBERS, type Phrase } from "@/lib/phrases";
import { transliterate } from "@/lib/translit";
import { ShowCard } from "./ShowCard";
import { useSaved } from "./useSaved";

const ICONS = { car: Car, shop: ShoppingBag, cafe: Coffee, doctor: Stethoscope, alert: AlertTriangle, chat: MessageCircle };

export function Phrasebook() {
  const [tab, setTab] = useState<string>("basics");
  const [show, setShow] = useState<Phrase | null>(null);
  const { saved, toggle, isSaved } = useSaved();

  const tabs = [...SITUATIONS.map((s) => ({ id: s.id, label: s.label, Icon: ICONS[s.icon] })), { id: "saved", label: `Saved (${saved.length})`, Icon: Bookmark }];
  const list: Phrase[] = tab === "saved" ? saved : SITUATIONS.find((s) => s.id === tab)!.phrases;

  return (
    <div>
      <div role="tablist" aria-label="Situations" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 font-semibold transition ${
              tab === id ? "bg-cobalt text-white" : "bg-white text-ink ring-1 ring-line hover:bg-sky-soft"
            }`}
          >
            <Icon size={18} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {tab === "emergency" && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EMERGENCY_NUMBERS.map((e) => (
            <a key={e.n} href={`tel:${e.n}`} className="flex items-center gap-3 rounded-2xl bg-bad-soft p-4 ring-1 ring-bad/30 hover:ring-bad">
              <Phone size={22} className="text-bad" aria-hidden />
              <span>
                <span className="block font-display text-2xl font-bold">{e.n}</span>
                <span className="text-ink-soft">{e.en}</span>
              </span>
            </a>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-paper p-6 text-lg text-ink-soft">
          No saved phrases yet. Tap the bookmark on any phrase to keep it here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
          {list.map((p) => {
            const on = isSaved(p.mn);
            return (
              <li key={p.mn} className="flex items-center gap-3 p-4 sm:p-5">
                <button
                  type="button"
                  className="flex-1 rounded-xl text-left"
                  onClick={() => setShow(p)}
                >
                  <span className="block text-ink-soft">{p.en}</span>
                  <span lang="mn" className="mt-0.5 block font-display text-xl font-bold sm:text-2xl">
                    {p.mn}
                  </span>
                  <span className="block text-ink-soft">“{transliterate(p.mn)}”</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShow(p)}
                  className="hidden h-12 w-12 shrink-0 place-items-center rounded-full text-cobalt ring-1 ring-line hover:bg-sky-soft sm:grid"
                  aria-label={`Show “${p.en}” full screen`}
                >
                  <Maximize2 size={20} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  aria-pressed={on}
                  aria-label={on ? `Remove “${p.en}” from saved` : `Save “${p.en}”`}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ring-1 ring-line hover:bg-sky-soft ${on ? "text-cobalt" : "text-ink-soft"}`}
                >
                  {on ? <BookmarkCheck size={20} aria-hidden /> : <Bookmark size={20} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {show && <ShowCard phrase={show} onClose={() => setShow(null)} />}
    </div>
  );
}
