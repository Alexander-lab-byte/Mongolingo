import type { MeshStandardMaterial, SpriteMaterial, Vector3 } from "three";
import { createWorld, type World } from "./createWorld";
import { groundHeight } from "./terrain";
import { SITES, TOWN, trailZ } from "@/lib/journey";

/*
  /learn uses the landing page's real world (createWorld). The camera rides a straight trail forward (-z), low,
  with the gers on both sides. Seasons move the trail to another site, retint the land (World.setSeason) and
  swap the scenery here: leafy / golden / bare trees, snow on roofs and trail, thawing snow patches.
*/

const TOD_STILL = [0.04, 0.3, 0.42, 0.14]; // fixed light for reduced motion
const FLOOR = [0, 0.1, 0.2, 0.04]; // lowest sun of the day: high in summer, low in winter
const PHASE = [0.05, 0.12, 0.2, 0.09]; // where in the day each season starts
const DAY_SECONDS = 240;
const CLOUDS = [0.3, 0.4, 0.5, 0.45]; // base cloud cover
type Env = { canopy: string; cs: number; trail: string; cap: (i: number) => number; patch: number };
const ENV: Env[] = [
  { canopy: "#4f8a3a", cs: 1, trail: "#b89a6a", cap: () => 0, patch: 0 },
  { canopy: "#d99a2b", cs: 0.9, trail: "#9a7a50", cap: () => 0, patch: 0 },
  { canopy: "#8a7a6a", cs: 0, trail: "#e4ebf0", cap: () => 1, patch: 0 },
  { canopy: "#b5d27a", cs: 0.3, trail: "#7a6650", cap: (i) => (i % 3 === 0 ? 0.9 : 0), patch: 1 },
];
export type TownLabel = { id: string; x: number; y: number; v: boolean };
export type Town = {
  setRoute: (t: number, snap?: boolean) => void;
  setSeason: (i: number) => void;
  setHover: (id: string | null) => void;
  setNext: (id: string | null) => void;
  resize: (w: number, h: number) => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
};

function layoutFor(season: number, low: boolean) {
  const S = SITES[season];
  const gers = TOWN.map((d) => ({ id: d.id, x: S.x + d.x, z: S.z + d.z, rot: d.rot, scale: 1 }));
  // each stop: the whole ger seen from the front (door toward us), slightly elevated, 24 units away, sky behind it
  // camera on the road 20 units before each ger, looking ahead at it: forward travel, never through a ger
  const shots = gers.map((g) => {
    const px = g.x + 20, pz = S.z + trailZ(px - S.x);
    return { name: g.id, pos: [px, groundHeight(px, pz) + 7, pz] as [number, number, number], look: [g.x, groundHeight(g.x, g.z) + 2.2, g.z] as [number, number, number], tod: TOD_STILL[season] };
  });
  return { gers, shots, signs: [], settings: { bloom: low ? 0.5 : 1, lights: 1, snow: 1, letters: false } };
}

export async function createTown(canvas: HTMLCanvasElement, opts: { low: boolean; reduced: boolean; season: number; onLabels: (l: TownLabel[]) => void }): Promise<Town> {
  let season = Math.max(0, Math.min(3, opts.season | 0));
  const world: World = await createWorld(canvas, { mobile: opts.low, layout: layoutFor(season, opts.low) });
  const st = world.studio;
  const { THREE, camera, scene } = st;
  world.setSeason(season);

  /* rings: hovered/selected ger (gold), next lesson (green) */
  const mkRing = (a: number, b: number, color: string) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(a, b, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    r.rotation.x = -Math.PI / 2;
    r.visible = false;
    scene.add(r);
    return r;
  };
  const hoverRing = mkRing(5.6, 6.5, "#f2c46d");
  const nextRing = mkRing(6.8, 7.5, "#8fd16a");
  const at = (id: string) => {
    const d = TOWN.find((x) => x.id === id)!;
    const S = SITES[season];
    return new THREE.Vector3(S.x + d.x, groundHeight(S.x + d.x, S.z + d.z), S.z + d.z);
  };
  let hoverId: string | null = null;
  let nextId: string | null = null;
  const place = (ring: typeof hoverRing, id: string | null) => {
    ring.visible = !!id;
    if (id) ring.position.copy(at(id)).setY(at(id).y + 0.2);
  };

  /* scenery: trail ribbon, trees, roof snow, thawing patches (shared geometry, instanced) */
  const TR = 120;
  const trGeo = new THREE.BufferGeometry();
  const trPos = new Float32Array(TR * 6);
  const trIdx: number[] = [];
  for (let i = 0; i < TR - 1; i++) trIdx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  trGeo.setAttribute("position", new THREE.BufferAttribute(trPos, 3));
  trGeo.setIndex(trIdx);
  const trMat = new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  const trail = new THREE.Mesh(trGeo, trMat);
  trail.frustumCulled = false;
  const treeN = opts.low ? 8 : 14;
  const std = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true });
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.45, 3.2, 6), std("#5a3a22"), treeN);
  const boughs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.16, 2.2, 5), std("#5a3a22"), treeN * 3);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 0), std("#ffffff"), treeN);
  const caps = new THREE.InstancedMesh(new THREE.ConeGeometry(4.65, 1.9, 32), new THREE.MeshStandardMaterial({ color: "#f4f7fa", roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), TOWN.length);
  const patchN = opts.low ? 18 : 36;
  const patches = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), new THREE.MeshStandardMaterial({ color: "#f4f7fa", roughness: 1, polygonOffset: true, polygonOffsetFactor: -3 }), patchN);
  scene.add(trail, trunks, boughs, crowns, caps, patches);
  // number plates lying flat on the white roof felt, on the door side (unlit, so they stay readable at night)
  const plateGeo = new THREE.PlaneGeometry(1.9, 1.9);
  const plates = TOWN.map((d) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    x.fillStyle = "#f6ece0";
    x.beginPath();
    x.roundRect(4, 4, 120, 120, 24);
    x.fill();
    x.fillStyle = "#3a2a1f";
    x.font = "800 72px 'Montserrat Variable', sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(String(d.i + 1), 64, 70);
    const m = new THREE.Mesh(plateGeo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), toneMapped: false, transparent: true }));
    m.rotation.set(-1.19, d.rot, 0, "YXZ"); // tilted to the roof slope
    scene.add(m);
    return m;
  });
  const M = new THREE.Matrix4();
  const Q = new THREE.Quaternion();
  const E = new THREE.Euler();
  const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  const treeAt: Vector3[] = [];
  const patchAt: { p: Vector3; s: number }[] = [];
  const cur = { cs: ENV[season].cs, patch: ENV[season].patch, canopy: new THREE.Color(ENV[season].canopy), trail: new THREE.Color(ENV[season].trail), caps: TOWN.map((d) => ENV[season].cap(d.i)) };
  let anim = true;

  function build() {
    const S = SITES[season];
    for (let i = 0; i < TR; i++) {
      const x = S.x + 10 - (i / (TR - 1)) * 530, z = S.z + trailZ(x - S.x); // the road
      for (const sg of [-1, 1]) trPos.set([x, groundHeight(x, z + sg * 1.4) + 0.12, z + sg * 1.4], i * 6 + (sg < 0 ? 0 : 3));
    }
    trGeo.attributes.position.needsUpdate = true;
    trGeo.computeVertexNormals();
    treeAt.length = 0;
    for (let i = 0; i < treeN; i++) {
      const x = S.x - 10 - i * (520 / treeN), z = S.z + trailZ(x - S.x) - 24 - (i % 3) * 5; // trees behind the row
      treeAt.push(new THREE.Vector3(x, groundHeight(x, z), z));
      trunks.setMatrixAt(i, M.makeTranslation(x, treeAt[i].y + 1.6, z));
      for (let b = 0; b < 3; b++) {
        Q.setFromEuler(E.set(0.7 * Math.cos(b * 2.1 + i), b * 2.1, 0.7 * Math.sin(b * 2.1 + i), "YXZ"));
        boughs.setMatrixAt(i * 3 + b, M.compose(new THREE.Vector3(x, treeAt[i].y + 3.8, z), Q, new THREE.Vector3(1, 1, 1)));
      }
    }
    patchAt.length = 0;
    for (let i = 0; i < patchN; i++) {
      const a = Math.sin(i * 12.9898) * 43758.5453, b = Math.sin(i * 78.233) * 12345.678;
      const z = S.z + ((a % 1) - 0.5) * 70, x = S.x - Math.abs(b % 1) * 520;
      patchAt.push({ p: new THREE.Vector3(x, groundHeight(x, z) + 0.2, z), s: 1.5 + Math.abs((a * b) % 1) * 3.5 });
    }
    TOWN.forEach((d, i) => plates[i].position.copy(at(d.id)).add(new THREE.Vector3(Math.sin(d.rot) * 2.5, 3.47, Math.cos(d.rot) * 2.5)));
    trunks.instanceMatrix.needsUpdate = boughs.instanceMatrix.needsUpdate = true;
    anim = true;
  }
  function paint() {
    (crowns.material as MeshStandardMaterial).color.copy(cur.canopy);
    trMat.color.copy(cur.trail);
    const one = new THREE.Vector3(1, 1, 1);
    treeAt.forEach((p, i) => {
      const s = Math.max(0.001, cur.cs);
      crowns.setMatrixAt(i, M.compose(new THREE.Vector3(p.x, p.y + 4.4, p.z), Q.identity(), one.clone().multiplyScalar(s).setY(s * 1.15)));
    });
    TOWN.forEach((d, i) => {
      const p = at(d.id), s = Math.max(0.001, cur.caps[i]);
      caps.setMatrixAt(i, M.compose(new THREE.Vector3(p.x, p.y + 3.55, p.z), Q.identity(), new THREE.Vector3(s, s, s)));
    });
    patchAt.forEach((q, i) => {
      const s = Math.max(0.001, q.s * cur.patch);
      patches.setMatrixAt(i, M.compose(q.p, flat, new THREE.Vector3(s, s, s)));
    });
    for (const m of [crowns, caps, patches]) m.instanceMatrix.needsUpdate = true;
  }
  function ease(dt: number) {
    if (!anim) return;
    const k = opts.reduced ? 1 : 1 - Math.exp(-dt * 1.5), T = ENV[season];
    let d = Math.abs(T.cs - cur.cs) + Math.abs(T.patch - cur.patch);
    cur.cs += (T.cs - cur.cs) * k;
    cur.patch += (T.patch - cur.patch) * k;
    cur.caps = cur.caps.map((c, i) => {
      const t = T.cap(i);
      d += Math.abs(t - c);
      return c + (t - c) * k;
    });
    cur.canopy.lerp(new THREE.Color(T.canopy), k);
    cur.trail.lerp(new THREE.Color(T.trail), k);
    paint();
    if (d < 0.004) anim = false;
  }
  build();

  /* clouds: soft sprites drifting around the camera; cover and darkness follow the season, rain and the hour */
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const cx = cv.getContext("2d")!;
  const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,0.9)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 64, 64);
  const cloudTex = new THREE.CanvasTexture(cv);
  const CN = opts.low ? 6 : 10;
  const clouds = Array.from({ length: CN }, (_, j) => {
    const m = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0 });
    const sp = new THREE.Sprite(m);
    const a = (j / CN) * Math.PI * 2;
    sp.userData = { a, r: 220 + (j % 3) * 50, y: 80 + (j % 4) * 18, k: j / CN };
    sp.scale.set(190 + (j % 3) * 40, 60, 1);
    sp.renderOrder = -1;
    scene.add(sp);
    return sp;
  });
  let clock = PHASE[season];
  let floor = FLOOR[season];
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  let tod = TOD_STILL[season];
  let cover = CLOUDS[season];
  const dayStep = (dt: number) => {
    if (opts.reduced) {
      st.setTodOverride(TOD_STILL[season]);
      tod = TOD_STILL[season];
      return;
    }
    clock = (clock + dt / DAY_SECONDS) % 1;
    floor += (FLOOR[season] - floor) * (1 - Math.exp(-dt));
    // day -> sunset -> night -> dawn -> day (mirrored ramp: the sky, sun, moon, stars and ger lights all follow tod)
    tod = Math.max(floor, 0.8 * (1 - Math.abs(2 * clock - 1))); // never fully dark: the ger stays readable
    st.setTodOverride(tod);
  };
  const cloudStep = (dt: number) => {
    const w = world.weather();
    cover += (Math.min(1, CLOUDS[season] + w * 1.2) - cover) * (1 - Math.exp(-dt * 0.5));
    const bright = (1 - sm(0.25, 0.85, tod) * 0.88) * (1 - Math.min(1, w) * 0.45);
    const drift = opts.reduced ? 0 : dt * 0.004;
    for (const c of clouds) {
      const u = c.userData;
      u.a += drift;
      c.position.set(camera.position.x + Math.cos(u.a) * u.r, u.y, camera.position.z + Math.sin(u.a) * u.r);
      const m = c.material as SpriteMaterial;
      m.color.setScalar(bright);
      m.opacity += ((u.k < cover ? 0.8 : 0) - m.opacity) * (1 - Math.exp(-dt));
    }
  };

  /* labels: project each ger, keep nearby on-screen ones, nearest first, drop any that would overlap */
  const labels: TownLabel[] = TOWN.map((d) => ({ id: d.id, x: 0, y: 0, v: false }));
  let W = 1, H = 1;
  const v = new THREE.Vector3();
  st.onFrame((dt) => {
    ease(dt);
    dayStep(dt);
    cloudStep(dt);
    camera.updateMatrixWorld();
    const cand: { L: TownLabel; d: number }[] = [];
    for (const L of labels) {
      const p = at(L.id);
      const d = p.distanceTo(camera.position);
      v.copy(p).setY(p.y + 5.2).project(camera);
      L.x = (v.x * 0.5 + 0.5) * W;
      L.y = (-v.y * 0.5 + 0.5) * H;
      L.v = false;
      if (v.z < 1 && Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.95 && d < 80) cand.push({ L, d: L.id === hoverId ? -1 : d });
    }
    const kept: TownLabel[] = [];
    for (const { L } of cand.sort((a, b) => a.d - b.d)) {
      if (kept.every((k) => Math.abs(k.x - L.x) > 150 || Math.abs(k.y - L.y) > 38)) {
        L.v = true;
        kept.push(L);
      }
    }
    opts.onLabels(labels);
  });
  paint();

  return {
    setRoute: (t, snap) => world.setTarget(t, snap),
    setSeason: (i) => {
      const n = Math.max(0, Math.min(3, i | 0));
      if (n === season) return;
      for (const d of TOWN) st.remove(d.id);
      season = n;
      const lay = layoutFor(n, opts.low);
      lay.gers.forEach((g) => st.addGer(g));
      st.setShots(lay.shots);
      world.setSeason(n);
      build();
      place(hoverRing, hoverId);
      place(nextRing, nextId);
    },
    setHover: (id) => {
      hoverId = id;
      place(hoverRing, id);
    },
    setNext: (id) => {
      nextId = id;
      place(nextRing, id);
    },
    resize: (w, h) => {
      W = w;
      H = h;
      world.resize(w, h);
    },
    setActive: world.setActive,
    dispose: world.dispose,
  };
}
