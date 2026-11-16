"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Lock, ShieldCheck } from "lucide-react";
import { PLANS, TRIAL_DAYS, tugrik } from "@/lib/plans";
import type { Lesson } from "@/lib/lessons";
import { usePass } from "./usePass";

/** Shown instead of a Pass lesson. Free trial first (like a 7-day Super trial), then plans. */
export function Paywall({ lesson }: { lesson: Lesson }) {
  const { pass, trial } = usePass();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const usedTrial = !!pass; // any pass on record means the trial is used (or they paid)
  const month = PLANS.find((p) => p.id === "month")!;
  const year = PLANS.find((p) => p.id === "year")!;

  async function start() {
    setBusy(true);
    setError("");
    const res = await trial();
    setBusy(false);
    if (res.error) setError(res.error);
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-paper px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/learn" className="inline-flex min-h-11 items-center gap-2 font-semibold text-cobalt">
          <ArrowLeft size={20} aria-hidden /> Back to my ger-town
        </Link>

        <section className="panel pop mt-6 p-6 sm:p-8" aria-labelledby="pw-title">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-soft text-wood" aria-hidden>
            <Lock size={28} />
          </div>
          <p className="mt-5 text-lg text-ink-soft">
            {lesson.emoji} {lesson.subtitle}
          </p>
          <h1 id="pw-title" className="mt-1 text-3xl font-bold sm:text-4xl">
            “{lesson.title}” is in the Pass
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            The Pass opens all 24 gers and 48 lessons. Pay once: it never renews by itself.
          </p>

          {!usedTrial && (
            <button type="button" onClick={start} disabled={busy} className="btn btn-primary mt-6 w-full text-lg">
              {busy ? "Starting…" : `Try everything free for ${TRIAL_DAYS} days`}
            </button>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-2xl bg-bad-soft p-3 text-bad">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[month, year].map((p) => (
              <Link
                key={p.id}
                href={`/pricing?plan=${p.id}`}
                className={`rounded-2xl p-4 ring-1 transition hover:bg-paper ${p.best ? "ring-2 ring-wood" : "ring-line"}`}
              >
                <p className="font-bold">{p.name}</p>
                <p className="mt-1 text-2xl font-bold">{tugrik(p.price)}</p>
                <p className="text-sm text-ink-soft">
                  {p.usd} · {p.per}
                </p>
                {p.best && <p className="mt-2 text-sm font-semibold text-wood">Best value: half price</p>}
              </Link>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-2 text-ink-soft">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-ok" aria-hidden />
            <span>
              Always free: the translator, all 35 letters, street signs, and the Greetings, Emergency, Doctor and Pharmacy
              gers. Safety phrases are never behind a paywall.
            </span>
          </p>
          <ul className="mt-4 space-y-1 text-ink-soft">
            {["Pay with QPay or any bank card", "No auto-renew, no hidden charges"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={18} className="text-ok" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="btn btn-line mt-6 w-full text-cobalt">
            Compare all plans
          </Link>
        </section>
      </div>
    </main>
  );
}
