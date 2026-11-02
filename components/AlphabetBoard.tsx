import { LESSONS } from "@/lib/lessons";

// Real alphabet order.
const ORDER = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".split("");

const GROUPS: Record<string, { label: string; cls: string; dot: string }> = {
  friends: { label: "Looks and sounds like English", cls: "bg-gold text-night", dot: "bg-gold" },
  tricksters: { label: "Looks English, sounds different", cls: "bg-coral text-night", dot: "bg-coral" },
  specials: { label: "Special letters, like Ө and Ү", cls: "bg-cobalt text-white", dot: "bg-cobalt" },
};

export function AlphabetBoard() {
  const info = new Map<string, { group: string; say: string }>();
  for (const l of LESSONS) for (const it of l.items) if (l.kind === "letters") info.set(it.show, { group: l.id, say: it.say });

  return (
    <section className="px-4 py-24" aria-labelledby="alphabet">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 id="alphabet" className="max-w-2xl text-4xl font-bold sm:text-5xl">
              35 letters. Less scary than it looks.
            </h2>
            <p className="mt-4 max-w-xl text-xl text-ink-soft">
              Five you already know. Seven look English but sound different. Two, Ө and Ү, aren&apos;t even in the Russian alphabet.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-base font-semibold">
            {Object.entries(GROUPS).map(([k, g]) => (
              <li key={k} className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-md ${g.dot}`} aria-hidden />
                {g.label}
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-md border-2 border-line bg-white" aria-hidden />
              New shapes with picture tricks
            </li>
          </ul>
        </div>

        <ul className="mt-12 grid grid-cols-5 gap-2 sm:grid-cols-7 sm:gap-3">
          {ORDER.map((ch) => {
            const i = info.get(ch);
            const g = i ? GROUPS[i.group] : undefined;
            const isUnique = ch === "Ө" || ch === "Ү";
            return (
              <li
                key={ch}
                className={`flex aspect-square flex-col items-center justify-center rounded-2xl ${
                  g ? g.cls : "border border-line bg-white text-ink"
                } ${isUnique ? "ring-4 ring-cobalt/30" : ""}`}
              >
                <span className="font-display text-3xl font-bold sm:text-4xl">{ch}</span>
                <span className="mt-0.5 text-sm font-semibold sm:text-base">{i?.say}</span>
                <span className="sr-only">{g ? `, ${g.label}` : ""}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
