"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Play } from "lucide-react";
import { LearnHeader } from "@/components/LearnHeader";
import { Loading } from "@/components/Loading";
import { useLearner } from "@/components/useLearner";
import { PACKS, PACK_GROUPS, PACK_LESSONS } from "@/lib/packs";

export default function PacksPage() {
  const { progress, ready } = useLearner();
  const [group, setGroup] = useState<string>("All");
  if (!ready || !progress) return <Loading />;

  const done = PACK_LESSONS.filter((l) => progress.completed.includes(l.id)).length;
  const shown = PACKS.filter((p) => group === "All" || p.group === group);

  return (
    <div className="min-h-screen bg-paper">
      <LearnHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-5xl">100 more lessons</h1>
        <p className="mt-2 text-lg text-ink-soft">
          20 topics, 5 short lessons each. {done} of {PACK_LESSONS.length} done. Every word you finish joins your{" "}
          <Link href="/learn/herd" className="font-semibold text-cobalt underline">
            word herd
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter topics">
          {["All", ...PACK_GROUPS].map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
              className={`min-h-11 rounded-full px-4 font-semibold ${group === g ? "bg-cobalt text-white" : "bg-white text-ink ring-1 ring-line hover:bg-sky-soft"}`}
            >
              {g}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {shown.map((p) => {
            const lessons = PACK_LESSONS.filter((l) => l.id.startsWith(`${p.id}-p`));
            const n = lessons.filter((l) => progress.completed.includes(l.id)).length;
            const next = lessons.find((l) => !progress.completed.includes(l.id)) ?? lessons[0];
            return (
              <li key={p.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {p.emoji} {p.name}
                    </h2>
                    <p className="text-ink-soft">
                      {p.mn} · {n}/5 done
                    </p>
                  </div>
                  <Link href={`/learn/${next.id}`} className="btn btn-primary min-h-11 px-4 text-base" aria-label={`${n ? "Continue" : "Start"} ${p.name}`}>
                    <Play size={16} fill="currentColor" aria-hidden /> {n ? "Continue" : "Start"}
                  </Link>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper" aria-hidden>
                  <div className="h-full rounded-full bg-coral" style={{ width: `${(n / 5) * 100}%` }} />
                </div>
                <ol className="mt-3 space-y-1">
                  {lessons.map((l, i) => (
                    <li key={l.id}>
                      <Link href={`/learn/${l.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 text-cobalt hover:bg-paper">
                        <span>
                          {i + 1}. {l.title}
                        </span>
                        <span className="flex items-center gap-1 text-ink-soft">
                          {progress.completed.includes(l.id) ? (
                            <>
                              <Check size={16} aria-hidden /> Done
                            </>
                          ) : (
                            `${l.items.length} words`
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
