"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, MessageCircle, Send, Sparkles, Theater, Wand2, BookOpenCheck } from "lucide-react";
import { LearnHeader } from "@/components/LearnHeader";
import { useAuth } from "@/components/Providers";
import { usePass } from "@/components/usePass";
import { ShowCard } from "@/components/ShowCard";
import { askAI, parseJson, parseRoleplay, ROLEPLAYS, type AiResult } from "@/lib/ai";
import { TRIAL_DAYS } from "@/lib/plans";
import { transliterate } from "@/lib/translit";

type Tool = "tutor" | "roleplay" | "sayit" | "photo" | "lesson";
const TOOLS: { id: Tool; label: string; icon: typeof Sparkles; blurb: string }[] = [
  { id: "roleplay", label: "Talk practice", icon: Theater, blurb: "Speak with a taxi driver, landlord or herder family. Yarii plays the part and corrects you kindly." },
  { id: "photo", label: "Photo reader", icon: Camera, blurb: "Take a photo of a sign, menu, notice or label. Yarii reads every line and tells you what to do." },
  { id: "sayit", label: "Say it for me", icon: Wand2, blurb: "Describe your situation in English. Get a polite and a casual way to say it, ready to show." },
  { id: "lesson", label: "My own lesson", icon: BookOpenCheck, blurb: "Any topic: your job, your hobby, your trip. Yarii makes a 6-word lesson just for you." },
  { id: "tutor", label: "Ask Yarii", icon: MessageCircle, blurb: "Ask anything about Mongolian words, grammar or customs. Short, clear answers." },
];

type Msg = { role: "user" | "assistant"; content: string };
const errorText = (r: AiResult) => r.error ?? "Something went wrong. Please try again.";

export default function AiPage() {
  const { user, loading } = useAuth();
  const { active, ready, pass, daysLeft, trial } = usePass();
  const [tool, setTool] = useState<Tool>("roleplay");
  const [left, setLeft] = useState<string>("");
  const [trialMsg, setTrialMsg] = useState("");

  const onUsage = (r: AiResult) => r.usage && setLeft(`${r.usage.limit - r.usage.used} of ${r.usage.limit} left today`);

  async function startTrial() {
    const res = await trial();
    setTrialMsg(res.error ?? "");
  }

  return (
    <div className="min-h-screen bg-paper">
      <LearnHeader />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 font-semibold text-wood">
          <Sparkles size={16} aria-hidden /> Yarii AI
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">A Mongolian friend in your pocket</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">
          All lessons are free. Yarii AI is the paid part: it talks with you, reads the street for you and writes what you need to say.
        </p>

        {loading || (user && !ready) ? (
          <p className="mt-8 text-ink-soft">Loading…</p>
        ) : !user ? (
          <Gate title="Log in to meet Yarii AI" text="Make a free account first. Then try Yarii AI free for 7 days.">
            <Link href="/login?mode=signup" className="btn btn-primary">
              Create free account
            </Link>
            <Link href="/login" className="btn btn-line text-cobalt">
              Log in
            </Link>
          </Gate>
        ) : !active ? (
          <Gate
            title={pass ? "Your Yarii AI pass has ended" : `Try Yarii AI free for ${TRIAL_DAYS} days`}
            text={pass ? "Get a 30-day or 1-year pass to keep talking. Your lessons stay free." : "No payment details. 15 AI uses a day during the trial. It ends by itself."}
          >
            {!pass && (
              <button type="button" className="btn btn-primary" onClick={startTrial}>
                Start free trial
              </button>
            )}
            <Link href="/pricing" className="btn btn-gold">
              See plans
            </Link>
            {trialMsg && <p role="alert" className="w-full text-bad">{trialMsg}</p>}
          </Gate>
        ) : (
          <>
            <p className="mt-4 inline-flex flex-wrap gap-x-3 rounded-full bg-ok-soft px-4 py-2 font-semibold text-ok">
              <span>{pass?.plan === "trial" ? "Free trial" : "Pass"} active · {daysLeft} days left</span>
              {left && <span>· {left}</span>}
            </p>
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Yarii AI tools">
              {TOOLS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tool === id}
                  onClick={() => setTool(id)}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-semibold ${tool === id ? "bg-cobalt text-white" : "bg-white text-ink ring-1 ring-line hover:bg-sky-soft"}`}
                >
                  <Icon size={18} aria-hidden /> {label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-lg text-ink-soft">{TOOLS.find((t) => t.id === tool)!.blurb}</p>
            <section className="mt-4" role="tabpanel">
              {tool === "roleplay" && <Roleplay onUsage={onUsage} />}
              {tool === "photo" && <Photo onUsage={onUsage} />}
              {tool === "sayit" && <SayIt onUsage={onUsage} />}
              {tool === "lesson" && <MyLesson onUsage={onUsage} />}
              {tool === "tutor" && <Tutor onUsage={onUsage} />}
            </section>
          </>
        )}

        {/* What you get, for everyone */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ id, label, icon: Icon, blurb }) => (
            <li key={id} className="panel p-5">
              <Icon size={24} className="text-wood" aria-hidden />
              <p className="mt-2 text-xl font-bold">{label}</p>
              <p className="mt-1 text-ink-soft">{blurb}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function Gate({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="panel mt-8 p-6">
      <p className="text-2xl font-bold">{title}</p>
      <p className="mt-1 text-lg text-ink-soft">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function Busy() {
  return <p className="mt-3 animate-pulse text-ink-soft">Yarii is thinking…</p>;
}
function Err({ text }: { text: string }) {
  return (
    <p role="alert" className="mt-3 rounded-2xl bg-bad-soft p-3 text-bad">
      {text}
    </p>
  );
}

/* ---------------- Talk practice ---------------- */
function Roleplay({ onUsage }: { onUsage: (r: AiResult) => void }) {
  const [scenario, setScenario] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), [msgs, busy]);

  async function send(next: Msg[], sc = scenario) {
    setBusy(true);
    setError("");
    const r = await askAI({ mode: "roleplay", scenario: sc!, messages: next });
    setBusy(false);
    onUsage(r);
    if (r.text) setMsgs([...next, { role: "assistant", content: r.text }]);
    else setError(errorText(r));
  }

  if (!scenario)
    return (
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLEPLAYS.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => {
                setScenario(r.id);
                const first: Msg[] = [{ role: "user", content: "Сайн байна уу! (Start the conversation.)" }];
                setMsgs(first);
                send(first, r.id);
              }}
              className="panel flex w-full items-center gap-3 p-4 text-left hover:bg-sky-soft"
            >
              <span className="text-3xl" aria-hidden>
                {r.emoji}
              </span>
              <span className="text-lg font-bold">{r.title}</span>
            </button>
          </li>
        ))}
      </ul>
    );

  const sc = ROLEPLAYS.find((r) => r.id === scenario)!;
  return (
    <div className="panel p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-bold">
          {sc.emoji} {sc.title}
        </p>
        <button type="button" className="btn btn-line min-h-11 px-4 text-base text-cobalt" onClick={() => setScenario(null)}>
          Change
        </button>
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        {msgs.slice(1).map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-auto max-w-[80%] rounded-2xl bg-cobalt px-4 py-2 text-white">
              {m.content}
            </p>
          ) : (
            <Bubble key={i} text={m.content} />
          ),
        )}
        {busy && <Busy />}
        {error && <Err text={error} />}
        <div ref={end} />
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || busy) return;
          const next: Msg[] = [...msgs, { role: "user", content: input.trim() }];
          setMsgs(next);
          setInput("");
          send(next);
        }}
      >
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Answer in Mongolian (or Latin letters, or English)" maxLength={300} aria-label="Your answer" />
        <button type="submit" className="btn btn-primary px-4" disabled={busy || !input.trim()} aria-label="Send">
          <Send size={20} aria-hidden />
        </button>
      </form>
    </div>
  );
}

function Bubble({ text }: { text: string }) {
  const r = parseRoleplay(text);
  if (!r.mn) return <p className="max-w-[85%] whitespace-pre-line rounded-2xl bg-paper px-4 py-2">{text}</p>;
  return (
    <div className="max-w-[85%] rounded-2xl bg-paper px-4 py-3">
      <p className="font-display text-xl font-bold">{r.mn}</p>
      {r.say && <p className="text-ink-soft">“{r.say}”</p>}
      {r.en && <p>{r.en}</p>}
      {r.tip && <p className="mt-2 rounded-xl bg-gold-soft px-3 py-2 text-sm">💡 {r.tip}</p>}
    </div>
  );
}

/* ---------------- Photo reader ---------------- */
async function shrink(file: File): Promise<{ data: string; type: string }> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.82);
  return { data: url.split(",")[1], type: "image/jpeg" };
}

function Photo({ onUsage }: { onUsage: (r: AiResult) => void }) {
  const [preview, setPreview] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError("");
    setAnswer("");
    setBusy(true);
    try {
      const { data, type } = await shrink(f);
      setPreview(`data:${type};base64,${data}`);
      const r = await askAI({ mode: "photo", image: data, mediaType: type });
      onUsage(r);
      if (r.text) setAnswer(r.text);
      else setError(errorText(r));
    } catch {
      setError("Could not open that photo. Try another one.");
    }
    setBusy(false);
  }

  return (
    <div className="panel p-4 sm:p-6">
      <label className="btn btn-primary cursor-pointer">
        <Camera size={20} aria-hidden /> Take or choose a photo
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview && <img src={preview} alt="Your photo" className="w-full rounded-2xl ring-1 ring-line" />}
        <div>
          {busy && <Busy />}
          {error && <Err text={error} />}
          {answer && <p className="whitespace-pre-line text-lg">{answer}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Say it for me ---------------- */
type Line = { mn: string; say: string; en: string };
function SayIt({ onUsage }: { onUsage: (r: AiResult) => void }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState<{ polite?: Line; casual?: Line; note?: string } | null>(null);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState<Line | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) return;
    setBusy(true);
    setError("");
    setOut(null);
    const r = await askAI({ mode: "sayit", text });
    setBusy(false);
    onUsage(r);
    if (!r.text) return setError(errorText(r));
    const j = parseJson<{ polite?: Line; casual?: Line; note?: string }>(r.text);
    if (j?.polite) setOut(j);
    else setRaw(r.text);
  }

  return (
    <div className="panel p-4 sm:p-6">
      <form onSubmit={go} className="space-y-3">
        <label className="block">
          <span className="font-semibold">What do you need to say?</span>
          <textarea className="input mt-1 min-h-28" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. Tell my landlord the heating is broken and ask when someone can fix it" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy || text.trim().length < 3}>
          <Wand2 size={20} aria-hidden /> Say it in Mongolian
        </button>
      </form>
      {busy && <Busy />}
      {error && <Err text={error} />}
      {out && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(["polite", "casual"] as const).map((k) =>
            out[k] ? (
              <div key={k} className="rounded-2xl bg-paper p-4">
                <p className="text-sm font-bold uppercase text-ink-soft">{k === "polite" ? "Polite (strangers, elders)" : "Casual (friends)"}</p>
                <p className="mt-1 font-display text-2xl font-bold">{out[k]!.mn}</p>
                <p className="text-ink-soft">“{out[k]!.say || transliterate(out[k]!.mn)}”</p>
                <p>{out[k]!.en}</p>
                <button type="button" className="btn btn-gold mt-3 min-h-11 px-4 text-base" onClick={() => setShow(out[k]!)}>
                  Show full screen
                </button>
              </div>
            ) : null,
          )}
          {out.note && <p className="md:col-span-2">💡 {out.note}</p>}
        </div>
      )}
      {!out && raw && <p className="mt-4 whitespace-pre-line">{raw}</p>}
      {show && <ShowCard phrase={{ mn: show.mn, en: show.en }} onClose={() => setShow(null)} />}
    </div>
  );
}

/* ---------------- My own lesson ---------------- */
type Mini = { title: string; items: { mn: string; en: string }[] };
const MINI_KEY = "yarii_ai_lessons";

function MyLesson({ onUsage }: { onUsage: (r: AiResult) => void }) {
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState<Mini | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState<number[]>([]);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 2) return;
    setBusy(true);
    setError("");
    const r = await askAI({ mode: "lesson", topic });
    setBusy(false);
    onUsage(r);
    const j = parseJson<Mini>(r.text);
    if (!j?.items?.length) return setError(r.text ? "Yarii could not build that lesson. Try another topic." : errorText(r));
    setLesson(j);
    setFlipped([]);
    try {
      const all = JSON.parse(localStorage.getItem(MINI_KEY) || "[]") as Mini[];
      localStorage.setItem(MINI_KEY, JSON.stringify([j, ...all].slice(0, 20)));
    } catch {}
  }

  return (
    <div className="panel p-4 sm:p-6">
      <form onSubmit={go} className="flex flex-col gap-3 sm:flex-row">
        <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder="e.g. I work at a mine · my yoga class · hiking in Terelj" aria-label="Lesson topic" />
        <button type="submit" className="btn btn-primary" disabled={busy || topic.trim().length < 2}>
          Make my lesson
        </button>
      </form>
      {busy && <Busy />}
      {error && <Err text={error} />}
      {lesson && (
        <>
          <p className="mt-5 text-2xl font-bold">{lesson.title}</p>
          <p className="text-ink-soft">Tap a card to check yourself.</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {lesson.items.slice(0, 8).map((it, i) => {
              const open = flipped.includes(i);
              return (
                <li key={i}>
                  <button type="button" onClick={() => setFlipped((f) => (open ? f.filter((x) => x !== i) : [...f, i]))} className="w-full rounded-2xl bg-paper p-4 text-left ring-1 ring-line hover:bg-sky-soft" aria-expanded={open}>
                    <p className="font-display text-2xl font-bold">{it.mn}</p>
                    <p className="text-ink-soft">“{transliterate(it.mn).toLowerCase()}”</p>
                    <p className={open ? "mt-1 font-semibold" : "mt-1 text-ink-soft"}>{open ? it.en : "Tap to see the meaning"}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------------- Ask Yarii ---------------- */
function Tutor({ onUsage }: { onUsage: (r: AiResult) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ideas = ["How do I say 'I'm vegetarian'?", "Why do Mongolians say 'Сайн байна уу'?", "What's the difference between та and чи?"];

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text.trim() }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError("");
    const r = await askAI({ mode: "tutor", messages: next });
    setBusy(false);
    onUsage(r);
    if (r.text) setMsgs([...next, { role: "assistant", content: r.text }]);
    else setError(errorText(r));
  }

  return (
    <div className="panel p-4 sm:p-6">
      {msgs.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {ideas.map((q) => (
            <button key={q} type="button" className="min-h-11 rounded-full bg-paper px-4 text-left ring-1 ring-line hover:bg-sky-soft" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <p key={i} className={m.role === "user" ? "ml-auto max-w-[80%] rounded-2xl bg-cobalt px-4 py-2 text-white" : "max-w-[85%] whitespace-pre-line rounded-2xl bg-paper px-4 py-3"}>
            {m.content}
          </p>
        ))}
        {busy && <Busy />}
        {error && <Err text={error} />}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about any word, phrase or custom" maxLength={500} aria-label="Your question" />
        <button type="submit" className="btn btn-primary px-4" disabled={busy || !input.trim()} aria-label="Send">
          <Send size={20} aria-hidden />
        </button>
      </form>
    </div>
  );
}
