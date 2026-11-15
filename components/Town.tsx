"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, LibraryBig, List, LogOut, Play, Sparkles, Wrench, X } from "lucide-react";
import { useAuth } from "@/components/Providers";
import { useLearner } from "@/components/useLearner";
import { useReduced } from "@/components/useDecode";
import { Loading } from "@/components/Loading";
import { CLUSTERS, CURRICULUM, GERS, type GerSpec } from "@/lib/curriculum";
import { PER_SEASON, SEASONS, TOTAL_CURRICULUM, curriculumDone, freeExplore, say, seasonOf } from "@/lib/journey";
import { LESSONS } from "@/lib/lessons";
import { dueReviews, endGuest } from "@/lib/progress";
import type { Town as TownWorld, TownLabel } from "@/components/world/createTown";

const GLASS = "bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] text-[#f3eadf] ring-1 ring-white/10 backdrop-blur-md";
const BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 font-semibold transition";
const QUICK = ["emergency", "doctor", "pharmacy"]; // practical packs, always one tap away
const SHORT: Record<string, string> = { greet: "Hello", family: "Family", "time-money": "Numbers", shopping: "Shopping", restaurant: "Food", lodging: "Rooms", taxi: "Taxi", bus: "Bus", directions: "Directions", countryside: "Countryside", phone: "Phone", work: "Work", doctor: "Doctor", pharmacy: "Pharmacy", emergency: "Emergency", weather: "Weather", plans: "Plans", help: "Help", etiquette: "Ger manners", livestock: "Animals", food: "Dairy", migration: "Migration", naadam: "Naadam", "tsagaan-sar": "Tsagaan Sar" };
// Each season re-themes the interface: climate and mood change with the camp.
const PAL = [
  { ac: "#9ad06a", bg: "#0f2010" },
  { ac: "#f2a33a", bg: "#251708" },
  { ac: "#9fd4f0", bg: "#0e1a26" },
  { ac: "#d4e36a", bg: "#1a2110" },
];
const IBTN = "grid h-11 w-11 place-items-center rounded-full";
const lessonsOf = (g: GerSpec) => CURRICULUM.filter((l) => l.ger === g.id);

export function Town() {
  const { progress, ready, guest, update } = useLearner();
  const { signOut } = useAuth();
  const router = useRouter();
  const reduced = useReduced();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<TownWorld | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [view, setView] = useState<"3d" | "list">("3d");
  const [loaded, setLoaded] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [guide, setGuide] = useState(false);
  const [viewSeason, setViewSeason] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null); // the ger we are standing in front of
  const first = useRef(true); // first camera placement snaps; later ones glide
  const glide = useRef(false); // a pack was finished since last visit: glide to the next ger

  const done = progress ? curriculumDone(progress.completed) : 0;
  const reached = seasonOf(done);
  const free = freeExplore(done);
  const shown = free && viewSeason !== null ? viewSeason : reached;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const newNote = progress && reached > progress.seasonSeen ? SEASONS[reached] : null;
  const nextGer = progress ? GERS.find((g) => !lessonsOf(g).every((l) => progress.completed.includes(l.id))) : undefined;
  const gerDone = (g: GerSpec) => lessonsOf(g).filter((l) => progress?.completed.includes(l.id)).length;

  /* 3D: loaded lazily, paused when hidden, cleaned up on leave */
  useEffect(() => {
    if (!ready || view !== "3d") return;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    const onVis = () => worldRef.current?.setActive(document.visibilityState === "visible");
    const place = (labels: TownLabel[]) => {
      for (const L of labels) {
        const el = labelRefs.current[L.id];
        if (!el) continue;
        el.style.display = L.v ? "" : "none";
        el.style.transform = `translate3d(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px,0) translate(-50%,-100%)`;
      }
    };
    (async () => {
      try {
        const t = document.createElement("canvas");
        if (!t.getContext("webgl2") && !t.getContext("webgl")) throw new Error("no webgl");
        const { createTown } = await import("./world/createTown");
        const nav = navigator as Navigator & { deviceMemory?: number };
        const low = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
        const world = await createTown(canvas, { low, reduced, season: shownRef.current, onLabels: place });
        if (disposed) return world.dispose();
        worldRef.current = world;
        const r = stage.getBoundingClientRect();
        world.resize(r.width, r.height);
        ro = new ResizeObserver(([e]) => world.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(stage);
        io = new IntersectionObserver(([e]) => world.setActive(e.isIntersecting && document.visibilityState === "visible"));
        io.observe(stage);
        document.addEventListener("visibilitychange", onVis);
        setLoaded(true);
      } catch {
        if (!disposed) setView("list");
      }
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      worldRef.current?.dispose();
      worldRef.current = null;
      setLoaded(false);
    };
  }, [ready, view, reduced]);

  useEffect(() => worldRef.current?.setSeason(shown), [shown, loaded]);
  const N = GERS.length;
  const cur = nextGer ? GERS.indexOf(nextGer) : N - 1; // first unfinished ger (or the last one when all are done)
  const reach = guest ? N - 1 : cur; // demo: every ger is open, so Next always goes straight on
  const here = stop ?? cur;
  /* restore the stop from saved progress; if a pack was finished since the last visit, glide to the next ger */
  useEffect(() => {
    if (!ready || stop !== null) return;
    let from = cur;
    try {
      const s = Number(sessionStorage.getItem("yarii_stop"));
      const d = sessionStorage.getItem("yarii_der");
      if (sessionStorage.getItem("yarii_stop") !== null && s >= 0 && s < N) from = s;
      glide.current = d !== null && cur > Number(d);
    } catch {}
    setStop(from);
  }, [ready, stop, cur, N]);
  useEffect(() => {
    if (stop === null || !loaded) return;
    worldRef.current?.setRoute(stop, first.current);
    const snap = first.current;
    first.current = false;
    try {
      sessionStorage.setItem("yarii_stop", String(stop));
      sessionStorage.setItem("yarii_der", String(cur));
    } catch {}
    setArrived(false);
    const t = setTimeout(() => setArrived(true), reduced ? 0 : snap ? 400 : 1700); // the Start button appears only after arrival
    let g: ReturnType<typeof setTimeout> | undefined;
    if (snap && glide.current && stop !== cur) g = setTimeout(() => goTo(cur), 900);
    glide.current = false;
    return () => {
      clearTimeout(t);
      clearTimeout(g);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop, loaded]);
  /* a long scrollable roadmap: scrolling picks the nearest reached stop (the camera still stops at each ger) */
  useEffect(() => {
    if (view !== "3d" || stop === null) return;
    const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const top = (i: number) => (i / (N - 1)) * max();
    if (Math.abs(window.scrollY - top(stop)) > max() / (N - 1) / 2) window.scrollTo({ top: top(stop), behavior: "auto" });
    let raf = 0;
    const onScroll = () =>
      (raf ||= requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round((window.scrollY / max()) * (N - 1));
        if (i > reach) window.scrollTo({ top: top(reach), behavior: "auto" });
        else if (i !== stop) goTo(i);
      }));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, stop, reach, N]);
  useEffect(() => worldRef.current?.setHover(arrived && view === "3d" ? GERS[here].id : null), [arrived, here, view, loaded]);
  const goTo = (i: number) => {
    setStop(Math.max(0, Math.min(N - 1, i)));
    setHidden(false);
  };
  useEffect(() => {
    if (reduced) setView("list");
  }, [reduced]);

  const open = (id: string) => {
    const i = GERS.findIndex((g) => g.id === id);
    if (view === "3d") goTo(i);
    else router.push(`/learn/${id}-1`);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (guide) setGuide(false);
      else setHidden(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guide]);

  if (!ready || !progress) return <Loading />;

  const sel = view === "3d" && arrived && !hidden ? GERS[here] : null;
  const season = SEASONS[shown];
  const nextName = reached < 3 ? SEASONS[reached + 1].en : "free exploration";
  const inSeason = free ? PER_SEASON : done - reached * PER_SEASON;
  const reviews = dueReviews(progress);

  return (
    <>
    <div className="fixed inset-0 overflow-hidden bg-[#0e1318]" style={{ "--ac": PAL[shown].ac, "--bg": PAL[shown].bg } as React.CSSProperties}>
      {/* stage */}
      <div
        ref={stageRef}
        className="absolute inset-0"
        role="region"
        aria-label="Ger-town trail. Scroll down, or use the arrow keys or Page Down, to move forward along the trail. "
      >
        {view === "3d" && <canvas ref={canvasRef} className="h-full w-full" aria-hidden />}
        {view === "3d" && !loaded && <p className={`${GLASS} absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full px-5 py-3`}>Loading the camp…</p>}
      </div>

      {/* compact toolbar */}
      <header className={`${GLASS} absolute inset-x-2 top-2 z-30 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl p-1.5 pl-3`}>
        <div className="min-w-0 flex-1 basis-44" aria-live="polite">
          <p className="truncate font-semibold leading-tight">{season.en} · {season.mn}</p>
          <p className="truncate text-xs text-[#f3eadf]/80">{free ? "All 48 lessons done: free exploration" : `${inSeason}/${PER_SEASON} to ${nextName}`}</p>
          <div className="mt-1 h-1 w-full max-w-40 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_CURRICULUM} aria-valuenow={done} aria-label="Lessons finished">
            <div className="h-full rounded-full bg-[var(--ac)]" style={{ width: `${(done / TOTAL_CURRICULUM) * 100}%` }} />
          </div>
        </div>
        {view === "3d" && (
          <div className="flex items-center gap-1" role="group" aria-label="Move forward along the trail">
                        <button type="button" aria-label="Previous ger" disabled={here <= 0} className={`${IBTN} hover:bg-white/10 disabled:opacity-40`} onClick={() => goTo(here - 1)}><ChevronLeft size={20} aria-hidden /></button>
            <span className="px-1 text-sm font-semibold" aria-live="polite">{here + 1}/{N}</span>
            <button type="button" aria-label="Next ger" disabled={here >= reach} className={`${IBTN} hover:bg-white/10 disabled:opacity-40`} onClick={() => goTo(here + 1)}><ChevronRight size={20} aria-hidden /></button>
            {here !== cur && (
              <button type="button" className="min-h-11 rounded-full bg-[#8fd16a] px-3 text-sm font-semibold text-[#10161b]" onClick={() => goTo(cur)}>
                Current: {SHORT[GERS[cur].id]}
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-0.5">
          {QUICK.map((id) => (
            <button key={id} type="button" aria-label={`${GERS.find((g) => g.id === id)!.name} lessons`} title={GERS.find((g) => g.id === id)!.name} className={`${IBTN} ${id === "emergency" ? "bg-[#b4452f]" : "hover:bg-white/10"}`} onClick={() => open(id)}>
              {GERS.find((g) => g.id === id)!.emoji}
            </button>
          ))}
          <Link href="/learn/packs" aria-label="All lessons" title="100 more lessons" className={`${IBTN} hover:bg-white/10`}><LibraryBig size={18} aria-hidden /></Link>
          <Link href="/ai" className={`${BTN} min-h-11 bg-[var(--ac)] px-3 text-sm text-[#10161b]`}><Sparkles size={16} aria-hidden /> Yarii AI</Link>
          <button type="button" aria-label="Guide" title="Guide" className={`${IBTN} hover:bg-white/10`} onClick={() => setGuide(true)}><BookOpen size={18} aria-hidden /></button>
          <button type="button" aria-label={view === "3d" ? "Switch to list view" : "Switch to town view"} title={view === "3d" ? "List view" : "Town view"} className={`${IBTN} hover:bg-white/10`} onClick={() => setView(view === "3d" ? "list" : "3d")}><List size={18} aria-hidden /></button>
          <Link href="/learn/tools" aria-label={`Alphabet and tools${reviews.length ? `, ${reviews.length} reviews due` : ""}`} title="Alphabet & tools" className={`${IBTN} relative hover:bg-white/10`}>
            <Wrench size={18} aria-hidden />
            {reviews.length > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[var(--ac)] px-1.5 text-[10px] font-bold text-[#10161b]">{reviews.length}</span>}
          </Link>
          <button type="button" aria-label={guest ? "Exit demo" : "Log out"} title={guest ? "Exit demo" : "Log out"} className={`${IBTN} hover:bg-white/10`} onClick={() => { if (guest) { endGuest(); router.push("/login"); } else signOut(); }}><LogOut size={18} aria-hidden /></button>
        </div>
        {free && (
          <div className="flex w-full gap-1" role="group" aria-label="Visit a season">
            {SEASONS.map((x, i) => (
              <button key={x.id} type="button" aria-pressed={shown === i} className={`${BTN} min-h-9 flex-1 text-sm ${shown === i ? "bg-[var(--ac)] text-[#10161b]" : "bg-white/10"}`} onClick={() => setViewSeason(i)}>{x.en}</button>
            ))}
          </div>
        )}
      </header>

      {/* roadmap rail: 24 stops in 4 chapters; only reached stops can be opened */}
      {view === "3d" && (
        <nav aria-label="Roadmap" className="absolute left-2 top-28 z-30 hidden max-h-[calc(100dvh-8rem)] flex-col gap-0.5 overflow-y-auto rounded-full p-1 sm:flex bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]">
          {GERS.map((g, i) => (
            <button key={g.id} type="button" disabled={i > reach} aria-label={`Stop ${i + 1}: ${g.name}`} aria-current={i === here} title={`${i + 1}. ${g.name}`} onClick={() => goTo(i)} className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === here ? "bg-[var(--ac)] text-[#10161b]" : i < cur ? "bg-white/40 text-[#10161b]" : i === cur ? "ring-2 ring-[var(--ac)] text-white" : "bg-white/10 text-white/50"} ${i % 6 === 5 ? "mb-1" : ""}`}>
              {i + 1}
            </button>
          ))}
        </nav>
      )}

      {/* lightweight list (no WebGL, or by choice) */}
      {view === "list" && (
        <main className="absolute inset-0 z-20 overflow-y-auto bg-paper px-4 pb-10 pt-28 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <p className="text-lg text-ink-soft">The same 24 gers as a simple list. Every ger has two short lessons.</p>
            {CLUSTERS.map((c) => (
              <section key={c.id} aria-labelledby={`c-${c.id}`}>
                <h2 id={`c-${c.id}`} className="text-2xl font-bold">
                  {c.name} <span className="text-ink-soft">{c.mn}</span>
                </h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {GERS.filter((g) => g.cluster === c.id).map((g) => (
                    <li key={g.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                      <p className="font-bold">
                        {g.emoji} {g.name} <span className="font-normal text-ink-soft">{g.mn}</span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {lessonsOf(g).map((l) => (
                          <li key={l.id}>
                            <Link href={`/learn/${l.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 text-cobalt hover:bg-paper">
                              <span>{l.title}</span>
                              <span className="flex items-center gap-1 text-ink-soft">{progress.completed.includes(l.id) ? <><Check size={16} aria-hidden /> Done</> : "Start"}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </main>
      )}

      {/* ger preview */}
      {sel && (
        <aside role="dialog" aria-modal="false" aria-labelledby="ger-title" className={`${GLASS} absolute inset-x-3 bottom-3 z-40 max-h-[55dvh] overflow-y-auto rounded-3xl p-5 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[26rem] sm:max-h-[calc(100dvh-6rem)]`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="ger-title" tabIndex={-1} ref={(el) => el?.focus()} className="text-2xl font-bold outline-none">
                {sel.emoji} {sel.name}
              </h2>
              <p className="text-[#f3eadf]/80">{sel.mn} · {gerDone(sel)} of 2 lessons done</p>
            </div>
            <button type="button" onClick={() => setHidden(true)} aria-label="Hide lessons" className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-white/30 hover:bg-white/10">
              <X size={20} aria-hidden />
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {lessonsOf(sel).map((l) => {
              const isDone = progress.completed.includes(l.id);
              const firstOpen = lessonsOf(sel).find((x) => !progress.completed.includes(x.id))?.id === l.id;
              const label = isDone ? "Review" : firstOpen && gerDone(sel) > 0 ? "Continue" : "Start";
              return (
                <li key={l.id} className="rounded-2xl bg-white/10 p-4">
                  <p className="flex items-center justify-between gap-2 font-bold">
                    {l.title}
                    {isDone && <span className="flex items-center gap-1 text-sm text-[#b9d58a]"><Check size={16} aria-hidden /> Done</span>}
                  </p>
                  <p className="text-sm text-[#f3eadf]/70">{l.items.length} phrases · dialogue · quiz</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {l.items.map((it) => (
                      <li key={it.id}>
                        <span className="font-semibold">{it.show}</span> <span className="text-[#f3eadf]/70">({say(it.show)})</span> {it.meaning}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/learn/${l.id}`} className={`${BTN} mt-3 bg-[var(--ac)] text-[#10161b]`}>
                    <Play size={16} fill="currentColor" aria-hidden /> {isDone ? "Review lesson" : `${label} lesson`}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* guide */}
      {guide && (
        <div className="absolute inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={() => setGuide(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={(e) => e.stopPropagation()} className={`${GLASS} max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl`}>
            <div className="flex items-start justify-between gap-3">
              <h2 id="guide-title" className="text-2xl font-bold">Guide</h2>
              <button type="button" onClick={() => setGuide(false)} aria-label="Close guide" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/30 hover:bg-white/10" autoFocus>
                <X size={20} aria-hidden />
              </button>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Move:</strong> follow the straight trail forward: scroll down, use the arrow keys or Page Down, or the &gt; button (the camera never goes back). Numbers 1 to 4 jump to a chapter, the green button goes to your next lesson. Tab moves between gers; hover or focus shows the full name.</li>
              <li><strong>Learn:</strong> click a ger to open its two micro-lessons (phrases, a short dialogue, then a quiz). Past lessons stay open, and the 🚨 🩺 💊 buttons jump straight to emergency, doctor and pharmacy.</li>
              <li><strong>Seasons:</strong> every {PER_SEASON} different new lessons you finish moves the camp on: summer, autumn, winter, spring. Replays and reviews never count. After all {TOTAL_CURRICULUM} lessons you can visit any season.</li>
            </ul>
            <h3 className="mt-5 text-lg font-bold">Season notes</h3>
            <p className="text-sm text-[#f3eadf]/70">Regional examples, not rules for every herder. Seasons here follow your learning, not the calendar.</p>
            <ul className="mt-2 space-y-3">
              {SEASONS.slice(0, free ? 4 : reached + 1).map((s) => (
                <li key={s.id} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-bold">{s.en} · {s.mn}</p>
                  <p className="mt-1">{s.note}</p>
                  <p className="mt-1">Useful phrase: <strong>{s.phrase.mn}</strong> ({say(s.phrase.mn)}), “{s.phrase.en}”</p>
                  <p className="mt-1 text-sm text-[#f3eadf]/70">Source: {s.source}.</p>
                </li>
              ))}
            </ul>
            {reviews.length > 0 && (
              <p className="mt-4">
                Reviews due:{" "}
                {reviews.map((id) => (
                  <Link key={id} href={`/learn/${id}`} className="mr-3 font-semibold text-[var(--ac)] underline underline-offset-4">
                    {LESSONS.find((l) => l.id === id)?.title ?? id}
                  </Link>
                ))}
              </p>
            )}
            <p className="mt-4">
              <Link href="/learn/tools" className="font-semibold text-[var(--ac)] underline underline-offset-4">Alphabet, flashcards, conversations and translator</Link>
            </p>
          </section>
        </div>
      )}

      {/* season change note (shown once; remembered) */}
      {newNote && (
        <div className="absolute inset-0 z-[60] grid place-items-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="season-title" className={`${GLASS} w-full max-w-lg rounded-3xl p-6`}>
            <p className="text-[var(--ac)]">New season</p>
            <h2 id="season-title" className="mt-1 text-3xl font-bold">{newNote.en} · {newNote.mn}</h2>
            <p className="mt-3 text-lg">{newNote.note}</p>
            <p className="mt-3 rounded-2xl bg-white/10 p-4">
              Useful phrase: <strong className="font-display text-xl">{newNote.phrase.mn}</strong>
              <br />
              <span className="text-[#f3eadf]/80">({say(newNote.phrase.mn)}) {newNote.phrase.en}</span>
            </p>
            <p className="mt-2 text-sm text-[#f3eadf]/70">Source: {newNote.source}. You can read this again in the Guide.</p>
            <button type="button" autoFocus className={`${BTN} mt-5 bg-[var(--ac)] text-[#10161b]`} onClick={() => update({ ...progress, seasonSeen: reached })}>
              Continue
            </button>
          </section>
        </div>
      )}
    </div>
    {view === "3d" && <div aria-hidden style={{ height: `${(N - 1) * 45 + 100}vh` }} />}
    </>
  );
}
