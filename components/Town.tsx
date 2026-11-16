"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, List, Lock, LogOut, Play, Wrench, X } from "lucide-react";
import { usePass } from "@/components/usePass";
import { isFreeGer } from "@/lib/plans";
import { useAuth } from "@/components/Providers";
import { useLearner } from "@/components/useLearner";
import { useReduced } from "@/components/useDecode";
import { Loading } from "@/components/Loading";
import { CLUSTERS, CURRICULUM, GERS, type GerSpec } from "@/lib/curriculum";
import { PER_SEASON, SEASONS, TOTAL_CURRICULUM, curriculumDone, freeExplore, say, seasonOf } from "@/lib/journey";
import { BASE_LESSONS, LESSONS } from "@/lib/lessons";
import { LEARNING_PATHS, VOCABULARY_GERS, type LearningPathId } from "@/lib/learningPaths";
import { dueReviews, endGuest, type Progress } from "@/lib/progress";
import type { Town as TownWorld } from "./world/createTown";
import styles from "./journey.module.css";

const CHAPTER_ICONS = [House, Route, HeartPulse, Mountain];
const STOPS = [
  ...GERS.map((ger) => ({ ...ger, path: "conversation" as LearningPathId, units: CURRICULUM.filter((lesson) => lesson.ger === ger.id) })),
  ...VOCABULARY_GERS.map((ger) => ({ ...ger, path: "vocabulary" as LearningPathId, cluster: "everyday" as const, units: BASE_LESSONS.filter(lesson => lesson.id === ger.lessonId) })),
];

function stopIndices(path: LearningPathId) {
  return STOPS.flatMap((stop, i) => stop.path === path ? [i] : []);
}

function nextStop(path: LearningPathId, completed: string[]) {
  const indices = stopIndices(path);
  return indices.find(i => STOPS[i].units.some(lesson => !completed.includes(lesson.id))) ?? indices[indices.length - 1];
}


const PART: Record<string, string> = { everyday: "Daily life: hello, family, food, room", around: "Travel: taxi, bus, directions", practical: "Help: doctor, pharmacy, emergency", culture: "Culture: ger, animals, holidays" };

export function Town() {
  const { progress, ready, guest, update } = useLearner();
  const { pass, active: hasPass, daysLeft: passDays, ready: passReady } = usePass();
  const lockedGer = (g: GerSpec) => passReady && !hasPass && !isFreeGer(g.id);
  const { signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReduced();
  const done = curriculumDone(progress.completed);
  const reached = seasonOf(done);
  const free = freeExplore(done);
  const conversationCurrent = nextStop("conversation", progress.completed);
  const [index, setIndex] = useState(() => initialStop(conversationCurrent, searchParams.get("path"), searchParams.get("stop"), progress.completed));
  const [seasonChoice, setSeasonChoice] = useState<number | null>(null);
  const [time, setTime] = useState<"auto" | "day" | "night">("auto");
  const heroRef = useRef<HTMLElement>(null);
  const navigationRef = useRef({ index, last: 0, delta: 0 });
  useEffect(() => { navigationRef.current.index = index; }, [index]);
  const guideRef = useRef<HTMLDialogElement>(null);
  const seasonRef = useRef<HTMLDialogElement>(null);
  const selected = STOPS[index];
  const activePath = selected.path;
  const path = LEARNING_PATHS[activePath];
  const indices = stopIndices(activePath);
  const localIndex = indices.indexOf(index);
  const current = nextStop(activePath, progress.completed);
  const pathLessons = indices.flatMap(i => STOPS[i].units);
  const pathDone = pathLessons.filter(lesson => progress.completed.includes(lesson.id)).length;
  const allDone = pathDone === pathLessons.length;
  const chapter = CHAPTERS[selected.cluster];
  const seasonIndex = guest || free ? seasonChoice ?? chapter.season : reached;
  const season = SEASONS[seasonIndex];
  const reviews = dueReviews(progress);
  const newSeason = reached > progress.seasonSeen;

  useEffect(() => {
    try {
      sessionStorage.setItem("yarii_stop", String(index));
      sessionStorage.setItem(`yarii_path_${activePath}`, String(index));
      sessionStorage.setItem("yarii_der", String(conversationCurrent));
      const url = new URL(window.location.href);
      url.searchParams.set("path", activePath);
      url.searchParams.set("stop", selected.units[0].ger ?? selected.units[0].id);
      window.history.replaceState(null, "", url);
    } catch {}
  }, [index, conversationCurrent, activePath, selected]);

  useEffect(() => {
    const dialog = seasonRef.current;
    if (newSeason) dialog?.showModal();
    else dialog?.close();
  }, [newSeason]);

  function goTo(stop: number) {
    stop = Math.max(0, Math.min(STOPS.length - 1, stop));
    setIndex(stop);
    if (STOPS[stop].cluster !== selected.cluster) setSeasonChoice(null);
  }

  function choosePath(target: LearningPathId) {
    if (target === activePath) return;
    let stop = nextStop(target, progress.completed);
    try {
      const saved = sessionStorage.getItem(`yarii_path_${target}`);
      if (saved !== null && STOPS[Number(saved)]?.path === target) stop = Number(saved);
    } catch {}
    goTo(stop);
  }

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const nav = navigationRef.current;
    let touchY = 0;
    const move = (direction: number) => {
      if (performance.now() - nav.last < 950) return;
      nav.last = performance.now(); nav.delta = 0;
      setSeasonChoice(null);
      const route = stopIndices(STOPS[nav.index].path);
      const local = route.indexOf(nav.index);
      setIndex(route[Math.max(0, Math.min(route.length - 1, local + direction))]);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.target instanceof Element && event.target.closest("dialog, select")) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.sign(delta) !== Math.sign(nav.delta)) nav.delta = 0;
      nav.delta += delta;
      if (Math.abs(nav.delta) >= 45) move(Math.sign(nav.delta));
    };
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, dialog")) return;
      if (["ArrowDown", "ArrowRight", "PageDown", "ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault(); move(["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) ? 1 : -1);
      }
    };
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0].clientY; };
    const touchEnd = (event: TouchEvent) => {
      const delta = touchY - event.changedTouches[0].clientY;
      if (Math.abs(delta) > 55) move(Math.sign(delta));
    };
    hero.addEventListener("wheel", wheel, { passive: false });
    hero.addEventListener("touchstart", touchStart, { passive: true });
    hero.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      hero.removeEventListener("wheel", wheel); hero.removeEventListener("touchstart", touchStart);
      hero.removeEventListener("touchend", touchEnd); window.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <div className={styles.shell} style={{ "--accent": chapter.color } as React.CSSProperties}>
      <main>
        <section ref={heroRef} className={styles.hero} id="selected-stop" aria-labelledby="journey-title">
          <div className={styles.worldPane}>
            {<TownScene stop={index} season={seasonIndex} reduced={reduced} onSelect={goTo} time={time} />}
            <div className={styles.worldShade} />
          </div>
        )}
        <div className="flex items-center gap-0.5">
          {QUICK.map((id) => (
            <button key={id} type="button" aria-label={`${GERS.find((g) => g.id === id)!.name} lessons`} title={GERS.find((g) => g.id === id)!.name} className={`${IBTN} ${id === "emergency" ? "bg-[#b4452f]" : "hover:bg-white/10"}`} onClick={() => open(id)}>
              {GERS.find((g) => g.id === id)!.emoji}
            </button>
          ))}
          {passReady && (
            <Link href="/pricing" className={`${BTN} min-h-11 px-3 text-sm ${hasPass ? "hover:bg-white/10" : "bg-[var(--ac)] text-[#10161b]"}`}>
              {hasPass && pass ? `${pass.plan === "trial" ? "Trial" : "Pass"}: ${passDays}d` : "Get Pass"}
            </Link>
          )}
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

          <div className={styles.journeyMain}>
            <div className={styles.intro}>
              <h1 id="journey-title">Explore ger town</h1>
              <select className={styles.pick} aria-label="Choose a road" value={activePath === "vocabulary" ? "vocabulary" : selected.cluster} onChange={(e) => {
                const v = e.target.value;
                if (v === "vocabulary" || v === "conversation") return choosePath(v);
                const chapterStops = STOPS.filter((s) => s.path === "conversation" && s.cluster === v);
                const unfinished = chapterStops.find((s) => s.units.some((l) => !progress.completed.includes(l.id)));
                goTo(STOPS.indexOf(unfinished ?? chapterStops[0]));
              }}>
                <option value="conversation">{LEARNING_PATHS.conversation.title} (all 24)</option>
                {CLUSTERS.map((c, i) => <option key={c.id} value={c.id}>{`  ${i + 1}. ${PART[c.id]}`}</option>)}
                <option value="vocabulary">{LEARNING_PATHS.vocabulary.title}</option>
              </select>
            </div>
            <div className={styles.feature}>
              <div className={styles.worldControls}>
                <div className={styles.worldBottom}>
                  <div aria-live="polite">
                    <p><Mountain size={16} aria-hidden /> {season.en} camp</p>
                    <span>Ger {localIndex + 1} / {indices.length} · Scroll to travel</span>
                  </div>
                  <label className={styles.timeControl}>Light<select aria-label="Time of day" value={time} onChange={e => setTime(e.target.value as typeof time)}><option value="auto">Day cycle</option><option value="day">Day</option><option value="night">Night</option></select></label>
                  <div className={styles.arrows} role="group" aria-label="Move between stops">
                    <button type="button" aria-label="Previous stop" disabled={localIndex === 0} onClick={() => goTo(indices[localIndex - 1])}><ArrowLeft size={20} /></button>
                    <button type="button" aria-label="Next stop" disabled={localIndex === indices.length - 1} onClick={() => goTo(indices[localIndex + 1])}><ArrowRight size={20} /></button>
                  </div>
                </div>
              </div>

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
                              <span className="flex items-center gap-1 text-ink-soft">{progress.completed.includes(l.id) ? <><Check size={16} aria-hidden /> Done</> : lockedGer(g) ? <><Lock size={16} aria-hidden /> Pass</> : "Start"}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                {index !== current && !allDone && <button type="button" className={styles.inlineButton} onClick={() => goTo(current)}>Go to my next stop <ArrowRight size={15} /></button>}
                {free && <label className={styles.seasonPicker}>Camp season
                  <select value={seasonIndex} onChange={(event) => setSeasonChoice(Number(event.target.value))}>
                    {SEASONS.map((entry, i) => <option key={entry.id} value={i}>{entry.en}</option>)}
                  </select>
                </label>}
              </section>
            </div>

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
                    {lockedGer(sel) ? <><Lock size={16} aria-hidden /> Unlock with a Pass</> : <><Play size={16} fill="currentColor" aria-hidden /> {isDone ? "Review lesson" : `${label} lesson`}</>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      <dialog className={styles.dialog} ref={guideRef} aria-labelledby="guide-heading">
        <div className={styles.dialogHeader}><h2 id="guide-heading">Journey guide</h2><button type="button" className={styles.inlineButton} onClick={() => guideRef.current?.close()}>Close</button></div>
        <p>Click a ger to visit it. Scroll down for the next ger, or up for the previous one. You can also use the arrow keys, swipe, or choose a chapter. Each ger has its own lesson card.</p>
        <p>Choose Conversation road for the original 24 gers, or Words &amp; numbers for five gers along the opposite road. Scrolling stays on your chosen path. The word road shares progress with lessons 7–11 in Learning tools.</p>
        <p>Finish {PER_SEASON} different lessons to reach the next camp season. After all {TOTAL_CURRICULUM}, you can choose any season. In the demo each chapter previews a season.</p>
        <ul>{SEASONS.slice(0, guest || free ? SEASONS.length : reached + 1).map((entry) => <li key={entry.id}><strong>{entry.en} · <span lang="mn">{entry.mn}</span></strong><p>{entry.note}</p><p><span lang="mn">{entry.phrase.mn}</span> · {entry.phrase.en}</p><small>{entry.source}</small></li>)}</ul>
        {reviews.length > 0 && <><h3>Reviews due</h3><ul>{reviews.map((id) => <li key={id}><Link href={`/learn/${id}`}>{LESSONS.find((lesson) => lesson.id === id)?.title ?? id}</Link></li>)}</ul></>}
        <Link href="/learn/tools" className={styles.inlineButton}>See learning tools <ArrowUpRight size={15} /></Link>
      </dialog>

      <dialog className={styles.dialog} ref={seasonRef} aria-labelledby="season-heading" onCancel={() => void update({ ...progress, seasonSeen: reached })}>
        <p className={styles.eyebrow}>New camp season</p>
        <h2 id="season-heading">{SEASONS[reached].en} · {SEASONS[reached].mn}</h2>
        <p>{SEASONS[reached].note}</p>
        <p><strong lang="mn">{SEASONS[reached].phrase.mn}</strong> ({say(SEASONS[reached].phrase.mn)})<br />{SEASONS[reached].phrase.en}</p>
        <small>{SEASONS[reached].source}</small>
        <button type="button" className={styles.inlineButton} onClick={() => void update({ ...progress, seasonSeen: reached })}>Continue <ArrowDown size={15} /></button>
      </dialog>
    </div>
  );
}

function TownScene({ stop, season, reduced, onSelect, time }: { stop: number; season: number; reduced: boolean; onSelect: (index: number) => void; time: "auto" | "day" | "night" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<TownWorld | null>(null);
  const seasonRef = useRef(season);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    seasonRef.current = season;
  }, [season]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let visible = true;
    let resize: ResizeObserver | undefined;
    let intersection: IntersectionObserver | undefined;
    const syncActivity = () => worldRef.current?.setActive(visible && !document.hidden);
    const unavailable = () => {
      worldRef.current?.setActive(false);
      setState("unavailable");
    };

    async function load(target: HTMLCanvasElement) {
      setState("loading"); // coming back to the page builds a new world, which must be placed again
      placedSeason.current = null;
      try {
        const { createTown } = await import("./world/createTown");
        if (disposed) return;
        const low = matchMedia("(max-width: 767px)").matches || navigator.hardwareConcurrency <= 4;
        const world = await createTown(target, { low, reduced, season: seasonRef.current });
        if (disposed) return world.dispose();
        worldRef.current = world;
        resize = new ResizeObserver(([entry]) => world.resize(entry.contentRect.width, entry.contentRect.height));
        resize.observe(target);
        intersection = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          syncActivity();
        });
        intersection.observe(target);
        document.addEventListener("visibilitychange", syncActivity);
        target.addEventListener("webglcontextlost", unavailable);
        const bounds = target.getBoundingClientRect();
        world.resize(bounds.width, bounds.height);
        setState("ready");
      } catch {
        if (!disposed) unavailable();
      }
    }
    void load(canvas);
    return () => {
      disposed = true;
      resize?.disconnect();
      intersection?.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      canvas.removeEventListener("webglcontextlost", unavailable);
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, [reduced]);

  const placedSeason = useRef<number | null>(null);
  useEffect(() => {
    if (state !== "ready" || !worldRef.current) return;
    worldRef.current.setSeason(season);
    worldRef.current.setRoute(stop, reduced || placedSeason.current === null);
    worldRef.current.setHover(STOPS[stop].id);
    placedSeason.current = season;
  }, [state, stop, season, reduced]);

  useEffect(() => {
    worldRef.current?.setTime(time === "auto" ? null : time === "night");
  }, [time, state]);

  return <>
    <canvas ref={canvasRef} className={styles.canvas} onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const hit = worldRef.current?.pick((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      event.currentTarget.style.cursor = hit != null ? "pointer" : "grab";
    }} onClick={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const hit = worldRef.current?.pick((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      if (hit != null) onSelect(hit);
    }} style={{ visibility: state === "ready" ? "visible" : "hidden" }} aria-hidden />
    {state !== "ready" && <p className={styles.worldStatus} role="status">{state === "unavailable" ? "Still preview · live 3D unavailable" : "Loading 3D camp…"}</p>}
  </>;
}
