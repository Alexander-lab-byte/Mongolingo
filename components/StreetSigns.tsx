// Real-looking Ulaanbaatar street signs, drawn in CSS so they load instantly.

function Sign({ children, en, note }: { children: React.ReactNode; en: string; note: string }) {
  return (
    <figure className="flex flex-col">
      <div className="flex min-h-48 items-center justify-center rounded-3xl bg-paper p-6">{children}</div>
      <figcaption className="mt-4">
        <span className="block font-display text-xl font-bold">{en}</span>
        <span className="text-ink-soft">{note}</span>
      </figcaption>
    </figure>
  );
}

export function StreetSigns() {
  return (
    <section className="bg-white px-4 py-24" aria-labelledby="signs">
      <div className="mx-auto max-w-6xl">
        <h2 id="signs" className="max-w-2xl text-4xl font-bold sm:text-5xl">
          Read the signs around you.
        </h2>

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <Sign en="Pharmacy" note="emiin san">
            <div className="flex items-center gap-4 rounded-xl bg-[#276b43] px-5 py-4 text-white shadow-lg">
              <span className="relative block h-12 w-12" aria-hidden>
                <span className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 rounded-sm bg-white" />
                <span className="absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 rounded-sm bg-white" />
              </span>
              <span className="font-display text-3xl font-extrabold">ЭМИЙН САН</span>
            </div>
          </Sign>

          <Sign en="Shop" note="delgüür">
            <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
              <div className="bg-cobalt px-4 py-3 text-center font-display text-3xl font-extrabold text-white">ДЭЛГҮҮР</div>
              <div className="h-5" style={{ background: "repeating-linear-gradient(90deg,#e9935a 0 22px,#fffdf9 22px 44px)" }} />
            </div>
          </Sign>

          <Sign en="Exit" note="garts">
            <div className="flex items-center gap-3 rounded-lg bg-[#276b43] px-5 py-3 text-white shadow-lg">
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

          <Sign en="Hospital" note="emneleg">
            <div className="flex items-center gap-4 rounded-xl border-4 border-coral bg-white px-5 py-3 shadow-lg">
              <span className="relative block h-10 w-10" aria-hidden>
                <span className="absolute left-1/2 top-0 h-full w-3.5 -translate-x-1/2 bg-coral" />
                <span className="absolute left-0 top-1/2 h-3.5 w-full -translate-y-1/2 bg-coral" />
              </span>
              <span className="font-display text-3xl font-extrabold text-coral-ink">ЭМНЭЛЭГ</span>
            </div>
          </Sign>

          <Sign en="Bus stop" note="avtobusny buudal">
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

          <Sign en="Taxi" note="taksi">
            <div className="inline-flex flex-col items-center">
              <div className="rounded-t-2xl bg-gold px-7 pb-2 pt-3">
                <span className="font-display text-4xl font-extrabold text-night">ТАКСИ</span>
              </div>
              <div className="h-4 w-full rounded-b-md" style={{ background: "repeating-linear-gradient(90deg,#2a2420 0 14px,#fffdf9 14px 28px)" }} />
            </div>
          </Sign>
        </div>
      </div>
    </section>
  );
}
