"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Object3D } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TransformControls } from "three/addons/controls/TransformControls.js";
import type { World } from "./createWorld";
import type { GerDef, Shot, SignDef, Vec3, WorldLayout, WorldSettings } from "@/lib/worldLayout";

/*
  /studio — design the 3D world by hand.
  Orbit around the camp, click a ger or sign to move / rotate / scale it, add or delete things,
  set the 7 chapter camera shots from your current view, preview sunset → night, then Save.
  Save writes lib/worldLayout.json, and the starting page uses it right away.
*/

type Mode = "translate" | "rotate" | "scale";
const r2 = (n: number) => Math.round(n * 100) / 100;
const vec = (v: { x: number; y: number; z: number }): Vec3 => [r2(v.x), r2(v.y), r2(v.z)];

function nextId(prefix: string, ids: string[]) {
  const n = Math.max(0, ...ids.map((id) => Number(id.replace(`${prefix}-`, "")) || 0));
  return `${prefix}-${n + 1}`;
}

function Num({ label, value, step = 0.1, onChange }: { label: string; value: number; step?: number; onChange: (n: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-white/70">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-24 rounded-lg bg-white/10 px-2 py-1 text-right tabular-nums text-white outline-none ring-1 ring-white/15 focus:ring-honey"
      />
    </label>
  );
}

function Slider({ label, value, min, max, step = 0.01, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between text-white/70">
        {label} <span className="tabular-nums text-white">{value.toFixed(2)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="mt-1 w-full accent-[#dab692]" />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 px-4 py-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-honey">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

const btn = "rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/20 disabled:opacity-40";
const btnOn = "rounded-lg bg-[#dab692] px-3 py-1.5 text-sm font-bold text-[#3a2a1f]";

export function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const orbitRef = useRef<OrbitControls | null>(null);
  const gizmoRef = useRef<TransformControls | null>(null);
  const layoutRef = useRef<WorldLayout | null>(null);

  const [layout, setLayoutState] = useState<WorldLayout | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [status, setStatus] = useState("Loading the world…");
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("translate");
  const [story, setStory] = useState(false);
  const [storyT, setStoryT] = useState(0);
  const [tod, setTod] = useState(0.3);
  const [followStory, setFollowStory] = useState(false);

  const setLayout = useCallback((fn: (l: WorldLayout) => WorldLayout) => {
    setLayoutState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      layoutRef.current = next;
      return next;
    });
  }, []);

  /* load layout + build the world + controls */
  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;
    const cleanups: (() => void)[] = [];
    (async () => {
      try {
        const res = await fetch("/api/studio", { cache: "no-store" });
        if (!res.ok) throw new Error((await res.json()).error ?? "Could not load layout");
        const initial = (await res.json()) as WorldLayout;
        const canvas = canvasRef.current;
        if (!canvas || disposed) return;
        const [{ createWorld }, { OrbitControls }, { TransformControls }] = await Promise.all([
          import("./createWorld"),
          import("three/addons/controls/OrbitControls.js"),
          import("three/addons/controls/TransformControls.js"),
        ]);
        const world = await createWorld(canvas, { mobile: false, layout: initial });
        if (disposed) return world.dispose();
        worldRef.current = world;
        const st = world.studio;
        st.setFreeCamera(true);
        st.setTodOverride(0.3);
        st.camera.position.set(46, 30, 72);

        const orbit = new OrbitControls(st.camera, canvas);
        orbit.target.set(0, 2, -2);
        orbit.enableDamping = true;
        orbit.maxPolarAngle = Math.PI * 0.495;
        orbit.maxDistance = 600;
        orbitRef.current = orbit;
        st.onFrame(() => orbit.enabled && orbit.update());

        const gizmo = new TransformControls(st.camera, canvas);
        gizmo.setSize(0.9);
        st.scene.add(gizmo.getHelper());
        gizmo.addEventListener("dragging-changed", (e) => (orbit.enabled = !e.value));
        gizmo.addEventListener("objectChange", () => {
          const o = gizmo.object;
          if (!o) return;
          // keep things standing on the ground, turning only around the vertical axis, scaling evenly
          o.position.y = st.groundHeight(o.position.x, o.position.z);
          o.rotation.x = 0;
          o.rotation.z = 0;
          o.scale.set(o.scale.x, o.scale.x, o.scale.x);
          const id = o.userData.id as string;
          setLayout((l) => ({
            ...l,
            gers: l.gers.map((g) => (g.id === id ? { ...g, x: r2(o.position.x), z: r2(o.position.z), rot: r2(o.rotation.y), scale: r2(o.scale.x) } : g)),
            signs: l.signs.map((s) => (s.id === id ? { ...s, x: r2(o.position.x), z: r2(o.position.z), rot: r2(o.rotation.y) } : s)),
          }));
        });
        gizmoRef.current = gizmo;

        // click (not drag) on the scene to select
        let down: { x: number; y: number } | null = null;
        const ray = new st.THREE.Raycaster();
        const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
        const onUp = (e: PointerEvent) => {
          if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4 || gizmo.dragging) return;
          const r = canvas.getBoundingClientRect();
          ray.setFromCamera(new st.THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), st.camera);
          const hit = ray.intersectObjects(st.pickables(), true)[0];
          let o: Object3D | null = hit?.object ?? null;
          while (o && !o.userData.id) o = o.parent;
          setSelected((o?.userData.id as string) ?? null);
        };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointerup", onUp);
        cleanups.push(() => {
          canvas.removeEventListener("pointerdown", onDown);
          canvas.removeEventListener("pointerup", onUp);
        });

        ro = new ResizeObserver(([e]) => world.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(canvas);
        // handy for debugging from the browser console: window.__studio.world / .orbit
        (window as unknown as { __studio: unknown }).__studio = { world, orbit };
        layoutRef.current = initial;
        setLayoutState(initial);
        setSavedJson(JSON.stringify(initial));
        setStatus("");
        canvas.dataset.ready = "1";
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Something went wrong");
      }
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      cleanups.forEach((f) => f());
      gizmoRef.current?.dispose();
      orbitRef.current?.dispose();
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, [setLayout]);

  /* attach the move/rotate/scale handles to the selected object */
  useEffect(() => {
    const gizmo = gizmoRef.current;
    const st = worldRef.current?.studio;
    if (!gizmo || !st) return;
    const o = selected ? st.pickables().find((p) => p.userData.id === selected) : undefined;
    if (!o) {
      gizmo.detach();
      return;
    }
    const isSign = o.userData.kind === "sign";
    const m: Mode = isSign && mode === "scale" ? "translate" : mode;
    gizmo.setMode(m);
    gizmo.showX = m !== "rotate";
    gizmo.showZ = m !== "rotate";
    gizmo.showY = m === "rotate";
    if (m === "scale") {
      gizmo.showX = true;
      gizmo.showY = false;
      gizmo.showZ = false;
    }
    gizmo.attach(o);
  }, [selected, mode, layout?.signs]);

  /* story preview vs free camera, time of day */
  useEffect(() => {
    const w = worldRef.current;
    if (!w) return;
    w.studio.setFreeCamera(!story);
    if (orbitRef.current) orbitRef.current.enabled = !story;
    if (story) w.setTarget(storyT);
    w.studio.setTodOverride(story && followStory ? null : tod);
  }, [story, storyT, tod, followStory, layout]);

  const sel = layout && selected ? (layout.gers.find((g) => g.id === selected) ?? layout.signs.find((s) => s.id === selected)) : undefined;
  const selIsSign = !!sel && "text" in sel;
  const dirty = !!layout && JSON.stringify(layout) !== savedJson;

  /* ---- actions ---- */
  function updateGer(id: string, patch: Partial<GerDef>) {
    const st = worldRef.current?.studio;
    const o = st?.pickables().find((p) => p.userData.id === id);
    setLayout((l) => {
      const gers = l.gers.map((g) => (g.id === id ? { ...g, ...patch } : g));
      const g = gers.find((x) => x.id === id);
      if (o && g && st) {
        o.position.set(g.x, st.groundHeight(g.x, g.z), g.z);
        o.rotation.y = g.rot;
        o.scale.setScalar(g.scale);
      }
      return { ...l, gers };
    });
  }

  function updateSign(id: string, patch: Partial<SignDef>) {
    const st = worldRef.current?.studio;
    const cur = layoutRef.current?.signs.find((s) => s.id === id);
    if (!st || !cur) return;
    const next = { ...cur, ...patch };
    if (!next.cross) delete next.cross;
    if (!next.stripe) delete next.stripe;
    st.updateSign(next);
    setLayout((l) => ({ ...l, signs: l.signs.map((s) => (s.id === id ? next : s)) }));
  }

  function groundPointAhead() {
    const t = orbitRef.current?.target;
    return { x: r2(t?.x ?? 0), z: r2(t?.z ?? 0) };
  }

  function addGer() {
    const st = worldRef.current?.studio;
    if (!st || !layoutRef.current) return;
    const { x, z } = groundPointAhead();
    const g: GerDef = { id: nextId("ger", layoutRef.current.gers.map((g) => g.id)), x, z, rot: 0, scale: 1 };
    st.addGer(g);
    setLayout((l) => ({ ...l, gers: [...l.gers, g] }));
    setSelected(g.id);
  }

  function addSign() {
    const st = worldRef.current?.studio;
    if (!st || !layoutRef.current) return;
    const { x, z } = groundPointAhead();
    const s: SignDef = { id: nextId("sign", layoutRef.current.signs.map((s) => s.id)), text: "ДЭЛГҮҮР", bg: "#8f5b34", fg: "#ffffff", x, y: 3, z, rot: 0 };
    st.addSign(s);
    setLayout((l) => ({ ...l, signs: [...l.signs, s] }));
    setSelected(s.id);
  }

  const removeSelected = useCallback(() => {
    const st = worldRef.current?.studio;
    if (!st || !selected) return;
    gizmoRef.current?.detach();
    st.remove(selected);
    setLayout((l) => ({ ...l, gers: l.gers.filter((g) => g.id !== selected), signs: l.signs.filter((s) => s.id !== selected) }));
    setSelected(null);
  }, [selected, setLayout]);

  function viewShot(i: number) {
    const st = worldRef.current?.studio;
    const orbit = orbitRef.current;
    const s = layoutRef.current?.shots[i];
    if (!st || !orbit || !s) return;
    setStory(false);
    st.camera.position.set(...s.pos);
    orbit.target.set(...s.look);
    orbit.update();
    setTod(s.tod);
  }

  function setShotFromView(i: number) {
    const st = worldRef.current?.studio;
    const orbit = orbitRef.current;
    if (!st || !orbit) return;
    setLayout((l) => {
      const shots: Shot[] = l.shots.map((s, j) => (j === i ? { ...s, pos: vec(st.camera.position), look: vec(orbit.target), tod: r2(tod) } : s));
      st.setShots(shots);
      return { ...l, shots };
    });
  }

  function setShotTod(i: number, value: number) {
    const st = worldRef.current?.studio;
    setLayout((l) => {
      const shots = l.shots.map((s, j) => (j === i ? { ...s, tod: value } : s));
      st?.setShots(shots);
      return { ...l, shots };
    });
  }

  function setSettings(patch: Partial<WorldSettings>) {
    setLayout((l) => {
      const settings = { ...l.settings, ...patch };
      worldRef.current?.studio.setSettings(settings);
      return { ...l, settings };
    });
  }

  async function save() {
    if (!layout) return;
    setStatus("Saving…");
    const res = await fetch("/api/studio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(layout) });
    const data = await res.json();
    if (res.ok) {
      setSavedJson(JSON.stringify(layout));
      setStatus("Saved ✓ The starting page now uses this layout.");
    } else setStatus(data.error ?? "Could not save");
  }

  async function copyForClaude() {
    const st = worldRef.current?.studio;
    const orbit = orbitRef.current;
    if (!st || !orbit) return;
    const lines = [
      "Mongolingo 3D studio:",
      sel ? `Selected ${sel.id}: ${JSON.stringify(sel)}` : "Nothing selected.",
      `Camera at ${JSON.stringify(vec(st.camera.position))} looking at ${JSON.stringify(vec(orbit.target))}, time of day ${tod.toFixed(2)} (0 = sunset, 1 = night).`,
      "My request: ",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setStatus("Copied. Paste it in your chat with Claude and add what you want.");
    } catch {
      setStatus("Could not copy. Your browser blocked the clipboard.");
    }
  }

  /* keyboard: W move, E rotate, R scale, Delete remove, Esc deselect, F focus */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const k = e.key.toLowerCase();
      if (k === "w") setMode("translate");
      else if (k === "e") setMode("rotate");
      else if (k === "r") setMode("scale");
      else if (k === "escape") setSelected(null);
      else if ((k === "delete" || k === "backspace") && selected) {
        e.preventDefault();
        removeSelected();
      } else if (k === "f" && selected) {
        const o = worldRef.current?.studio.pickables().find((p) => p.userData.id === selected);
        if (o && orbitRef.current) {
          orbitRef.current.target.copy(o.position).setY(o.position.y + 2);
          orbitRef.current.update();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, removeSelected]);

  /* warn before leaving with unsaved changes */
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  return (
    <div className="fixed inset-0 flex bg-[#0f151c] font-sans text-white">
      {/* side panel */}
      <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#141b23]">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div>
            <p className="font-display text-lg font-bold">3D Studio</p>
            <Link href="/" className="text-sm text-white/60 underline underline-offset-4 hover:text-white">
              ← Starting page
            </Link>
          </div>
          <button type="button" onClick={save} disabled={!dirty} className={dirty ? btnOn : btn}>
            {dirty ? "Save" : "Saved"}
          </button>
        </div>
        {status && <p className="mx-4 mb-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">{status}</p>}

        {layout && (
          <>
            <Section title="Camera">
              <div className="flex gap-2">
                <button type="button" className={!story ? btnOn : btn} onClick={() => setStory(false)}>
                  Free camera
                </button>
                <button type="button" className={story ? btnOn : btn} onClick={() => setStory(true)}>
                  Story preview
                </button>
              </div>
              {story ? (
                <Slider label={`Scroll position (chapter ${Math.min(layout.shots.length, Math.floor(storyT) + 1)})`} value={storyT} min={0} max={layout.shots.length - 1} onChange={setStoryT} />
              ) : (
                <p className="text-sm text-white/60">Drag to turn · right-drag to pan · scroll to zoom · click a ger or sign to select it.</p>
              )}
            </Section>

            <Section title="Time of day">
              {story && (
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={followStory} onChange={(e) => setFollowStory(e.target.checked)} className="accent-[#dab692]" />
                  Follow the story
                </label>
              )}
              {!(story && followStory) && <Slider label="0 sunset → 1 night" value={tod} min={0} max={1} onChange={setTod} />}
            </Section>

            <Section title="Add">
              <div className="flex gap-2">
                <button type="button" className={btn} onClick={addGer}>
                  + Ger
                </button>
                <button type="button" className={btn} onClick={addSign}>
                  + Sign
                </button>
              </div>
              <p className="text-xs text-white/50">New things appear where the camera is looking.</p>
            </Section>

            <Section title={sel ? `Selected: ${sel.id}` : "Selected"}>
              {!sel && <p className="text-sm text-white/60">Click a ger or sign in the scene.</p>}
              {sel && (
                <>
                  <div className="flex gap-1.5">
                    {(["translate", "rotate", "scale"] as Mode[])
                      .filter((m) => !(selIsSign && m === "scale"))
                      .map((m, i) => (
                        <button key={m} type="button" className={mode === m ? btnOn : btn} onClick={() => setMode(m)}>
                          {["Move (W)", "Turn (E)", "Size (R)"][i]}
                        </button>
                      ))}
                  </div>
                  {!selIsSign && (
                    <>
                      <Num label="x" value={sel.x} onChange={(n) => updateGer(sel.id, { x: n })} />
                      <Num label="z" value={sel.z} onChange={(n) => updateGer(sel.id, { z: n })} />
                      <Num label="turn" value={sel.rot} onChange={(n) => updateGer(sel.id, { rot: n })} />
                      <Num label="size" value={(sel as GerDef).scale} step={0.05} onChange={(n) => updateGer(sel.id, { scale: Math.max(0.2, n) })} />
                    </>
                  )}
                  {selIsSign && (
                    <>
                      <label className="block text-sm">
                        <span className="text-white/70">Text</span>
                        <input
                          value={(sel as SignDef).text}
                          onChange={(e) => updateSign(sel.id, { text: e.target.value.toUpperCase() })}
                          className="mt-1 w-full rounded-lg bg-white/10 px-2 py-1.5 font-display font-bold text-white outline-none ring-1 ring-white/15 focus:ring-honey"
                        />
                      </label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          Board
                          <input type="color" value={(sel as SignDef).bg} onChange={(e) => updateSign(sel.id, { bg: e.target.value })} />
                        </label>
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          Letters
                          <input type="color" value={(sel as SignDef).fg} onChange={(e) => updateSign(sel.id, { fg: e.target.value })} />
                        </label>
                      </div>
                      <Num label="height" value={(sel as SignDef).y} onChange={(n) => updateSign(sel.id, { y: Math.max(0.8, n) })} />
                      <Num label="turn" value={sel.rot} onChange={(n) => updateSign(sel.id, { rot: n })} />
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input type="checkbox" checked={!!(sel as SignDef).cross} onChange={(e) => updateSign(sel.id, { cross: e.target.checked })} className="accent-[#dab692]" />
                        Pharmacy cross
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={!!(sel as SignDef).stripe}
                          onChange={(e) => updateSign(sel.id, { stripe: e.target.checked ? ["#3a2a1f", "#efe7e5"] : undefined })}
                          className="accent-[#dab692]"
                        />
                        Striped bottom
                      </label>
                    </>
                  )}
                  <button type="button" className={`${btn} mt-1 !bg-[#a2453a]/70`} onClick={removeSelected}>
                    Delete (Del)
                  </button>
                </>
              )}
            </Section>

            <Section title="Chapter camera shots">
              <p className="text-xs text-white/50">Move the free camera where you like, then press “Use view”. The time of day is saved too.</p>
              {layout.shots.map((s, i) => (
                <div key={s.name} className="rounded-xl bg-white/5 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="flex gap-1.5">
                      <button type="button" className={btn} onClick={() => viewShot(i)}>
                        Go
                      </button>
                      <button type="button" className={btn} onClick={() => setShotFromView(i)} disabled={story}>
                        Use view
                      </button>
                    </span>
                  </div>
                  <div className="mt-2">
                    <Slider label="time of day" value={s.tod} min={0} max={1} onChange={(n) => setShotTod(i, r2(n))} />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Look">
              <Slider label="Glow (bloom)" value={layout.settings.bloom} min={0} max={2} onChange={(n) => setSettings({ bloom: n })} />
              <Slider label="Ger lights" value={layout.settings.lights} min={0} max={2} onChange={(n) => setSettings({ lights: n })} />
              <Slider label="Snow" value={layout.settings.snow} min={0} max={2} onChange={(n) => setSettings({ snow: n })} />
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" checked={layout.settings.letters} onChange={(e) => setSettings({ letters: e.target.checked })} className="accent-[#dab692]" />
                Floating letters (chapters 3–5)
              </label>
            </Section>

            <Section title="Ask Claude">
              <p className="text-xs text-white/50">Want something the studio can’t do yet (a horse, smoke, a new chapter)? Copy the scene info and paste it in your chat with Claude.</p>
              <button type="button" className={btn} onClick={copyForClaude}>
                Copy scene info for Claude
              </button>
            </Section>
          </>
        )}
      </aside>

      {/* the scene */}
      <main className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80">
          W move · E turn · R size · Del delete · F focus · Esc deselect
        </div>
      </main>
    </div>
  );
}
