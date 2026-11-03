import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/*
  Mongolingo world — a ger camp on the steppe, from dusk to night.
  Everything is built from code at runtime (no 3D files to download).
  The page tells us where we are in the story with setTarget(t), t = 0..6 (one step per chapter).
  The camera flies between 7 shots, the sky goes from sunset to night, ger crowns and doors light up,
  Cyrillic letters rise into the sky, signs glow, and snow starts to fall.
*/

export type World = {
  setTarget: (t: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: (w: number, h: number) => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
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

/* Seven camera shots, one per chapter: [position, look-at]. Camp centre is (0, 0, 0). */
const SHOTS: [number, number, number][][] = [
  [[34, 20, 92], [-22, 7, -30]], // 01 hero — wide over the steppe at sunset
  [[-30, 11, 58], [8, 3, -2]], // 02 translate — gliding toward camp
  [[22, 5, 34], [-6, 3, -4]], // 03 first word — at the edge of camp, first lights
  [[-4, 7, 22], [6, 34, -60]], // 04 alphabet — look up, letters rise into the sky
  [[13, 2.6, 15], [-5, 2.9, -2]], // 05 signs — eye level, the glowing signs
  [[-38, 13, -14], [-66, 15, -60]], // 06 method — the ovoo on the hill, stars
  [[8, 44, 118], [0, 2, 0]], // 07 start — pull back, the whole camp glowing
];
const SHOT_TOD = [0, 0.16, 0.34, 0.52, 0.68, 0.86, 1];

/* ---------- terrain ---------- */
const OVOO = new THREE.Vector2(-64, -58);
function groundHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  let h = Math.sin(x * 0.012) * 6 + Math.cos(z * 0.015) * 5 + Math.sin((x + z) * 0.03) * 2.2 + Math.sin(x * 0.07 + z * 0.05) * 0.8 + 6;
  h *= smooth(48, 130, d); // flat camp ground
  const o = (x - OVOO.x) ** 2 + (z - OVOO.y) ** 2;
  h += 13 * Math.exp(-o / (2 * 17 * 17)); // the ovoo hill
  if (d > 360) h += (d - 360) * 0.12; // rise toward the mountains
  return h;
}

function makeGround() {
  const size = 1400;
  const seg = 180;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const sage = new THREE.Color(P.sage);
  const tan = new THREE.Color(P.tan);
  const dark = new THREE.Color("#6f7b52");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = groundHeight(x, z);
    pos.setY(i, h);
    const n = Math.sin(x * 0.05) * Math.cos(z * 0.043) + Math.sin(x * 0.17 + z * 0.11) * 0.4;
    c.copy(sage).lerp(tan, smooth(0.2, 0.9, n) * 0.75).lerp(dark, smooth(-0.3, -1.1, n) * 0.6);
    const d = Math.hypot(x, z);
    c.lerp(tan, (1 - smooth(10, 40, d)) * 0.5); // trodden earth in camp
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 });
  return new THREE.Mesh(geo, mat);
}

function makeMountains() {
  const A = 220;
  const R = 9;
  const verts: number[] = [];
  const cols: number[] = [];
  const idx: number[] = [];
  const mist = new THREE.Color(P.mist);
  const deep = new THREE.Color("#6b7d86");
  const snow = new THREE.Color("#f3eeee");
  const c = new THREE.Color();
  for (let r = 0; r < R; r++) {
    const rad = 430 + r * 55;
    const env = Math.sin((r / (R - 1)) * Math.PI);
    for (let a = 0; a <= A; a++) {
      const ang = (a / A) * Math.PI * 2;
      const peaks = Math.sin(ang * 7) + Math.sin(ang * 13 + 1.3) * 0.6 + Math.sin(ang * 31 + r) * 0.25 + Math.sin(ang * 3 + 2) * 0.8 + 2.6;
      const y = peaks * 26 * env + (r === 0 ? 10 : 30);
      verts.push(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
      c.copy(deep).lerp(mist, r / R).lerp(snow, smooth(95, 135, y));
      cols.push(c.r, c.g, c.b);
    }
  }
  for (let r = 0; r < R - 1; r++) {
    for (let a = 0; a < A; a++) {
      const i0 = r * (A + 1) + a;
      const i1 = i0 + 1;
      const i2 = i0 + A + 1;
      const i3 = i2 + 1;
      idx.push(i0, i2, i1, i1, i2, i3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, side: THREE.DoubleSide }));
}

/* ---------- ger ---------- */
type Glow = { mats: THREE.MeshStandardMaterial[]; lights: THREE.PointLight[] };

function makeGerKit() {
  const wallGeo = new THREE.CylinderGeometry(4, 4, 2.6, 28, 1);
  const roofGeo = new THREE.ConeGeometry(4.5, 1.9, 28, 1, true);
  const bandGeo = new THREE.TorusGeometry(4.04, 0.07, 6, 40);
  const crownGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.32, 16);
  const doorGeo = new THREE.BoxGeometry(1.15, 1.85, 0.22);
  const chimneyGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 6);
  const wallMat = new THREE.MeshStandardMaterial({ color: P.felt, roughness: 0.95 });
  const roofMat = new THREE.MeshStandardMaterial({ color: "#e3d8d6", roughness: 0.95, side: THREE.DoubleSide });
  const bandMat = new THREE.MeshStandardMaterial({ color: "#6b4426", roughness: 0.8 });
  const crownMat = new THREE.MeshStandardMaterial({ color: P.brown, emissive: "#ffc27d", emissiveIntensity: 0 });
  const doorMat = new THREE.MeshStandardMaterial({ color: "#a8612f", emissive: "#ff9a48", emissiveIntensity: 0, roughness: 0.6 });
  const chimneyMat = new THREE.MeshStandardMaterial({ color: "#5a5048" });
  const glow: Glow = { mats: [crownMat, doorMat], lights: [] };

  function ger(x: number, z: number, rotY: number, scale = 1) {
    const g = new THREE.Group();
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.3;
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.6 + 0.95;
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 4.55;
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.95, 4.0);
    const chim = new THREE.Mesh(chimneyGeo, chimneyMat);
    chim.position.set(0.9, 4.6, -0.4);
    g.add(wall, roof, crown, door, chim);
    for (const y of [0.55, 1.45, 2.35]) {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      g.add(band);
    }
    g.position.set(x, groundHeight(x, z), z);
    g.rotation.y = rotY;
    g.scale.setScalar(scale);
    return g;
  }
  return { ger, glow };
}

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

export async function createWorld(canvas: HTMLCanvasElement, opts: { mobile: boolean }): Promise<World> {
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

  /* land */
  scene.add(makeGround(), makeMountains());

  /* ger camp */
  const kit = makeGerKit();
  const camp: [number, number, number, number][] = [
    [0, -6, 0.2, 1.1],
    [-12, -2, 0.7, 1],
    [11, -1, -0.5, 1],
    [-6, -17, 0.1, 0.95],
    [8, -15, -0.3, 1],
    [-21, -12, 0.9, 0.9],
    [20, -11, -0.8, 0.9],
    [-2, 9, 0.05, 0.85],
    [-30, 4, 1.2, 0.85],
    [27, 6, -1.1, 0.85],
    [70, -60, -0.4, 0.9],
    [-95, 30, 1.3, 0.9],
  ];
  for (const [x, z, r, s] of camp) {
    // doors face roughly toward the south (+z), like real gers
    scene.add(kit.ger(x, z, r, s));
  }
  const doorLights: THREE.PointLight[] = [];
  for (const [x, z, r, s] of camp.slice(0, opts.mobile ? 2 : 4)) {
    const l = new THREE.PointLight(0xffa860, 0, 14, 2);
    l.position.set(x + Math.sin(r) * 5.2 * s, 1.4, z + Math.cos(r) * 5.2 * s);
    scene.add(l);
    doorLights.push(l);
  }

  /* hitching line (уяа) */
  const postMat = new THREE.MeshStandardMaterial({ color: "#6b4426" });
  const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 6);
  for (const x of [14, 22]) {
    const p = new THREE.Mesh(postGeo, postMat);
    p.position.set(x, 1.1, 12);
    scene.add(p);
  }
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 8, 4), postMat);
  rope.rotation.z = Math.PI / 2;
  rope.position.set(18, 1.9, 12);
  scene.add(rope);

  /* ovoo with blue khadag */
  const ovooY = groundHeight(OVOO.x, OVOO.y);
  const stoneGeo = new THREE.DodecahedronGeometry(0.9, 0);
  const stones = new THREE.InstancedMesh(stoneGeo, new THREE.MeshStandardMaterial({ color: "#9a9590", flatShading: true }), 46);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 46; i++) {
    const layer = i / 46;
    const a = i * 2.4;
    const rad = (1 - layer) * 3.4;
    const sc = 0.8 + ((i * 7) % 5) * 0.12;
    m4.compose(
      new THREE.Vector3(OVOO.x + Math.cos(a) * rad, ovooY + layer * 3.6, OVOO.y + Math.sin(a) * rad),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(a, a * 0.7, 0)),
      new THREE.Vector3(sc, sc * 0.8, sc),
    );
    stones.setMatrixAt(i, m4);
  }
  scene.add(stones);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 6), postMat);
  pole.position.set(OVOO.x, ovooY + 5.5, OVOO.y);
  scene.add(pole);
  const khadag: THREE.Mesh[] = [];
  const khadagGeo = new THREE.PlaneGeometry(0.32, 2.4);
  khadagGeo.translate(0, -1.2, 0);
  const khadagMats = [P.mist, "#a9bcc4", P.mist, P.blush, P.mist].map((c) => new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: 0.7 }));
  for (let i = 0; i < 14; i++) {
    const k = new THREE.Mesh(khadagGeo, khadagMats[i % khadagMats.length]);
    const a = (i / 14) * Math.PI * 2;
    k.position.set(OVOO.x + Math.cos(a) * 0.25, ovooY + 8.6 - (i % 3) * 0.5, OVOO.y + Math.sin(a) * 0.25);
    k.rotation.y = a;
    k.rotation.x = 0.55;
    khadag.push(k);
    scene.add(k);
  }

  /* glowing street signs */
  const signs: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  const signDefs: [string, string, string, [number, number, number], number, { stripe?: [string, string]; cross?: boolean }?][] = [
    ["ЭМИЙН САН", "#5e6b42", "#ffffff", [-4.5, 3.4, 5.5], 0.5, { cross: true }],
    ["ДЭЛГҮҮР", "#6b4426", "#ffffff", [5.5, 3.2, 3], -0.35, { stripe: [P.sage, P.felt] }],
    ["ТАКСИ", "#dab692", "#3a2a1f", [-9, 2.6, -3.5], 0.9, { stripe: ["#3a2a1f", P.felt] }],
    ["КАФЕ", "#8f5b34", "#ffffff", [9, 2.8, -6], -0.7],
    ["АВТОБУС", "#4e5f69", "#ffffff", [1, 4.6, -9.5], 0.1],
  ];
  const boardGeo = new THREE.PlaneGeometry(4, 1);
  for (const [text, bg, fg, [x, y, z], rot, o] of signDefs) {
    const mat = new THREE.MeshBasicMaterial({ map: signTexture(text, bg, fg, o), toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(boardGeo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rot;
    scene.add(mesh);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, y - 0.5, 6), postMat);
    post.position.set(x, (y - 0.5) / 2, z);
    scene.add(post);
    signs.push({ mesh, mat });
  }

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
  const posCurve = new THREE.CatmullRomCurve3(SHOTS.map((s) => new THREE.Vector3(...s[0])), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(SHOTS.map((s) => new THREE.Vector3(...s[1])), false, "centripetal");

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
    const i = Math.min(Math.floor(t), SHOT_TOD.length - 2);
    return lerp(SHOT_TOD[i], SHOT_TOD[i + 1], clamp01(t - i));
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!active) return;
    elapsed += dt;

    current += (target - current) * (1 - Math.exp(-dt * 3.2));
    pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    const u = clamp01(current / (SHOTS.length - 1));
    const tod = todAt(current);
    const glow = smooth(0.2, 0.62, tod);

    /* camera */
    posCurve.getPoint(u, tmpA);
    lookCurve.getPoint(u, tmpB);
    right.subVectors(tmpB, tmpA).cross(camera.up).normalize();
    tmpA.addScaledVector(right, pointerSmooth.x * 1.6);
    tmpA.y += -pointerSmooth.y * 0.9 + Math.sin(elapsed * 0.35) * 0.15;
    camera.position.copy(tmpA);
    camera.lookAt(tmpB);

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
    kit.glow.mats[0].emissiveIntensity = glow * 3.2; // crown (toono)
    kit.glow.mats[1].emissiveIntensity = glow * 1.6; // door
    doorLights.forEach((l, i) => (l.intensity = glow * (5 + Math.sin(elapsed * 6 + i * 2) * 0.5)));
    for (const s of signs) s.mat.color.setScalar(0.85 + glow * 0.45);

    /* letters: rise in chapter 4, stay as a faint constellation for the method chapter, then fade */
    const lv = smooth(2.25, 3, current) * (1 - smooth(3.9, 4.6, current) * 0.6) * (1 - smooth(5.15, 5.75, current));
    for (const L of letters) {
      L.mat.opacity = lv;
      L.mat.color.setScalar(1 + glow * 0.6);
      L.s.position.set(L.base.x, L.base.y - (1 - lv) * 18 + Math.sin(elapsed * 0.8 + L.phase) * 0.8, L.base.z);
    }

    /* khadag in the wind */
    khadag.forEach((k, i) => {
      k.rotation.x = 0.5 + Math.sin(elapsed * 2.4 + i) * 0.22;
      k.rotation.z = Math.sin(elapsed * 1.7 + i * 1.3) * 0.18;
    });

    /* snow follows the camera */
    snowMat.opacity = smooth(0.55, 0.9, tod) * 0.85;
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

    bloom.strength = lerp(0.3, 0.7, glow);
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
    setTarget: (t) => (target = Math.max(0, Math.min(SHOTS.length - 1, t))),
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
  };
}
