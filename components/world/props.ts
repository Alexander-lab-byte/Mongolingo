import * as THREE from "three";
import { fbm, groundHeight, lerp, noise2, OVOO, ridged, riverHalfWidth, riverZ, riverDist, rng, smooth, WATER_Y } from "./terrain";

/*
  Everything that makes the steppe feel alive:
  layered mountains, ground with grass / rocks / flowers / tracks, a river, detailed gers,
  camp life (smoke, firewood, cart, motorbike, solar panel, dish, laundry) and animals.
*/

const P = {
  blush: "#e8dfe0",
  sage: "#8d9b6a",
  mist: "#8a9ea7",
  tan: "#dab692",
  brown: "#8f5b34",
  felt: "#efe7e5",
};

const std = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...extra });

function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ================= land ================= */

export function makeGround(mobile: boolean) {
  const size = 1500;
  const seg = mobile ? 180 : 280;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const sage = new THREE.Color(P.sage);
  const tan = new THREE.Color(P.tan);
  const dark = new THREE.Color("#66724a");
  const dry = new THREE.Color("#b5a77a");
  const mud = new THREE.Color("#7a6a52");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = groundHeight(x, z);
    pos.setY(i, h);
    const n = fbm(x * 0.02, z * 0.02, 3);
    const n2 = fbm(x * 0.09 + 7, z * 0.09, 2);
    c.copy(sage).lerp(dark, smooth(-0.05, -0.45, n) * 0.7).lerp(dry, smooth(0.1, 0.5, n) * 0.6).lerp(tan, smooth(0.25, 0.6, n2) * 0.35);
    const d = Math.hypot(x, z);
    c.lerp(tan, (1 - smooth(8, 34, d)) * 0.45); // trodden earth in camp
    const rd = riverDist(x, z);
    c.lerp(mud, (1 - smooth(riverHalfWidth(x), riverHalfWidth(x) + 6, rd)) * 0.7); // river banks
    c.lerp(new THREE.Color("#5c6a43"), (1 - smooth(riverHalfWidth(x) + 4, riverHalfWidth(x) + 18, rd)) * 0.35); // greener near water
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
}

/* Three layers of real-looking ranges: green foothills, rocky main range, far snowy peaks. */
export function makeRanges(mobile: boolean) {
  const group = new THREE.Group();
  const layers = [
    { inner: 300, outer: 420, rows: 7, amp: 55, base: 8, seed: 1.3, k: 2.2, low: "#76804f", high: "#9c9068", snow: 999 },
    { inner: 470, outer: 660, rows: 9, amp: 150, base: 16, seed: 7.9, k: 3.1, low: "#6e665c", high: "#8f8780", snow: 118 },
    { inner: 720, outer: 940, rows: 8, amp: 250, base: 36, seed: 4.4, k: 3.8, low: "#7f8f98", high: "#a3b0b6", snow: 175 },
  ];
  const A = mobile ? 200 : 320;
  for (const L of layers) {
    const verts: number[] = [];
    const cols: number[] = [];
    const idx: number[] = [];
    const c = new THREE.Color();
    const low = new THREE.Color(L.low);
    const high = new THREE.Color(L.high);
    const snow = new THREE.Color("#f4f0ef");
    for (let r = 0; r < L.rows; r++) {
      const t = r / (L.rows - 1);
      const rad = lerp(L.inner, L.outer, t);
      const env = Math.pow(Math.sin(t * Math.PI), 0.7);
      for (let a = 0; a <= A; a++) {
        const ang = (a / A) * Math.PI * 2;
        const cx = Math.cos(ang) * L.k;
        const cz = Math.sin(ang) * L.k;
        const n = ridged(cx + L.seed, cz + r * 0.28 + L.seed, 5);
        const y = L.base + n * L.amp * env * (0.75 + 0.35 * noise2(cx * 0.7 + 9, cz * 0.7));
        verts.push(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
        const rough = noise2(cx * 9 + r, cz * 9) * 0.5 + 0.5;
        c.copy(low).lerp(high, smooth(L.base, L.base + L.amp * 0.7, y) * (0.6 + rough * 0.4));
        c.lerp(snow, smooth(L.snow - 12 + rough * 18, L.snow + 14 + rough * 18, y));
        cols.push(c.r, c.g, c.b);
      }
    }
    for (let r = 0; r < L.rows - 1; r++) {
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
    group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, side: THREE.DoubleSide })));
  }
  return group;
}

/* The river: a ribbon of water that mirrors the sky colour. */
export function makeRiver() {
  const verts: number[] = [];
  const idx: number[] = [];
  const step = 3;
  let i = 0;
  for (let x = -760; x <= 760; x += step) {
    const z = riverZ(x);
    const dz = (riverZ(x + 0.5) - riverZ(x - 0.5)) / 1;
    const nx = -dz;
    const nz = 1;
    const len = Math.hypot(nx, nz);
    const w = riverHalfWidth(x) * 1.05;
    verts.push(x - (nx / len) * w, WATER_Y, z - (nz / len) * w, x + (nx / len) * w, WATER_Y, z + (nz / len) * w);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    i++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color: "#7f939b", roughness: 0.85, metalness: 0, emissive: "#000000", side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, mat };
}

/* Wheel tracks from the camp out across the steppe. */
export function makeTracks() {
  const paths: [number, number][][] = [
    [[2, 6], [18, 30], [26, 60], [40, 110], [70, 170], [120, 240]],
    [[-8, -12], [-28, -30], [-50, -48], [-62, -54]],
    [[-14, 2], [-50, 10], [-110, 18], [-200, 30], [-300, 60]],
  ];
  const mat = new THREE.MeshStandardMaterial({ color: "#8a7458", roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  const group = new THREE.Group();
  for (const path of paths) {
    const curve = new THREE.CatmullRomCurve3(path.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const pts = curve.getSpacedPoints(Math.round(curve.getLength() / 2));
    for (const off of [-1.05, 1.05]) {
      const verts: number[] = [];
      const idx: number[] = [];
      pts.forEach((p, k) => {
        const q = pts[Math.min(k + 1, pts.length - 1)];
        const r = pts[Math.max(k - 1, 0)];
        const dx = q.x - r.x;
        const dz = q.z - r.z;
        const l = Math.hypot(dx, dz) || 1;
        const nx = -dz / l;
        const nz = dx / l;
        for (const s of [-0.28, 0.28]) {
          const x = p.x + nx * (off + s);
          const z = p.z + nz * (off + s);
          verts.push(x, groundHeight(x, z) + 0.06, z);
        }
        if (k > 0) {
          const a = (k - 1) * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      group.add(new THREE.Mesh(geo, mat));
    }
  }
  return group;
}

function scatter(count: number, rand: () => number, rMin: number, rMax: number, ok: (x: number, z: number) => boolean) {
  const out: [number, number][] = [];
  let tries = 0;
  while (out.length < count && tries < count * 20) {
    tries++;
    const a = rand() * Math.PI * 2;
    const r = rMin + Math.pow(rand(), 0.7) * (rMax - rMin);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (ok(x, z)) out.push([x, z]);
  }
  return out;
}
const dryLand = (x: number, z: number) => riverDist(x, z) > riverHalfWidth(x) + 1.2;

/* Grass: clumps of thin curved blades (dark at the root, light at the tip) that sway in the wind.
   Normals point up, so the blades are lit like the ground and blend into it. One draw call. */
export function makeGrass(mobile: boolean) {
  const r = rng(5);
  const pos: number[] = [];
  const col: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const BLADES = 7;
  const ROWS = 4;
  for (let b = 0; b < BLADES; b++) {
    const a = r() * Math.PI * 2;
    const bx = Math.cos(a) * r() * 0.16;
    const bz = Math.sin(a) * r() * 0.16;
    const face = r() * Math.PI;
    const fx = Math.cos(face);
    const fz = Math.sin(face);
    const lean = 0.15 + r() * 0.35;
    const lx = Math.cos(a);
    const lz = Math.sin(a);
    const h = 0.32 + r() * 0.4;
    const w = 0.035 + r() * 0.02;
    const start = pos.length / 3;
    for (let j = 0; j < ROWS; j++) {
      const t = j / (ROWS - 1);
      const bend = lean * t * t * h;
      const cx = bx + lx * bend;
      const cz = bz + lz * bend;
      const y = t * h * (1 - lean * 0.25 * t);
      const hw = w * (1 - t * 0.92);
      pos.push(cx - fx * hw, y, cz - fz * hw, cx + fx * hw, y, cz + fz * hw);
      const shade = 0.55 + t * 0.45;
      col.push(shade, shade, shade, shade, shade, shade);
      nor.push(0, 1, 0, 0, 1, 0);
      if (j > 0) {
        const k = start + (j - 1) * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
  }
  const clump = new THREE.BufferGeometry();
  clump.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  clump.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  clump.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  clump.setIndex(idx);
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 1, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nfloat sway = sin(uTime * 1.6 + instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.23) + 0.4 * sin(uTime * 3.1 + instanceMatrix[3].x);\ntransformed.x += sway * position.y * position.y * 0.35;\ntransformed.z += sway * position.y * position.y * 0.12;",
      );
  };
  const rand = rng(11);
  const ok = (x: number, z: number) => dryLand(x, z) && Math.hypot(x, z) > 9;
  const spots = [...scatter(mobile ? 2600 : 8000, rand, 5, 90, ok), ...scatter(mobile ? 1600 : 5000, rand, 90, 260, ok)];
  const im = new THREE.InstancedMesh(clump, mat, spots.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const greens = ["#7f8f55", "#8b9a5e", "#96a064", "#87955a", "#9aa06a", "#76874f"].map((h) => new THREE.Color(h));
  spots.forEach(([x, z], i) => {
    const sc = 0.5 + rand() * 0.45;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    m.compose(new THREE.Vector3(x, groundHeight(x, z) - 0.02, z), q, new THREE.Vector3(sc, sc * (0.8 + rand() * 0.5), sc));
    im.setMatrixAt(i, m);
    im.setColorAt(i, c.copy(greens[Math.floor(rand() * greens.length)]));
  });
  return { mesh: im, update: (t: number) => (uniforms.uTime.value = t) };
}

export function makeRocks(mobile: boolean) {
  const rand = rng(23);
  const spots = scatter(mobile ? 140 : 320, rand, 20, 320, dryLand);
  const im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std("#ffffff"), spots.length);
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  const greys = ["#8d8781", "#a19a92", "#76716b", "#9b8f80"].map((h) => new THREE.Color(h));
  spots.forEach(([x, z], i) => {
    const s = 0.35 + Math.pow(rand(), 3) * 1.8;
    m.compose(
      new THREE.Vector3(x, groundHeight(x, z) + s * 0.15, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3)),
      new THREE.Vector3(s * (1 + rand()), s * 0.6, s),
    );
    im.setMatrixAt(i, m);
    im.setColorAt(i, c.copy(greys[Math.floor(rand() * greys.length)]));
  });
  return im;
}

/* Wildflowers in patches (edelweiss white, tan, blush and pale blue). */
export function makeFlowers(mobile: boolean) {
  const rand = rng(37);
  const patches = scatter(mobile ? 30 : 60, rand, 20, 220, dryLand);
  const spots: [number, number][] = [];
  for (const [px, pz] of patches) {
    const n = 8 + Math.floor(rand() * 18);
    for (let k = 0; k < n; k++) {
      const x = px + (rand() - 0.5) * 9;
      const z = pz + (rand() - 0.5) * 9;
      if (dryLand(x, z)) spots.push([x, z]);
    }
  }
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.13, 0), std("#ffffff", { roughness: 0.7 }), spots.length);
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  const cols = ["#f3eeee", "#dab692", "#e5c2c4", "#a9bcc4", "#e8d08f"].map((h) => new THREE.Color(h));
  spots.forEach(([x, z], i) => {
    m.makeTranslation(x, groundHeight(x, z) + 0.32 + rand() * 0.15, z);
    im.setMatrixAt(i, m);
    im.setColorAt(i, c.copy(cols[Math.floor(rand() * cols.length)]));
  });
  return im;
}

/* ================= gers ================= */

export type GerKit = ReturnType<typeof makeGerKit>;

export function makeGerKit() {
  // felt wall: white felt, rope ties, darker skirt at the bottom
  const feltTex = canvasTex(1024, 256, (x) => {
    x.fillStyle = P.felt;
    x.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = `rgba(120,100,90,${Math.random() * 0.06})`;
      x.fillRect(Math.random() * 1024, Math.random() * 256, 2 + Math.random() * 4, 1 + Math.random() * 3);
    }
    x.fillStyle = "rgba(110,95,85,0.28)";
    x.fillRect(0, 226, 1024, 30);
    x.fillStyle = "rgba(107,68,38,0.28)";
    for (let i = 0; i < 16; i++) x.fillRect(i * 64 + 30, 0, 2, 226);
  });
  // roof: felt with ropes running to the crown, a patterned (хээ) band at the edge
  const roofTex = canvasTex(1024, 512, (x) => {
    x.fillStyle = "#e9e0dd";
    x.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 2000; i++) {
      x.fillStyle = `rgba(120,100,90,${Math.random() * 0.06})`;
      x.fillRect(Math.random() * 1024, Math.random() * 512, 3, 2);
    }
    x.fillStyle = "rgba(107,68,38,0.35)";
    for (let i = 0; i < 16; i++) x.fillRect(i * 64 + 28, 0, 3, 446);
    // edge band (bottom of the texture is the roof edge)
    x.fillStyle = "#4e5f69";
    x.fillRect(0, 446, 1024, 66);
    x.fillStyle = "#dab692";
    for (let i = 0; i < 64; i++) {
      const bx = i * 16;
      x.fillRect(bx + 2, 456, 12, 4);
      x.fillRect(bx + 2, 456, 4, 14);
      x.fillRect(bx + 2, 466, 9, 4);
      x.fillRect(bx + 7, 470, 4, 12);
    }
    x.fillStyle = "#8f5b34";
    x.fillRect(0, 498, 1024, 14);
  });
  // painted orange door with a tan frame and an endless-knot style pattern
  const doorTex = canvasTex(256, 384, (x) => {
    x.fillStyle = "#c4622a";
    x.fillRect(0, 0, 256, 384);
    x.strokeStyle = "#dab692";
    x.lineWidth = 10;
    x.strokeRect(14, 14, 228, 356);
    x.lineWidth = 6;
    x.strokeRect(36, 36, 184, 140);
    x.strokeRect(36, 200, 184, 148);
    x.strokeStyle = "#8a9ea7";
    x.lineWidth = 8;
    for (const cy of [106, 274]) {
      x.beginPath();
      x.moveTo(128, cy - 44);
      x.lineTo(172, cy);
      x.lineTo(128, cy + 44);
      x.lineTo(84, cy);
      x.closePath();
      x.stroke();
      x.strokeRect(108, cy - 20, 40, 40);
    }
  });
  doorTex.colorSpace = THREE.SRGBColorSpace;

  const wallGeo = new THREE.CylinderGeometry(4, 4.05, 2.6, 40, 1, true);
  const roofGeo = new THREE.ConeGeometry(4.55, 1.85, 40, 1, true);
  const capGeo = new THREE.CylinderGeometry(4.05, 4.05, 0.05, 40);
  const bandGeo = new THREE.TorusGeometry(4.06, 0.03, 6, 64);
  const ringGeo = new THREE.TorusGeometry(0.72, 0.12, 8, 24);
  const glassGeo = new THREE.CircleGeometry(0.66, 20);
  const spokeGeo = new THREE.BoxGeometry(1.36, 0.06, 0.08);
  const doorGeo = new THREE.BoxGeometry(1.1, 1.75, 0.16);
  const frameGeo = new THREE.BoxGeometry(1.42, 2.02, 0.12);
  const chimneyGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8);
  const chimCapGeo = new THREE.CylinderGeometry(0.2, 0.14, 0.14, 8);
  const sillGeo = new THREE.BoxGeometry(1.6, 0.18, 0.7);

  const wallMat = new THREE.MeshStandardMaterial({ map: feltTex, roughness: 0.95, side: THREE.DoubleSide });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.95, side: THREE.DoubleSide });
  const capMat = new THREE.MeshStandardMaterial({ color: "#cfc4bf", roughness: 0.95 });
  const bandMat = new THREE.MeshStandardMaterial({ color: "#8a6a4a", roughness: 0.9 });
  const ringMat = new THREE.MeshStandardMaterial({ color: "#8f5b34", roughness: 0.7 });
  const crownMat = new THREE.MeshStandardMaterial({ color: "#3a2a1f", emissive: "#ffc27d", emissiveIntensity: 0, side: THREE.DoubleSide });
  const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, emissive: "#ff9a48", emissiveMap: doorTex, emissiveIntensity: 0, roughness: 0.55 });
  const frameMat = new THREE.MeshStandardMaterial({ color: "#8f5b34", roughness: 0.6 });
  const chimneyMat = new THREE.MeshStandardMaterial({ color: "#6a6460", metalness: 0.5, roughness: 0.5 });
  const sillMat = std("#6b5a48");

  const lights: THREE.PointLight[] = [];
  const chimneys: THREE.Object3D[] = [];

  function ger(x: number, z: number, rotY: number, scale = 1, withLight = false) {
    const g = new THREE.Group();
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.3;
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.6;
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.6 + 0.92;
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4.42;
    const glass = new THREE.Mesh(glassGeo, crownMat);
    glass.rotation.x = -Math.PI / 2;
    glass.position.y = 4.45;
    g.add(wall, cap, roof, ring, glass);
    for (let k = 0; k < 2; k++) {
      const sp = new THREE.Mesh(spokeGeo, ringMat);
      sp.position.y = 4.5;
      sp.rotation.y = (k * Math.PI) / 2 + Math.PI / 4;
      g.add(sp);
    }
    for (const y of [0.45, 1.3, 2.2]) {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      g.add(band);
    }
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 1.0, 3.98);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.95, 4.06);
    const sill = new THREE.Mesh(sillGeo, sillMat);
    sill.position.set(0, 0.09, 4.4);
    const chim = new THREE.Mesh(chimneyGeo, chimneyMat);
    chim.position.set(1.1, 4.3, -0.6);
    const chimCap = new THREE.Mesh(chimCapGeo, chimneyMat);
    chimCap.position.set(1.1, 5.25, -0.6);
    chimCap.userData.chimney = true;
    g.add(frame, door, sill, chim, chimCap, contactShadow(11.5, 11.5, 0.5));
    chimneys.push(chimCap);
    if (withLight) {
      const l = new THREE.PointLight(0xffa860, 0, 14, 2);
      l.position.set(0, 1.4, 5.3);
      g.add(l);
      lights.push(l);
    }
    g.position.set(x, groundHeight(x, z), z);
    g.rotation.y = rotY;
    g.scale.setScalar(scale);
    return g;
  }

  function forget(o: THREE.Object3D) {
    o.traverse((c) => {
      if (c.userData.chimney) chimneys.splice(chimneys.indexOf(c), 1);
      if (c instanceof THREE.PointLight && lights.includes(c)) lights.splice(lights.indexOf(c), 1);
    });
  }

  return { ger, forget, glow: { mats: [crownMat, doorMat] as THREE.MeshStandardMaterial[], lights }, chimneys };
}

/* ================= chimney smoke ================= */

export function makeSmoke(chimneys: THREE.Object3D[], mobile: boolean) {
  const PER = mobile ? 10 : 18;
  const MAX = 24 * PER;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(MAX * 3);
  const age = new Float32Array(MAX);
  const seed = new Float32Array(MAX);
  for (let i = 0; i < MAX; i++) {
    age[i] = (i % PER) / PER;
    seed[i] = Math.random();
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAge", new THREE.BufferAttribute(age, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#d9d2cc") }, uOpacity: { value: 0.4 }, uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aAge; attribute float aSeed; varying float vAge; uniform float uScale;
      void main() {
        vAge = aAge;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (40.0 + 150.0 * aAge) * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying float vAge;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * (1.0 - vAge) * smoothstep(0.0, 0.12, vAge) * uOpacity;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const wp = new THREE.Vector3();
  function update(dt: number, t: number) {
    const n = Math.min(chimneys.length, 24);
    for (let i = 0; i < MAX; i++) {
      const e = Math.floor(i / PER);
      if (e >= n) {
        pos[i * 3 + 1] = -999;
        continue;
      }
      age[i] += dt / (5 + seed[i] * 3);
      if (age[i] > 1) age[i] -= 1;
      chimneys[e].getWorldPosition(wp);
      const a = age[i];
      const rise = a * 9;
      pos[i * 3] = wp.x + a * a * 6 + Math.sin(t * 0.7 + seed[i] * 9) * a * 1.2;
      pos[i * 3 + 1] = wp.y + 0.2 + rise;
      pos[i * 3 + 2] = wp.z - a * 2 + Math.cos(t * 0.5 + seed[i] * 7) * a;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aAge.needsUpdate = true;
  }
  return { points, mat, update };
}

/* ================= camp life ================= */

function placed(o: THREE.Object3D, x: number, z: number, rot = 0) {
  o.position.set(x, groundHeight(x, z), z);
  o.rotation.y = rot;
  return o;
}

export function makeCampProps() {
  const g = new THREE.Group();
  const wood = std("#7a5a3c");
  const woodLight = std("#a47e58");
  const metal = new THREE.MeshStandardMaterial({ color: "#3a3a3e", metalness: 0.6, roughness: 0.4 });

  // firewood stack
  const stack = new THREE.Group();
  const log = new THREE.CylinderGeometry(0.16, 0.16, 1.6, 7);
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 5 - row; k++) {
      const l = new THREE.Mesh(log, k % 2 ? wood : woodLight);
      l.rotation.z = Math.PI / 2;
      l.position.set(0, 0.17 + row * 0.29, (k - (4 - row) / 2) * 0.33);
      stack.add(l);
    }
  }
  g.add(placed(stack, -17, 3.2, 0.6));
  const stack2 = stack.clone();
  g.add(placed(stack2, 15.5, -6.5, -0.4));

  // wooden cart (тэрэг)
  const cart = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 2.4), woodLight);
  bed.position.y = 0.95;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 2.4), wood);
  sideL.position.set(-0.78, 1.25, 0);
  const sideR = sideL.clone();
  sideR.position.x = 0.78;
  const wheelGeo = new THREE.TorusGeometry(0.62, 0.07, 6, 18);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(wheelGeo, wood);
    w.rotation.y = Math.PI / 2;
    w.position.set(s * 0.95, 0.65, 0);
    cart.add(w);
    for (let k = 0; k < 4; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), wood);
      sp.position.set(s * 0.95, 0.65, 0);
      sp.rotation.x = (k * Math.PI) / 4;
      cart.add(sp);
    }
  }
  const shaftGeo = new THREE.BoxGeometry(0.08, 0.08, 2.6);
  for (const s of [-0.45, 0.45]) {
    const sh = new THREE.Mesh(shaftGeo, wood);
    sh.position.set(s, 0.5, 2.3);
    sh.rotation.x = 0.3;
    cart.add(sh);
  }
  cart.add(bed, sideL, sideR);
  g.add(placed(cart, 31, 2, -1.1));

  // motorbike
  const bike = new THREE.Group();
  const wGeo = new THREE.TorusGeometry(0.34, 0.1, 6, 16);
  for (const z of [-0.62, 0.62]) {
    const w = new THREE.Mesh(wGeo, metal);
    w.rotation.y = Math.PI / 2;
    w.position.set(0, 0.42, z);
    bike.add(w);
  }
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.9), std("#a2453a", { roughness: 0.4, flatShading: false }));
  tank.position.set(0, 0.8, 0.05);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.6), std("#2a2420"));
  seat.position.set(0, 0.95, -0.35);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.05), metal);
  bar.position.set(0, 1.12, 0.55);
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.05), metal);
  fork.position.set(0, 0.8, 0.6);
  fork.rotation.x = -0.35;
  bike.add(tank, seat, bar, fork);
  bike.rotation.z = 0.12;
  g.add(placed(bike, 4.2, 2.6, 0.9));

  // solar panel leaning by a ger
  const solar = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 1.05), new THREE.MeshStandardMaterial({ color: "#2c3640", metalness: 0.4, roughness: 0.25 }));
  panel.position.y = 0.75;
  panel.rotation.x = -0.75;
  const legP = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), metal);
  legP.position.set(0, 0.45, -0.35);
  solar.add(panel, legP);
  g.add(placed(solar, -6.5, 1.5, 0.3));

  // satellite dish on a pole
  const dish = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), metal);
  pole.position.y = 0.9;
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3), new THREE.MeshStandardMaterial({ color: "#e9e4e2", side: THREE.DoubleSide, roughness: 0.6 }));
  bowl.position.set(0, 1.9, 0.15);
  bowl.rotation.x = -1.2;
  dish.add(pole, bowl);
  g.add(placed(dish, 5.8, -9.5, -0.6));

  // laundry line with colourful clothes
  const line = new THREE.Group();
  for (const x of [-2.4, 2.4]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.1, 6), wood);
    p.position.set(x, 1.05, 0);
    line.add(p);
  }
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 4.8, 4), wood);
  rope.rotation.z = Math.PI / 2;
  rope.position.y = 1.95;
  line.add(rope);
  const clothes: THREE.Mesh[] = [];
  ["#8a9ea7", "#dab692", "#a2453a", "#efe7e5", "#5e6b42"].forEach((c, k) => {
    const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: 0.9 }));
    cl.geometry.translate(0, -0.4, 0);
    cl.position.set(-1.8 + k * 0.9, 1.93, 0);
    line.add(cl);
    clothes.push(cl);
  });
  g.add(placed(line, -24, -3, 0.5));

  return {
    group: g,
    update: (t: number) =>
      clothes.forEach((c, k) => {
        c.rotation.x = Math.sin(t * 2.2 + k) * 0.25 + 0.15;
      }),
  };
}

/* ================= animals ================= */

// smooth (not faceted) materials for living things
const fur = (color: THREE.ColorRepresentation, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness });

/* soft dark blob on the ground so things look like they stand on it */
let shadowTex: THREE.Texture | null = null;
export function contactShadow(w: number, l: number, strength = 0.45) {
  shadowTex ??= (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const x = cv.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.55, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  })();
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, l),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: strength, depthWrite: false, color: 0x000000 }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.04;
  m.renderOrder = 1;
  return m;
}

/* a tapered limb from point a to point b (local coords) */
function limb(mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, rA: number, rB: number) {
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(rB, rA, len, 10, 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}
function ball(mat: THREE.Material, p: [number, number, number], r: number, scale: [number, number, number] = [1, 1, 1]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
  m.position.set(...p);
  m.scale.set(...scale);
  return m;
}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function makeHorse(color: string, mane: string, grazing: boolean) {
  const coat = fur(color, 0.7);
  const dark = fur(mane, 0.9);
  const hoofM = fur("#2a2420");
  const g = new THREE.Group();
  // barrel, chest and hindquarters
  g.add(ball(coat, [0, 1.42, 0.05], 0.5, [0.78, 0.8, 1.55]));
  g.add(ball(coat, [0, 1.47, 0.62], 0.42, [0.85, 0.95, 0.9]));
  g.add(ball(coat, [0, 1.5, -0.6], 0.44, [0.88, 0.95, 0.95]));
  // legs: upper + lower + hoof, rear legs with a hock bend
  const legs: [number, number, boolean][] = [[-0.2, 0.68, true], [0.2, 0.68, true], [-0.2, -0.64, false], [0.2, -0.64, false]];
  for (const [x, z, front] of legs) {
    const hip = V(x, 1.3, z);
    const knee = front ? V(x, 0.62, z + 0.02) : V(x, 0.72, z - 0.14);
    const foot = V(x, 0.1, z + (front ? 0.02 : 0.02));
    g.add(limb(coat, hip, knee, 0.13, 0.075));
    g.add(limb(coat, knee, foot, 0.065, 0.055));
    g.add(ball(coat, [knee.x, knee.y, knee.z], 0.075));
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.12, 10), hoofM);
    hoof.position.set(foot.x, 0.06, foot.z);
    g.add(hoof);
  }
  // tail
  const tail = limb(dark, V(0, 1.6, -0.98), V(0, 0.75, -1.18), 0.09, 0.03);
  g.add(tail);
  // neck + head on a pivot so it can graze
  const neck = new THREE.Group();
  neck.position.set(0, 1.62, 0.78);
  const nTop = V(0, 0.78, 0.42);
  neck.add(limb(coat, V(0, 0, 0), nTop, 0.26, 0.15));
  neck.add(limb(dark, V(0, 0.08, -0.12), V(0, 0.82, 0.3), 0.06, 0.05)); // mane
  const head = new THREE.Group();
  head.position.copy(nTop);
  head.add(limb(coat, V(0, 0, 0), V(0, -0.28, 0.5), 0.15, 0.09)); // face, tapering to the muzzle
  head.add(ball(coat, [0, -0.3, 0.52], 0.1, [1, 0.9, 1.1]));
  head.add(ball(hoofM, [0.07, -0.33, 0.6], 0.025));
  head.add(ball(hoofM, [-0.07, -0.33, 0.6], 0.025));
  for (const s of [-1, 1]) head.add(limb(coat, V(s * 0.07, 0.06, -0.02), V(s * 0.09, 0.22, -0.04), 0.035, 0.01));
  head.add(ball(fur("#111111", 0.3), [0.12, -0.04, 0.14], 0.025));
  head.add(ball(fur("#111111", 0.3), [-0.12, -0.04, 0.14], 0.025));
  neck.add(head);
  neck.rotation.x = grazing ? 1.45 : 0.1;
  g.add(neck);
  g.add(contactShadow(1.6, 2.8));
  return { g, neck };
}

function makeCamel() {
  const coat = fur("#b8956b", 0.95);
  const shag = fur("#8f6f4c", 1);
  const g = new THREE.Group();
  g.add(ball(coat, [0, 1.95, 0], 0.55, [0.85, 0.75, 1.7]));
  g.add(ball(shag, [0, 2.45, 0.42], 0.36, [0.9, 1.15, 0.9]));
  g.add(ball(shag, [0, 2.45, -0.45], 0.36, [0.9, 1.15, 0.9]));
  g.add(ball(shag, [0, 1.75, 0.78], 0.3, [0.9, 1.1, 0.8])); // shaggy chest
  for (const [x, z] of [[-0.24, 0.7], [0.24, 0.7], [-0.24, -0.7], [0.24, -0.7]]) {
    const knee = V(x, 0.85, z + 0.04);
    g.add(limb(coat, V(x, 1.75, z), knee, 0.14, 0.085));
    g.add(limb(coat, knee, V(x, 0.08, z), 0.075, 0.07));
    g.add(ball(shag, [knee.x, knee.y, knee.z], 0.1));
    g.add(ball(fur("#6b5a48"), [x, 0.06, z + 0.04], 0.11, [1, 0.5, 1.3]));
  }
  // S-shaped neck
  const n1 = V(0, 2.0, 0.85);
  const n2 = V(0, 1.85, 1.45);
  const n3 = V(0, 2.75, 1.75);
  g.add(limb(coat, n1, n2, 0.24, 0.17));
  g.add(ball(coat, [n2.x, n2.y, n2.z], 0.17));
  g.add(limb(coat, n2, n3, 0.16, 0.13));
  g.add(limb(shag, V(0, 1.75, 1.3), V(0, 2.4, 1.62), 0.1, 0.06)); // neck fur
  const head = new THREE.Group();
  head.position.copy(n3);
  head.add(limb(coat, V(0, 0, 0), V(0, -0.05, 0.55), 0.15, 0.1));
  head.add(ball(coat, [0, -0.06, 0.55], 0.11, [1, 0.9, 1.2]));
  for (const s of [-1, 1]) head.add(limb(coat, V(s * 0.08, 0.1, -0.02), V(s * 0.12, 0.2, -0.05), 0.03, 0.01));
  g.add(head);
  g.add(limb(shag, V(0, 2.0, -0.95), V(0, 1.3, -1.1), 0.06, 0.03));
  g.add(contactShadow(1.8, 3.2));
  return g;
}

function makeDog() {
  const coat = fur("#3a2a1f");
  const tan = fur("#a47e58");
  const g = new THREE.Group();
  g.add(ball(coat, [0, 0.22, 0], 0.22, [0.95, 0.8, 2.0])); // lying body
  g.add(ball(coat, [0, 0.36, 0.48], 0.17));
  g.add(limb(tan, V(0, 0.32, 0.6), V(0, 0.27, 0.8), 0.09, 0.06));
  for (const s of [-1, 1]) {
    g.add(limb(coat, V(s * 0.09, 0.48, 0.44), V(s * 0.12, 0.62, 0.42), 0.04, 0.01));
    g.add(limb(tan, V(s * 0.1, 0.06, 0.25), V(s * 0.1, 0.06, 0.7), 0.045, 0.04)); // front paws stretched out
  }
  g.add(limb(coat, V(0.1, 0.18, -0.4), V(0.32, 0.1, -0.8), 0.05, 0.02));
  g.add(contactShadow(0.9, 1.6, 0.4));
  return g;
}

/* A herd of sheep and goats that wander and graze, drawn with instancing (a few draw calls for all of them). */
function makeHerd(count: number, center: [number, number], radius: number) {
  const rand = rng(91);
  const bodyGeo = new THREE.SphereGeometry(0.5, 14, 10);
  bodyGeo.scale(0.95, 0.85, 1.35);
  // lumpy wool
  const bp = bodyGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) {
    const k = 1 + noise2(bp.getX(i) * 9, bp.getZ(i) * 9 + bp.getY(i) * 7) * 0.07;
    bp.setXYZ(i, bp.getX(i) * k, bp.getY(i) * k, bp.getZ(i) * k);
  }
  bodyGeo.computeVertexNormals();
  const headGeo = new THREE.CylinderGeometry(0.09, 0.15, 0.42, 10);
  headGeo.rotateX(Math.PI / 2 + 0.5);
  const legGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.55, 6);
  const shadowGeo = new THREE.PlaneGeometry(1.1, 1.6);
  shadowGeo.rotateX(-Math.PI / 2);
  contactShadow(1, 1); // make sure the shared texture exists
  const bodyIM = new THREE.InstancedMesh(bodyGeo, fur("#ffffff", 1), count);
  const headIM = new THREE.InstancedMesh(headGeo, fur("#ffffff", 0.8), count);
  const legIM = new THREE.InstancedMesh(legGeo, fur("#4a3a2e"), count * 4);
  const shIM = new THREE.InstancedMesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.35, depthWrite: false, color: 0x000000 }), count);
  const animals = Array.from({ length: count }, (_, i) => {
    const goat = i % 4 === 3;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * radius;
    const s = goat ? 0.82 : 0.95 + rand() * 0.2;
    const body = goat ? ["#6b4426", "#2f2925", "#d9d0c8"][i % 3] : ["#f1ece6", "#ece4da", "#e6ddd0"][i % 3];
    const head = goat ? body : rand() < 0.5 ? "#3a2a1f" : "#8f5b34";
    bodyIM.setColorAt(i, new THREE.Color(body));
    headIM.setColorAt(i, new THREE.Color(head));
    return { x: center[0] + Math.cos(a) * r, z: center[1] + Math.sin(a) * r, h: rand() * Math.PI * 2, tx: 0, tz: 0, wait: rand() * 6, s, phase: rand() * 10, goat };
  });
  animals.forEach((A) => {
    A.tx = A.x;
    A.tz = A.z;
  });
  const M = new THREE.Matrix4();
  const L = new THREE.Matrix4();
  const out = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const legPos: [number, number][] = [[-0.2, 0.4], [0.2, 0.4], [-0.2, -0.4], [0.2, -0.4]];

  function update(dt: number, t: number) {
    animals.forEach((A, i) => {
      const dx = A.tx - A.x;
      const dz = A.tz - A.z;
      const dist = Math.hypot(dx, dz);
      let moving = false;
      if (dist < 0.2) {
        A.wait -= dt;
        if (A.wait < 0) {
          const a = rand() * Math.PI * 2;
          const r = Math.sqrt(rand()) * radius;
          const nx = center[0] + Math.cos(a) * r;
          const nz = center[1] + Math.sin(a) * r;
          if (riverDist(nx, nz) > riverHalfWidth(nx) + 2) {
            A.tx = nx;
            A.tz = nz;
          }
          A.wait = 3 + rand() * 8;
        }
      } else {
        moving = true;
        const want = Math.atan2(dx, dz);
        let d = want - A.h;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        A.h += d * Math.min(1, dt * 2);
        const sp = 0.6 * dt;
        A.x += Math.sin(A.h) * sp;
        A.z += Math.cos(A.h) * sp;
      }
      const gy = groundHeight(A.x, A.z);
      q.setFromAxisAngle(up, A.h);
      M.compose(new THREE.Vector3(A.x, gy, A.z), q, new THREE.Vector3(A.s, A.s, A.s));
      L.makeScale(A.goat ? 0.8 : 1, A.goat ? 0.85 : 1, 1).setPosition(0, 0.78, 0);
      bodyIM.setMatrixAt(i, out.multiplyMatrices(M, L));
      const graze = moving ? 0 : 0.5 + 0.5 * Math.sin(t * 1.3 + A.phase);
      L.makeRotationX(graze * 0.9).setPosition(0, lerp(0.98, 0.42, graze), lerp(0.78, 0.88, graze));
      headIM.setMatrixAt(i, out.multiplyMatrices(M, L));
      legPos.forEach(([lx, lz], k) => {
        const swing = moving ? Math.sin(t * 9 + k * Math.PI) * 0.08 : 0;
        L.makeTranslation(lx, 0.27, lz + swing);
        legIM.setMatrixAt(i * 4 + k, out.multiplyMatrices(M, L));
      });
      L.makeTranslation(0, 0.04, 0);
      shIM.setMatrixAt(i, out.multiplyMatrices(M, L));
    });
    [bodyIM, headIM, legIM, shIM].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  }
  update(0, 0);
  const g = new THREE.Group();
  g.add(shIM, bodyIM, headIM, legIM);
  [bodyIM, headIM, legIM, shIM].forEach((m) => (m.frustumCulled = false));
  return { group: g, update };
}

export function makeAnimals(mobile: boolean) {
  const g = new THREE.Group();
  const necks: { neck: THREE.Group; base: number; phase: number }[] = [];

  // horses tied at the hitching line (уяа), and some grazing by the river
  const tied: [number, string, string][] = [
    [15.6, "#6b4426", "#2a2420"],
    [18, "#8f5b34", "#3a2a1f"],
    [20.4, "#d9d2cc", "#8a817a"],
  ];
  tied.forEach(([x, c, m], k) => {
    const h = makeHorse(c, m, false);
    g.add(placed(h.g, x, 13.8, Math.PI + (k - 1) * 0.1));
    necks.push({ neck: h.neck, base: 0.1, phase: k * 2 });
  });
  const grazing: [number, number, number, string, string][] = [
    [-42, 26, 0.8, "#2a2420", "#111111"],
    [-49, 31, 2.4, "#a47e58", "#6b4426"],
    [58, 32, -1.2, "#8f5b34", "#2a2420"],
    [66, 26, 0.4, "#d9d2cc", "#8a817a"],
    [-120, 10, 1.4, "#6b4426", "#2a2420"],
  ];
  grazing.slice(0, mobile ? 3 : 5).forEach(([x, z, r, c, m], k) => {
    const h = makeHorse(c, m, true);
    g.add(placed(h.g, x, z, r));
    necks.push({ neck: h.neck, base: 1.45, phase: k * 1.7 });
  });

  // two Bactrian camels resting near the cart
  g.add(placed(makeCamel(), 34, -9, -0.6));
  g.add(placed(makeCamel(), 38.5, -4.5, -1.4));

  // a dog lying by the main ger's door
  g.add(placed(makeDog(), 2.6, -0.4, 2.4));

  // sheep and goats
  const herd = makeHerd(mobile ? 22 : 42, [-52, 6], 15);
  g.add(herd.group);

  return {
    group: g,
    update: (dt: number, t: number) => {
      necks.forEach((n) => (n.neck.rotation.x = n.base + Math.sin(t * 0.9 + n.phase) * (n.base > 1 ? 0.1 : 0.05)));
      herd.update(dt, t);
    },
  };
}

/* The ovoo, rebuilt here so it sits on the shared terrain. */
export function makeOvoo() {
  const g = new THREE.Group();
  const y0 = groundHeight(OVOO.x, OVOO.z);
  const stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.9, 0), std("#9a9590"), 60);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) {
    const layer = i / 60;
    const a = i * 2.4;
    const rad = (1 - layer) * 3.6;
    const sc = 0.8 + ((i * 7) % 5) * 0.12;
    m4.compose(
      new THREE.Vector3(OVOO.x + Math.cos(a) * rad, y0 + layer * 3.8, OVOO.z + Math.sin(a) * rad),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(a, a * 0.7, 0)),
      new THREE.Vector3(sc, sc * 0.8, sc),
    );
    stones.setMatrixAt(i, m4);
  }
  g.add(stones);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 6), std("#6b4426"));
  pole.position.set(OVOO.x, y0 + 5.6, OVOO.z);
  g.add(pole);
  const khadag: THREE.Mesh[] = [];
  const kGeo = new THREE.PlaneGeometry(0.32, 2.4);
  kGeo.translate(0, -1.2, 0);
  const kMats = [P.mist, "#a9bcc4", P.mist, P.blush, P.mist].map((c) => new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: 0.7 }));
  for (let i = 0; i < 16; i++) {
    const k = new THREE.Mesh(kGeo, kMats[i % kMats.length]);
    const a = (i / 16) * Math.PI * 2;
    k.position.set(OVOO.x + Math.cos(a) * 0.25, y0 + 8.8 - (i % 3) * 0.5, OVOO.z + Math.sin(a) * 0.25);
    k.rotation.y = a;
    khadag.push(k);
    g.add(k);
  }
  return {
    group: g,
    update: (t: number) =>
      khadag.forEach((k, i) => {
        k.rotation.x = 0.5 + Math.sin(t * 2.4 + i) * 0.22;
        k.rotation.z = Math.sin(t * 1.7 + i * 1.3) * 0.18;
      }),
  };
}
