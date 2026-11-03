import { LESSONS } from "@/lib/lessons";

// Real alphabet order.
const ORDER = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".split("");

const GROUPS: Record<string, { label: string; cls: string; dot: string }> = {
  friends: { label: "You know these", cls: "bg-gold text-night", dot: "bg-gold" },
  tricksters: { label: "Tricky twins", cls: "bg-coral text-night", dot: "bg-coral" },
  specials: { label: "Mongolian specials", cls: "bg-wood-dark text-white", dot: "bg-wood-dark" },
};

export function AlphabetLegend({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-col gap-2 text-base font-semibold ${className}`}>
      {Object.entries(GROUPS).map(([k, g]) => (
        <li key={k} className="flex items-center gap-3">
          <span className={`h-4 w-4 rounded-md ${g.dot}`} aria-hidden />
          {g.label}
        </li>
      ))}
      <li className="flex items-center gap-3">
        <span className="h-4 w-4 rounded-md border-2 border-line bg-white" aria-hidden />
        New shapes
      </li>
    </ul>
  );
}

export function AlphabetGrid({ compact = false }: { compact?: boolean }) {
  const info = new Map<string, { group: string; say: string }>();
  for (const l of LESSONS) for (const it of l.items) if (l.kind === "letters") info.set(it.show, { group: l.id, say: it.say });

  return (
    <ul className={`grid grid-cols-5 sm:grid-cols-7 ${compact ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3"}`}>
      {ORDER.map((ch) => {
        const i = info.get(ch);
        const g = i ? GROUPS[i.group] : undefined;
        const isUnique = ch === "Ө" || ch === "Ү";
        return (
          <li
            key={ch}
            className={`flex aspect-square flex-col items-center justify-center ${compact ? "rounded-xl" : "rounded-2xl"} ${
              g ? g.cls : "border border-line bg-white text-ink"
            } ${isUnique ? "ring-4 ring-wood/40" : ""}`}
          >
            <span className={`font-display font-bold ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"}`}>{ch}</span>
            <span className={`font-semibold ${compact ? "text-xs sm:text-sm" : "mt-0.5 text-sm sm:text-base"}`}>{i?.say}</span>
            <span className="sr-only">{g ? `, ${g.label}` : ""}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function AlphabetBoard() {
  return (
    <section className="px-4 py-24" aria-labelledby="alphabet">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 id="alphabet" className="max-w-2xl text-4xl font-bold sm:text-5xl">
            The whole alphabet.
          </h2>
          <AlphabetLegend />
        </div>
        <div className="mt-12">
          <AlphabetGrid />
        </div>
      </div>
    </section>
  );
}
