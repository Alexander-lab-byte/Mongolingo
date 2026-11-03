import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import type { GerDef, Shot, SignDef, WorldLayout, WorldSettings } from "@/lib/worldLayout";
import { groundHeight } from "./terrain";
import { makeAnimals, makeCampProps, makeFlowers, makeGerKit, makeGrass, makeGround, makeOvoo, makeRanges, makeRiver, makeRocks, makeSmoke, makeTracks } from "./props";

/*
  Mongolingo world — a ger camp on the steppe, from dusk to night.
  Everything is built from code at runtime (no 3D files to download).
  The page tells us where we are in the story with setTarget(t), t = 0..6 (one step per chapter).
  The camera flies between 7 shots, the sky goes from sunset to night, ger crowns and doors light up,
  Cyrillic letters rise into the sky, signs glow, and snow starts to fall.
*/

/* Extra handles the /studio editor uses. The starting page never touches these. */
export type WorldStudio = {
  THREE: typeof THREE;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  pickables: () => THREE.Object3D[];
  setFreeCamera: (on: boolean) => void;
  setTodOverride: (tod: number | null) => void;
  setShots: (shots: Shot[]) => void;
  setSettings: (s: WorldSettings) => void;
  addGer: (g: GerDef) => THREE.Object3D;
  addSign: (d: SignDef) => THREE.Object3D;
  updateSign: (d: SignDef) => THREE.Object3D;
  remove: (id: string) => void;
  groundHeight: (x: number, z: number) => number;
  onFrame: (fn: (dt: number) => void) => void;
  getTod: () => number;
};

export type World = {
  setTarget: (t: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: (w: number, h: number) => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
  studio: WorldStudio;
};

const P = {
  blush: "#e8dfe0",
  sage: "#8d9b6a",
  mist: "#8a9ea7",
  tan: "#dab692",
  brown: "#8f5b34",
  felt: "#efe7e5",
  cream: "#f6ece0",
};

/* ---------- small math helpers ---------- */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Stops for time of day (tod 0 = sunset, 1 = deep night). */
const TOD = [0, 0.35, 0.65, 1];
function ramp(values: number[], tod: number) {
  for (let i = 0; i < TOD.length - 1; i++) {
    if (tod <= TOD[i + 1]) return lerp(values[i], values[i + 1], (tod - TOD[i]) / (TOD[i + 1] - TOD[i]));
  }
  return values[values.length - 1];
}
function rampColor(hexes: string[], tod: number, out: THREE.Color) {
  const cs = hexes.map((h) => new THREE.Color(h));
  for (let i = 0; i < TOD.length - 1; i++) {
    if (tod <= TOD[i + 1]) return out.copy(cs[i]).lerp(cs[i + 1], (tod - TOD[i]) / (TOD[i + 1] - TOD[i]));
  }
  return out.copy(cs[cs.length - 1]);
}

const SKY_TOP = ["#8a9ea7", "#6f7f93", "#2e3a47", "#0f151c"];
const SKY_HORIZON = ["#ecc9a9", "#d2a59f", "#5d5868", "#1d2630"];
const SUN = ["#ffd3a1", "#ff9c6b", "#3a1e18", "#000000"];
const HEMI_SKY = ["#e6e2e3", "#b9a8b2", "#4e5f69", "#24303a"];
const HEMI_GROUND = ["#8d9b6a", "#6c6955", "#2d3227", "#141812"];

/* ---------- canvas textures (Cyrillic signs and letters) ---------- */
const FONT = '"Montserrat Variable", "Onest Variable", system-ui, sans-serif';

function signTexture(text: string, bg: string, fg: string, opts: { stripe?: [string, string]; cross?: boolean } = {}) {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 256;
  const x = cv.getContext("2d")!;
  x.fillStyle = bg;
  x.beginPath();
  x.roundRect(8, 8, 1008, 240, 34);
  x.fill();
  x.lineWidth = 10;
  x.strokeStyle = "rgba(255,255,255,0.35)";
  x.stroke();
  let left = 512;
  if (opts.cross) {
    x.fillStyle = fg;
    x.fillRect(86, 78, 100, 100 / 3);
    x.fillRect(86 + 100 / 3, 45, 100 / 3, 166);
    x.fillRect(86, 111, 100, 34);
    left = 570;
  }
  x.fillStyle = fg;
  x.font = `800 ${text.length > 8 ? 112 : 132}px ${FONT}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(text, left, opts.stripe ? 112 : 132);
  if (opts.stripe) {
    for (let i = 0; i < 24; i++) {
      x.fillStyle = i % 2 ? opts.stripe[0] : opts.stripe[1];
      x.fillRect(40 + i * 39.3, 196, 39.3, 30);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function letterTexture(ch: string) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const x = cv.getContext("2d")!;
  x.font = `800 170px ${FONT}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = "rgba(255, 214, 160, 0.9)";
  x.shadowBlur = 26;
  x.fillStyle = P.cream;
  x.fillText(ch, 128, 140);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function dotTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const x = cv.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

/* ---------- sky ---------- */
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uMoonDir: { value: new THREE.Vector3(0.42, 0.5, -0.76).normalize() },
      uMoon: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uSun, uSunDir, uMoonDir;
      uniform float uMoon;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 c = mix(uHorizon, uTop, smoothstep(-0.02, 0.6, y));
        c = mix(uHorizon * 0.82, c, smoothstep(-0.25, 0.0, y));
        float s = max(dot(d, normalize(uSunDir)), 0.0);
        c += uSun * (smoothstep(0.9975, 0.9985, s) * 2.2 + pow(s, 14.0) * 0.45 + pow(s, 3.0) * 0.18);
        float m = max(dot(d, uMoonDir), 0.0);
        c += vec3(1.0, 0.96, 0.9) * uMoon * (smoothstep(0.99935, 0.99955, m) * 3.0 + pow(m, 80.0) * 0.25);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  return mesh;
}

/* ================================================================== */

export async function createWorld(canvas: HTMLCanvasElement, opts: { mobile: boolean; layout: WorldLayout }): Promise<World> {
  let settings = { ...opts.layout.settings };
  let shots = opts.layout.shots;
  try {
    await Promise.all([document.fonts.load(`800 100px "Montserrat Variable"`), document.fonts.ready]);
  } catch {}

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe8dfe0, 80, 900);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);

  /* lights */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8d9b6a, 1);
  const sun = new THREE.DirectionalLight(0xffd9b0, 2);
  const moon = new THREE.DirectionalLight(0x9fb3c8, 0);
  moon.position.set(120, 160, -200);
  scene.add(hemi, sun, moon);

  /* sky + stars + moon */
  const sky = makeSky();
  scene.add(sky);
  const starGeo = new THREE.BufferGeometry();
  const starCount = opts.mobile ? 900 : 1800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(1 - Math.random() * 0.95);
    starPos.set([Math.sin(v) * Math.cos(u) * 820, Math.cos(v) * 820 + 20, Math.sin(v) * Math.sin(u) * 820], i * 3);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfff6ea, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, map: dotTexture() });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  scene.add(stars);

  /* land: ground, mountains, river, tracks, grass, rocks, flowers */
  const river = makeRiver();
  const WATER_DEEP = new THREE.Color("#121a1f");
  const grass = makeGrass(opts.mobile);
  scene.add(makeGround(opts.mobile), makeRanges(opts.mobile), river.mesh, makeTracks(), grass.mesh, makeRocks(opts.mobile), makeFlowers(opts.mobile));

  /* ger camp (from the layout file) */
  const kit = makeGerKit();
  const byId = new Map<string, THREE.Object3D>();
  const maxLights = opts.mobile ? 2 : 4;
  function addGer(d: GerDef) {
    const g = kit.ger(d.x, d.z, d.rot, d.scale, kit.glow.lights.length < maxLights);
    g.userData = { kind: "ger", id: d.id };
    scene.add(g);
    byId.set(d.id, g);
    return g;
  }
  // doors face roughly toward the south (+z), like real gers
  opts.layout.gers.forEach(addGer);

  const postMat = new THREE.MeshStandardMaterial({ color: "#6b4426" });

  /* hitching line (уяа) */
  const postMatH = postMat;
  const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 6);
  for (const x of [14, 22]) {
    const p = new THREE.Mesh(postGeo, postMatH);
    p.position.set(x, 1.1, 12);
    scene.add(p);
  }
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 8, 4), postMatH);
  rope.rotation.z = Math.PI / 2;
  rope.position.set(18, 1.9, 12);
  scene.add(rope);

  /* ovoo with blue khadag, camp life, animals, chimney smoke */
  const ovoo = makeOvoo();
  const camp = makeCampProps();
  const animals = makeAnimals(opts.mobile);
  const smoke = makeSmoke(kit.chimneys, opts.mobile);
  scene.add(ovoo.group, camp.group, animals.group, smoke.points);

  /* glowing street signs (from the layout file) */
  const signMats = new Set<THREE.MeshBasicMaterial>();
  const boardGeo = new THREE.PlaneGeometry(4, 1);
  function addSign(d: SignDef) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ map: signTexture(d.text, d.bg, d.fg, { cross: d.cross, stripe: d.stripe }), toneMapped: false, side: THREE.DoubleSide });
    const board = new THREE.Mesh(boardGeo, mat);
    board.position.y = d.y;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, Math.max(0.2, d.y - 0.5), 6), postMat);
    post.position.y = Math.max(0.2, d.y - 0.5) / 2;
    g.add(board, post);
    g.position.set(d.x, groundHeight(d.x, d.z), d.z);
    g.rotation.y = d.rot;
    g.userData = { kind: "sign", id: d.id };
    scene.add(g);
    byId.set(d.id, g);
    signMats.add(mat);
    return g;
  }
  function remove(id: string) {
    const o = byId.get(id);
    if (!o) return;
    kit.forget(o);
    scene.remove(o);
    byId.delete(id);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.material instanceof THREE.MeshBasicMaterial) {
        signMats.delete(m.material);
        m.material.map?.dispose();
        m.material.dispose();
      }
    });
  }
  opts.layout.signs.forEach(addSign);

  /* Cyrillic letters rising into the sky */
  const ABC = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".split("");
  const letters = ABC.map((ch, i) => {
    const mat = new THREE.SpriteMaterial({ map: letterTexture(ch), transparent: true, opacity: 0, depthWrite: false, fog: false });
    const s = new THREE.Sprite(mat);
    const a = lerp(-1.25, 1.25, i / (ABC.length - 1));
    const row = i % 3;
    const base = new THREE.Vector3(Math.sin(a) * (64 + row * 10), 26 + row * 9 + Math.cos(a * 3) * 4, -Math.cos(a) * (64 + row * 10) - 20);
    s.position.copy(base);
    s.scale.setScalar(7.5 - row);
    scene.add(s);
    return { s, mat, base, phase: i * 0.7 };
  });

  /* snow */
  const snowCount = opts.mobile ? 900 : 2200;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  const snowSpeed = new Float32Array(snowCount);
  for (let i = 0; i < snowCount; i++) {
    snowPos.set([(Math.random() - 0.5) * 140, Math.random() * 60, (Math.random() - 0.5) * 140], i * 3);
    snowSpeed[i] = 1.2 + Math.random() * 1.8;
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0, depthWrite: false, map: dotTexture() });
  const snow = new THREE.Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  scene.add(snow);

  /* post-processing: soft bloom so lights glow */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* camera path */
  let posCurve: THREE.CatmullRomCurve3;
  let lookCurve: THREE.CatmullRomCurve3;
  function setShots(next: Shot[]) {
    shots = next;
    posCurve = new THREE.CatmullRomCurve3(shots.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal");
    lookCurve = new THREE.CatmullRomCurve3(shots.map((s) => new THREE.Vector3(...s.look)), false, "centripetal");
  }
  setShots(shots);
  let freeCamera = false;
  let todOverride: number | null = null;
  let lastTod = 0;
  const frameHooks: ((dt: number) => void)[] = [];

  let target = 0;
  let current = 0;
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  let active = true;
  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const right = new THREE.Vector3();
  const col = new THREE.Color();

  function todAt(t: number) {
    const i = Math.min(Math.floor(t), shots.length - 2);
    return lerp(shots[i].tod, shots[i + 1].tod, clamp01(t - i));
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!active) return;
    elapsed += dt;

    current += (target - current) * (1 - Math.exp(-dt * 3.2));
    pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    const u = clamp01(current / (shots.length - 1));
    const tod = todOverride ?? todAt(current);
    lastTod = tod;
    const glow = smooth(0.2, 0.62, tod);

    /* camera (in the studio's free mode, the orbit controls move it instead) */
    if (!freeCamera) {
      posCurve.getPoint(u, tmpA);
      lookCurve.getPoint(u, tmpB);
      right.subVectors(tmpB, tmpA).cross(camera.up).normalize();
      tmpA.addScaledVector(right, pointerSmooth.x * 1.6);
      tmpA.y += -pointerSmooth.y * 0.9 + Math.sin(elapsed * 0.35) * 0.15;
      camera.position.copy(tmpA);
      camera.lookAt(tmpB);
    }
    for (const fn of frameHooks) fn(dt);

    /* sky and light */
    const su = sky.material.uniforms;
    rampColor(SKY_TOP, tod, su.uTop.value);
    rampColor(SKY_HORIZON, tod, su.uHorizon.value);
    rampColor(SUN, tod, su.uSun.value);
    const el = lerp(0.1, -0.16, smooth(0, 0.5, tod));
    const az = -0.42;
    su.uSunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
    su.uMoon.value = smooth(0.5, 0.85, tod);
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    starMat.opacity = smooth(0.45, 0.85, tod) * (0.85 + Math.sin(elapsed * 1.7) * 0.05);

    (scene.fog as THREE.Fog).color.copy(rampColor(SKY_HORIZON, tod, col));
    (scene.fog as THREE.Fog).far = lerp(900, 620, tod);
    rampColor(HEMI_SKY, tod, hemi.color);
    rampColor(HEMI_GROUND, tod, hemi.groundColor);
    hemi.intensity = ramp([1.25, 1.0, 0.6, 0.42], tod);
    sun.color.copy(rampColor(["#ffe0bd", "#ff9e6e", "#ff7a50", "#000000"], tod, col));
    sun.intensity = ramp([2.2, 1.3, 0.15, 0], tod);
    sun.position.copy(su.uSunDir.value).multiplyScalar(300);
    moon.intensity = ramp([0, 0, 0.4, 0.65], tod);

    /* camp lights */
    kit.glow.mats[0].emissiveIntensity = glow * 3.2 * settings.lights; // crown (toono)
    kit.glow.mats[1].emissiveIntensity = glow * 1.6 * settings.lights; // door
    kit.glow.lights.forEach((l, i) => (l.intensity = glow * settings.lights * (5 + Math.sin(elapsed * 6 + i * 2) * 0.5)));
    for (const m of signMats) m.color.setScalar(0.85 + glow * 0.45);

    /* letters: rise in the alphabet chapter (03), stay as a faint constellation through method (05), then fade */
    const lv = (settings.letters ? 1 : 0) * smooth(1.25, 2, current) * (1 - smooth(2.9, 3.6, current) * 0.82) * (1 - smooth(4.15, 4.75, current));
    for (const L of letters) {
      L.mat.opacity = lv;
      L.mat.color.setScalar(1 + glow * 0.6);
      L.s.position.set(L.base.x, L.base.y - (1 - lv) * 18 + Math.sin(elapsed * 0.8 + L.phase) * 0.8, L.base.z);
    }

    /* wind, smoke, animals, river */
    ovoo.update(elapsed);
    camp.update(elapsed);
    grass.update(elapsed);
    animals.update(dt, elapsed);
    smoke.update(dt, elapsed);
    smoke.mat.uniforms.uColor.value.copy(rampColor(["#ddd5cf", "#c9b9b4", "#5d5a63", "#3a3f48"], tod, col));
    smoke.mat.uniforms.uOpacity.value = ramp([0.35, 0.38, 0.32, 0.28], tod);
    smoke.mat.uniforms.uScale.value = renderer.domElement.height / 900;
    // the water mirrors the sky: warm at sunset, dark blue with a moon sheen at night
    river.mat.color.copy(WATER_DEEP);
    river.mat.emissive.copy(su.uTop.value).lerp(su.uHorizon.value, 0.4).multiplyScalar(ramp([0.16, 0.14, 0.07, 0.04], tod));

    /* snow follows the camera */
    snowMat.opacity = Math.min(1, smooth(0.55, 0.9, tod) * 0.85 * settings.snow);
    if (snowMat.opacity > 0.01) {
      const arr = snowGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < snowCount; i++) {
        let y = arr.getY(i) - snowSpeed[i] * dt;
        let x = arr.getX(i) + Math.sin(elapsed + i) * 0.01;
        let z = arr.getZ(i);
        if (y < camera.position.y - 25) y += 60;
        if (y > camera.position.y + 35) y -= 60;
        if (x < camera.position.x - 70) x += 140;
        if (x > camera.position.x + 70) x -= 140;
        if (z < camera.position.z - 70) z += 140;
        if (z > camera.position.z + 70) z -= 140;
        arr.setXYZ(i, x, y, z);
      }
      arr.needsUpdate = true;
    }

    bloom.strength = lerp(0.3, 0.7, glow) * settings.bloom;
    composer.render(dt);
  }
  raf = requestAnimationFrame(frame);

  function resize(w: number, h: number) {
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 62 : camera.aspect < 1.2 ? 52 : 42;
    camera.updateProjectionMatrix();
  }

  return {
    setTarget: (t) => (target = Math.max(0, Math.min(shots.length - 1, t))),
    setPointer: (x, y) => pointer.set(x, y),
    resize,
    setActive: (on) => {
      active = on;
      last = performance.now();
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
          mat.dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
    },
    studio: {
      THREE,
      scene,
      camera,
      canvas,
      pickables: () => [...byId.values()],
      setFreeCamera: (on) => (freeCamera = on),
      setTodOverride: (t) => (todOverride = t),
      setShots,
      setSettings: (next) => (settings = { ...next }),
      addGer,
      addSign,
      updateSign: (d) => {
        remove(d.id);
        return addSign(d);
      },
      remove,
      groundHeight,
      onFrame: (fn) => frameHooks.push(fn),
      getTod: () => lastTod,
    },
  };
}
