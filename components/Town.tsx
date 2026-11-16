"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Compass, HeartPulse, House, LogOut, Mountain, Route, Wrench } from "lucide-react";
import { useAuth } from "./Providers";
import { useLearner } from "./useLearner";
import { useReduced } from "./useDecode";
import { Loading } from "./Loading";
import { Logo, TextSizeControl } from "./Nav";
import { CLUSTERS, CURRICULUM, GERS } from "@/lib/curriculum";
import { CHAPTERS, MISSIONS } from "@/lib/fieldLessons";
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
  if (!ready || !progress) return <Loading />;
  return <Suspense fallback={<Loading />}><Journey progress={progress} guest={guest} update={update} /></Suspense>;
}

function initialStop(current: number, requestedPath: string | null, requestedStop: string | null, completed: string[]) {
  if (requestedStop) {
    const found = STOPS.findIndex(stop => (stop.id === requestedStop || stop.units.some(lesson => lesson.id === requestedStop)) && (!requestedPath || stop.path === requestedPath));
    if (found >= 0) return found;
  }
  if (requestedPath === "vocabulary" || requestedPath === "conversation") return nextStop(requestedPath, completed);
  try {
    const saved = sessionStorage.getItem("yarii_stop");
    const previousCurrent = Number(sessionStorage.getItem("yarii_der") ?? current);
    const index = Number(saved);
    if (current > previousCurrent || saved === null || !Number.isInteger(index) || !STOPS[index]) return current;
    return index;
  } catch {
    return current;
  }
}

function Journey({ progress, guest, update }: { progress: Progress; guest: boolean; update: (progress: Progress) => Promise<void> }) {
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
          <header className={styles.siteHeader}>
            <div className={styles.headerInner}>
              <Logo />
              <div className={styles.overall}>
                <span><strong>{pathDone}</strong> / {pathLessons.length} lessons complete</span>
                <progress max={pathLessons.length} value={pathDone} aria-label="Lessons complete" />
              </div>
              <div className={styles.headerActions}>
                <TextSizeControl />
                <button type="button" className={styles.iconButton} onClick={() => guideRef.current?.showModal()} aria-label="Journey guide"><BookOpen size={19} /></button>
                <Link href="/learn/tools" className={styles.iconButton} aria-label={`Learning tools${reviews.length ? `, ${reviews.length} reviews due` : ""}`}><Wrench size={19} />{reviews.length > 0 && <span className={styles.toolDot} />}</Link>
                <button type="button" className={styles.iconButton} aria-label={guest ? "Exit demo" : "Log out"} onClick={() => {
                  if (guest) {
                    endGuest();
                    router.push("/login");
                  } else {
                    void signOut();
                  }
                }}><LogOut size={19} /></button>
              </div>
            </div>
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

              <section className={styles.stopPanel} aria-labelledby="stop-heading" key={selected.id}>
                <p className={styles.eyebrow}>{activePath === "vocabulary" ? "WORD GER" : "GER"} {localIndex + 1} <span aria-hidden> · </span><span lang="mn">{selected.mn}</span></p>
                <h2 id="stop-heading">{selected.name}</h2>
                <p className={styles.stopDescription}>{MISSIONS[selected.units[0].id].scene}</p>
                <ul className={styles.units}>
                  {selected.units.map((lesson) => {
                    const complete = progress.completed.includes(lesson.id);
                    return <li key={lesson.id}>
                      <Link href={`/learn/${lesson.id}`}>
                        <span className={styles.lessonIcon} aria-hidden>{complete ? <Check size={18} /> : <BookOpen size={18} />}</span>
                        <span><strong>{lesson.title}</strong><small>{MISSIONS[lesson.id].goal}</small></span>
                        <ArrowUpRight className={styles.unitArrow} size={19} aria-hidden />
                      </Link>
                    </li>;
                  })}
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
        </section>
      </main>

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
