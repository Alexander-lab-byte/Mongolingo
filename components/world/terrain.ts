/*
  Terrain math shared by everything in the 3D world: the ground, the river, the mountains,
  and anything that needs to stand on the ground (gers, animals, props).
*/

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Small, fast value noise (no library needed). */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
export function fbm(x: number, y: number, octaves = 4) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    s += amp * noise2(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return s;
}
/* Ridged noise: sharp crests, like real rocky mountain ridges. */
export function ridged(x: number, y: number, octaves = 5) {
  let s = 0;
  let amp = 0.55;
  let f = 1;
  let w = 1;
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(noise2(x * f, y * f));
    n *= n * w;
    w = clamp01(n * 2);
    s += n * amp;
    f *= 2.1;
    amp *= 0.5;
  }
  return s;
}

/* The river winds across the valley in front of the camp (from west to east). */
export const riverZ = (x: number) => 46 + 16 * Math.sin(x * 0.018 + 0.6) + 7 * Math.sin(x * 0.047 + 2.1);
export const riverDist = (x: number, z: number) => Math.abs(z - riverZ(x)) * 0.92;
export const riverHalfWidth = (x: number) => 4.2 + 1.6 * Math.sin(x * 0.03 + 1);
export const WATER_Y = -0.7;

export const OVOO = { x: -64, z: -58 };

export function groundHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  let h = fbm(x * 0.007 + 3.1, z * 0.007 - 1.7, 4) * 16 + fbm(x * 0.03, z * 0.03, 2) * 2.2 + 5;
  h *= smooth(48, 130, d); // flat camp ground
  const rd = riverDist(x, z);
  h *= smooth(10, 80, rd); // a wide flat valley floor along the river
  const o = (x - OVOO.x) ** 2 + (z - OVOO.z) ** 2;
  h += 13 * Math.exp(-o / (2 * 17 * 17)); // the ovoo hill
  if (d > 340) h += (d - 340) * 0.14; // rise toward the mountains
  const hw = riverHalfWidth(x);
  h -= 1.5 * (1 - smooth(hw * 0.55, hw + 3.5, rd)); // the river channel
  return h;
}

/* A seeded random generator, so the scene looks the same on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
