"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Minus, ShieldCheck, X } from "lucide-react";
import { FREE_LESSON_COUNT, PLANS, TRIAL_DAYS, tugrik, type Plan, type PlanId } from "@/lib/plans";
import { requestPass } from "@/lib/pass";
import { useAuth } from "./Providers";
import { usePass } from "./usePass";

type Paid = Exclude<PlanId, "free">;

const COMPARE: { label: string; free: boolean | string; pass: boolean | string }[] = [
  { label: "Translator + ready phrases", free: true, pass: true },
  { label: "All 35 letters, signs, numbers, money", free: true, pass: true },
  { label: "Greetings, Emergency, Doctor, Pharmacy", free: true, pass: true },
  { label: "Streaks, flashcards, spaced review", free: true, pass: true },
  { label: "Lessons", free: `${FREE_LESSON_COUNT}`, pass: "All 59" },
  { label: "Taxi, shopping, restaurant, work, culture… (20 gers)", free: false, pass: true },
  { label: "Streak freeze", free: false, pass: true },
  { label: "Renews by itself", free: "—", pass: "Never" },
];

const FAQ = [
  ["Why no subscription?", "Most visitors stay for a few weeks. A pass that simply ends is fairer than a subscription you have to remember to cancel."],
  ["How do I pay?", "Choose a pass and leave your email or phone. We send a QPay invoice: pay with any Mongolian bank app, or a foreign Visa or Mastercard. Your pass starts as soon as it is paid."],
  ["Is anything always free?", "Yes. The translator, the alphabet, street signs and the Emergency, Doctor and Pharmacy phrases stay free for everyone. Safety is never behind a paywall."],
  ["What happens when my pass ends?", "Nothing is lost. Your stars, streak and finished lessons stay. Pass lessons lock again until you get a new pass."],
  ["Can my company or university pay?", "Yes. The Teams plan gives every person a 1-year Pass on one invoice, from 5 people."],
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto text-ok" aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto text-ink-soft" aria-label="Not included" />;
  return <span className="font-semibold">{v}</span>;
}

export function Pricing() {
  const { user, loading } = useAuth();
  const { pass, active, daysLeft: days, trial } = usePass();
  const [open, setOpen] = useState<Paid | null>(null);
  const [trialMsg, setTrialMsg] = useState("");

  useEffect(() => {
    // Read ?plan= without useSearchParams, so the page stays fully static.
    const p = new URLSearchParams(window.location.search).get("plan");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p === "month" || p === "year" || p === "team") setOpen(p);
  }, []);

  async function startTrial() {
    const res = await trial();
    setTrialMsg(res.error ?? `Your ${TRIAL_DAYS}-day trial has started. Every lesson is open.`);
  }

  return (
    <main className="bg-gradient-to-b from-white to-paper px-4 pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold sm:text-6xl">Pay once. Learn all of it.</h1>
          <p className="mt-4 text-xl text-ink-soft">
            The translator and safety phrases are free forever. A Pass opens all 24 gers. No subscription, no auto-renew.
          </p>
          {active && pass && (
            <p className="mt-4 inline-flex rounded-full bg-ok-soft px-4 py-2 font-semibold text-ok">
              Your {pass.plan === "trial" ? "free trial" : "pass"} is active: {days} days left
            </p>
          )}
        </header>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PlanCard key={p.id} p={p} onPick={() => (p.id === "free" ? null : setOpen(p.id as Paid))} signedIn={!loading && !!user} />
          ))}
        </ul>

        {!pass && (
          <div className="panel mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xl font-bold">Not sure yet? Try every lesson free for {TRIAL_DAYS} days.</p>
              <p className="text-ink-soft">No payment details. It ends by itself.</p>
            </div>
            <button type="button" className="btn btn-gold" onClick={startTrial}>
              Start free trial
            </button>
          </div>
        )}
        {trialMsg && (
          <p role="status" className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-line">
            {trialMsg}{" "}
            <Link href="/learn" className="font-semibold text-cobalt underline">
              Go to my lessons
            </Link>
          </p>
        )}

        <section className="mt-16" aria-labelledby="cmp">
          <h2 id="cmp" className="text-3xl font-bold">
            Free vs Pass
          </h2>
          <div className="panel mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-4" scope="col">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="p-4 text-center" scope="col">
                    Free
                  </th>
                  <th className="p-4 text-center" scope="col">
                    Pass
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.label} className="border-b border-line last:border-0">
                    <th scope="row" className="p-4 font-normal">
                      {r.label}
                    </th>
                    <td className="p-4 text-center">
                      <Cell v={r.free} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell v={r.pass} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="faq">
          <h2 id="faq" className="text-3xl font-bold">
            Questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <summary className="cursor-pointer text-lg font-semibold">{q}</summary>
                <p className="mt-2 text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {open && <RequestDialog plan={PLANS.find((p) => p.id === open)!} onClose={() => setOpen(null)} signedIn={!loading && !!user} email={user?.email ?? ""} />}
    </main>
  );
}

function PlanCard({ p, onPick, signedIn }: { p: Plan; onPick: () => void; signedIn: boolean }) {
  return (
    <li className={`panel relative flex flex-col p-6 ${p.best ? "ring-2 ring-wood" : ""}`}>
      {p.best && <span className="absolute -top-3 left-6 rounded-full bg-wood px-3 py-1 text-sm font-bold text-white">Best value</span>}
      <h2 className="text-2xl font-bold">{p.name}</h2>
      <p className="mt-1 text-ink-soft">{p.tagline}</p>
      <p className="mt-5 text-4xl font-bold">{p.price ? tugrik(p.price) : "0₮"}</p>
      <p className="text-ink-soft">
        {p.usd} · {p.per}
      </p>
      <ul className="mt-5 flex-1 space-y-2">
        {p.perks.map((x) => (
          <li key={x} className="flex gap-2">
            <Check size={20} className="mt-0.5 shrink-0 text-ok" aria-hidden /> {x}
          </li>
        ))}
      </ul>
      {p.id === "free" ? (
        <Link href={signedIn ? "/learn" : "/login?mode=signup"} className="btn btn-line mt-6 text-cobalt">
          {signedIn ? "Go to my lessons" : "Start free"}
        </Link>
      ) : (
        <button type="button" onClick={onPick} className={`btn mt-6 ${p.best ? "btn-primary" : "btn-gold"}`}>
          {p.id === "team" ? "Get a team quote" : `Get the ${p.name}`}
        </button>
      )}
    </li>
  );
}

function RequestDialog({ plan, onClose, signedIn, email }: { plan: Plan; onClose: () => void; signedIn: boolean; email: string }) {
  const [contact, setContact] = useState(email);
  const [seats, setSeats] = useState(5);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await requestPass({ plan: plan.id as Paid, contact, seats, note });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong.");
  }

  const total = plan.id === "team" ? plan.price * Math.max(5, seats) : plan.price;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-night/50 p-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="rq-title" className="panel pop w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="rq-title" className="text-2xl font-bold">
            {plan.name}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line hover:bg-paper">
            <X size={20} aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-3xl font-bold">{tugrik(total)}</p>
        <p className="text-ink-soft">{plan.id === "team" ? `${Math.max(5, seats)} people × ${tugrik(plan.price)}` : `${plan.usd} · ${plan.per}`}</p>

        {!signedIn ? (
          <div className="mt-6">
            <p className="text-lg">Make a free account first, so your pass is linked to your lessons.</p>
            <Link href="/login?mode=signup" className="btn btn-primary mt-4 w-full">
              Create free account
            </Link>
          </div>
        ) : done ? (
          <div className="mt-6 rounded-2xl bg-ok-soft p-4 text-ok" role="status">
            <p className="font-bold">Request sent!</p>
            <p>We will send a QPay invoice to {contact}. Your pass starts as soon as it is paid.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="font-semibold">Email or phone for the invoice</span>
              <input className="input mt-1" required minLength={3} maxLength={200} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" />
            </label>
            {plan.id === "team" && (
              <label className="block">
                <span className="font-semibold">How many people?</span>
                <input className="input mt-1" type="number" min={5} max={500} value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
              </label>
            )}
            <label className="block">
              <span className="font-semibold">Note (optional)</span>
              <input className="input mt-1" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={plan.id === "team" ? "Company or university name" : ""} />
            </label>
            {error && (
              <p role="alert" className="rounded-2xl bg-bad-soft p-3 text-bad">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? "Sending…" : "Send me the QPay invoice"}
            </button>
            <p className="flex items-start gap-2 text-sm text-ink-soft">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden /> One payment. It never renews by itself.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
