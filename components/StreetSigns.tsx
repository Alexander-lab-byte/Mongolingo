// Real-looking Ulaanbaatar street signs, drawn in CSS so they load instantly.

function Sign({ children, en, note, compact }: { children: React.ReactNode; en: string; note: string; compact?: boolean }) {
  return (
    <figure className="flex flex-col">
      <div className={`flex items-center justify-center overflow-hidden bg-white/70 ${compact ? "h-28 rounded-2xl p-2 sm:h-32" : "min-h-48 rounded-3xl p-6"}`}>
        <div className={compact ? "origin-center scale-[0.62] sm:scale-[0.7]" : ""}>{children}</div>
      </div>
      <figcaption className={compact ? "mt-2" : "mt-4"}>
        <span className={`block font-display font-bold ${compact ? "text-lg" : "text-xl"}`}>{en}</span>
        <span className={`text-ink-soft ${compact ? "text-sm" : ""}`}>{note}</span>
      </figcaption>
    </figure>
  );
}

export function StreetSigns() {
  return (
    <section className="bg-gradient-to-b from-paper via-beige to-paper px-4 py-24" aria-labelledby="signs">
      <div className="mx-auto max-w-6xl">
        <h2 id="signs" className="max-w-2xl text-4xl font-bold sm:text-5xl">
          Read the signs around you.
        </h2>
        <div className="mt-12">
          <SignGrid />
        </div>
      </div>
    </section>
  );
}

export function SignGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3" : "grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"}>
      <Sign compact={compact} en="Pharmacy" note="emiin san">
        <div className="flex items-center gap-4 rounded-xl bg-[#5e6b42] px-5 py-4 text-white shadow-lg">
          <span className="relative block h-12 w-12" aria-hidden>
            <span className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 rounded-sm bg-white" />
            <span className="absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 rounded-sm bg-white" />
          </span>
          <span className="font-display text-3xl font-extrabold">ЭМИЙН САН</span>
        </div>
      </Sign>

      <Sign compact={compact} en="Shop" note="delgüür">
        <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
          <div className="bg-wood-dark px-4 py-3 text-center font-display text-3xl font-extrabold text-white">ДЭЛГҮҮР</div>
          <div className="h-5" style={{ background: "repeating-linear-gradient(90deg,#8d9b6a 0 22px,#fbf8f8 22px 44px)" }} />
        </div>
      </Sign>

      <Sign compact={compact} en="Exit" note="garts">
        <div className="flex items-center gap-3 rounded-lg bg-[#5e6b42] px-5 py-3 text-white shadow-lg">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="13" cy="4" r="2" fill="#fff" />
            <path d="M7 21l3-6 3 2v4M10 15l1-5 4 3 3 1M6 11l3-2 2 1" />
          </svg>
          <span className="font-display text-4xl font-extrabold">ГАРЦ</span>
          <span className="text-4xl font-bold" aria-hidden>
            ›
          </span>
        </div>
      </Sign>

      <Sign compact={compact} en="Hospital" note="emneleg">
        <div className="flex items-center gap-4 rounded-xl border-4 border-coral bg-white px-5 py-3 shadow-lg">
          <span className="relative block h-10 w-10" aria-hidden>
            <span className="absolute left-1/2 top-0 h-full w-3.5 -translate-x-1/2 bg-coral" />
            <span className="absolute left-0 top-1/2 h-3.5 w-full -translate-y-1/2 bg-coral" />
          </span>
          <span className="font-display text-3xl font-extrabold text-coral-ink">ЭМНЭЛЭГ</span>
        </div>
      </Sign>

      <Sign compact={compact} en="Bus stop" note="avtobusny buudal">
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-28 w-28 place-items-center rounded-full border-[6px] border-white bg-cobalt shadow-lg">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <rect x="4" y="3" width="16" height="15" rx="3" />
              <path d="M4 11h16M8 21v-3M16 21v-3" />
              <circle cx="8" cy="14.5" r="1" fill="#fff" />
              <circle cx="16" cy="14.5" r="1" fill="#fff" />
            </svg>
          </div>
          <span className="rounded-md bg-night px-3 py-1 font-display text-lg font-bold text-white">АВТОБУС</span>
        </div>
      </Sign>

      <Sign compact={compact} en="Taxi" note="taksi">
        <div className="inline-flex flex-col items-center">
          <div className="rounded-t-2xl bg-honey px-7 pb-2 pt-3">
            <span className="font-display text-4xl font-extrabold text-night">ТАКСИ</span>
          </div>
          <div className="h-4 w-full rounded-b-md" style={{ background: "repeating-linear-gradient(90deg,#3a2a1f 0 14px,#fbf8f8 14px 28px)" }} />
        </div>
      </Sign>
    </div>
  );
}
