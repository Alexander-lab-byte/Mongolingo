import * as THREE from "three";
import { TOWN, SITES, trailZ } from "@/lib/journey";
import { groundHeight } from "./terrain";
import { VOCABULARY_GERS } from "@/lib/learningPaths";

// A foundation must clear the highest ground under its entire footprint.
const platformTops = new Map<string, number>();
export function platformHeight(x: number, z: number) {
  const key = `${x},${z}`;
  const saved = platformTops.get(key);
  if (saved !== undefined) return saved;
  let top = groundHeight(x, z);
  for (let r = 1; r <= 6; r += 1) for (let i = 0; i < 24; i++) {
    const a = i * Math.PI / 12;
    top = Math.max(top, groundHeight(x + Math.cos(a) * r, z + Math.sin(a) * r));
  }
  platformTops.set(key, top + .22);
  return top + 0.22;
}

export function createVillageLife(scene: THREE.Scene, low: boolean, reduced: boolean) {
  const root = new THREE.Group();
  root.name = "Village life";
  scene.add(root);
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (color: string) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .86, flatShading: true }));
    return materials.get(color)!;
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const ball = new THREE.IcosahedronGeometry(1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  function mesh(g: THREE.Object3D, geo: THREE.BufferGeometry, color: string, p: number[], s: number[]) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(p[0], p[1], p[2]); m.scale.set(s[0], s[1], s[2]); g.add(m); return m;
  }
  const b = (g: THREE.Object3D, c: string, p: number[], s: number[]) => mesh(g, box, c, p, s);
  function label(g: THREE.Object3D, text: string, y: number, width = 3) {
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 128;
    const c = cv.getContext("2d")!;
    c.fillStyle = "#29493f"; c.fillRect(0, 0, 512, 128);
    c.strokeStyle = "#e5bd76"; c.lineWidth = 5; c.strokeRect(8, 8, 496, 112);
    c.fillStyle = "#fff0cd"; c.font = "600 44px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 256, 67, 480);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide }));
    sign.position.set(0, y, .1); g.add(sign);
  }
  function person(color: string) {
    const g = new THREE.Group();
    mesh(g, cylinder, color, [0, 1.05, 0], [.3, .85, .24]);
    b(g, "#dfb351", [0, .85, .01], [.63, .10, .5]);
    mesh(g, ball, "#bd8969", [0, 1.7, 0], [.23, .26, .22]);
    mesh(g, cylinder, "#3e302c", [0, 1.93, 0], [.29, .14, .28]);
    const legs = [-1, 1].map(s => b(g, "#343335", [s * .14, .31, 0], [.19, .62, .2]));
    const arms = [-1, 1].map(s => b(g, color, [s * .37, 1.08, 0], [.17, .72, .19]));
    return { g, legs, arms };
  }
  const fires: { g: THREE.Group; flame: THREE.Group; glow: THREE.Mesh; phase: number }[] = [];
  const fireMat = new THREE.MeshBasicMaterial({ color: "#ff8a26", toneMapped: false });
  const coreMat = new THREE.MeshBasicMaterial({ color: "#ffeb9c", toneMapped: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: "#ffb457", transparent: true, opacity: 0, depthWrite: false });
  function fire(parent: THREE.Object3D, x: number, z: number, torch: boolean, phase: number) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    if (torch) {
      b(g, "#553e30", [0, 1.1, 0], [.16, 2.2, .16]);
      mesh(g, cylinder, "#373333", [0, 2.18, 0], [.26, .25, .26]);
    } else {
      for (let i = 0; i < 9; i++) mesh(g, ball, "#77756b", [Math.sin(i * .7) * .9, .13, Math.cos(i * .7) * .9], [.3, .2, .24]);
      for (let i = 0; i < 3; i++) { const log = b(g, "#513729", [0, .22, 0], [1.2, .22, .22]); log.rotation.y = i * 1.05; }
    }
    const flame = new THREE.Group(); flame.position.y = torch ? 2.3 : .4; g.add(flame);
    const outer = new THREE.Mesh(new THREE.ConeGeometry(torch ? .21 : .45, torch ? .7 : 1.2, 7), fireMat); outer.position.y = .3; flame.add(outer);
    const core = new THREE.Mesh(new THREE.ConeGeometry(torch ? .12 : .26, .65, 6), coreMat); core.position.set(0, .22, .06); flame.add(core);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(torch ? 2.2 : 4, 24), glowMat.clone()); glow.rotation.x = -Math.PI / 2; glow.position.y = .025; g.add(glow);
    fires.push({ g, flame, glow, phase });
  }
  const [site] = SITES;
  const foundations: { x: number; z: number; top: number }[] = [];
  const colors = ["#387b80", "#b4513d", "#706394", "#46644b"];
  // Exactly 18 of 24 gers have a small, lesson-specific vignette.
  const captions = ["Тавтай морил", "Ярилцъя", "Төгрөг", "Бэлэг дурсгал", "Цайны газар", "Зочид буудал", "Такси", "Автобус", "Газрын зураг", "Аян зам", "Холбоо", "Сургууль", "Эмнэлэг", "Эмийн сан", "Тусламж", "Дулаан хувцас", "Уулзах газар", "Мэдээлэл", "Зочлох ёс", "Мал сүрэг", "Цагаан идээ", "Нүүдэл", "Наадам", "Цагаан сар", ...VOCABULARY_GERS.map(ger => ger.caption)];
  TOWN.forEach((d, i) => {
    const x = site.x + d.x, z = site.z + d.z, top = platformHeight(x, z);
    foundations.push({ x, z, top });
    const bottom = groundHeight(x, z) - 1.6;
    mesh(root, cylinder, "#716552", [x, (bottom + top) / 2, z], [6.15, top - bottom, 6.15]);
    mesh(root, cylinder, "#b6a18a", [x, top - .09, z], [6.25, .18, 6.25]);
    const porch = new THREE.Group(); porch.position.set(x, top, z); porch.rotation.y = d.rot; root.add(porch);
    b(porch, "#947454", [0, -.08, 5.8], [2.2, .18, 1.5]);
    // Stairs follow the slope instead of disappearing into it.
    for (let s = 0; s < 4; s++) b(porch, "#8b795f", [0, -.18 - s * .22, 6.4 + s * .42], [2.15, .26, .5]);
    fire(porch, -3.2, 4.9, true, i);
    fire(porch, 3.2, 4.9, true, i + 1);
    if (i % 4 === 0) fire(porch, -7.5, 0, false, i + 2);
    const vignette = new THREE.Group();
    // Place beside the ger on its outer edge; the central road and doorway stay clear.
    vignette.position.set(x + 7.8, groundHeight(x + 7.8, z), z);
    vignette.rotation.y = d.rot; root.add(vignette);
    if ((d.path === "conversation" && i % 4 === 3 && i !== 3) || i === 2) {
      // every ger still gets its name sign, without a scene around it
      for (const sx of [-1, 1]) b(vignette, "#634b35", [sx, 1.1, 0], [.12, 2.2, .12]);
      label(vignette, captions[i], 2, 3);
      return;
    }
    const stall = [3, 4, 13, 15, 20, 23, 28].includes(i);
    if (stall) {
      b(vignette, "#835434", [0, .8, 0], [3.1, .2, 1.5]);
      for (const sx of [-1.4, 1.4]) for (const sz of [-.6, .6]) b(vignette, "#795136", [sx, 1.25, sz], [.1, 2.5, .1]);
      for (let j = 0; j < 7; j++) b(vignette, j % 2 ? "#e6c98f" : colors[i % 4], [-1.5 + j * .5, 2.6, 0], [.5, .16, 1.9]);
      label(vignette, captions[i], 2.2, 2.6);
      if (i === 3 || i === 15) {
        // Deel on a rack, felt boots, and small painted souvenirs.
        b(vignette, "#563f30", [-2, 1.7, 0], [.1, 3.4, .1]);
        b(vignette, "#563f30", [-2, 3.05, 0], [1.5, .1, .1]);
        b(vignette, "#ad3d39", [-2, 2.3, 0], [.72, 1.25, .2]);
        b(vignette, "#d4ad5e", [-2, 2.4, .12], [.76, .08, .05]);
        for (const s of [-1, 1]) b(vignette, "#ad3d39", [-2 + s * .48, 2.7, 0], [.3, .5, .2]);
      }
      for (let j = 0; j < 4; j++) mesh(vignette, ball, [3, 15].includes(i) ? "#e4b44f" : "#eee1ba", [-1 + j * .6, 1.05, .25], [.22, .18, .22]);
      const vendor = person(colors[i % 4]); vendor.g.position.set(.2, 0, -.7); vignette.add(vendor.g);
    } else {
      for (const sx of [-1, 1]) b(vignette, "#634b35", [sx, 1.1, 0], [.12, 2.2, .12]);
      label(vignette, captions[i], 2, 3);
      if ([6, 7, 9].includes(i)) {
        b(vignette, i === 6 ? "#c5a14e" : "#5b8d8e", [0, .65, -.4], [3.4, .85, 1.5]);
        b(vignette, "#cbdcdb", [0, 1.35, -.4], [1.9, .6, 1.3]);
        for (const sx of [-1.1, 1.1]) for (const sz of [-1.1, .3]) { const wheel = mesh(vignette, cylinder, "#343536", [sx, .35, sz], [.32, .2, .32]); wheel.rotation.x = Math.PI / 2; }
      } else if ([12, 14, 17].includes(i)) {
        b(vignette, "#f1ead8", [0, .65, -.3], [1.4, 1.1, .7]);
        b(vignette, "#a84c40", [0, .7, .07], [.2, .65, .03]); b(vignette, "#a84c40", [0, .7, .07], [.65, .2, .03]);
      } else if (i === 26 || i === 27) {
        // A counting rack identifies the two number gers from the road.
        for (const sx of [-1.2, 1.2]) b(vignette, "#795136", [sx, .7, -.3], [.12, 1.4, .12]);
        for (let row = 0; row < (i === 26 ? 1 : 2); row++) {
          b(vignette, "#c4a36b", [0, .65 + row * .35, -.3], [2.4, .06, .06]);
          for (let bead = 0; bead < 5; bead++) mesh(vignette, ball, row ? "#c48c42" : "#a95f49", [-.9 + bead * .45, .65 + row * .35, -.3], [.16, .18, .16]);
        }
      } else {
        b(vignette, "#926b45", [0, .55, -.3], [2.4, .15, .8]);
        for (const sx of [-.9, .9]) b(vignette, "#705039", [sx, .25, -.3], [.15, .5, .65]);
        const local = person(colors[i % 4]); local.g.position.set(1.7, 0, -.3); vignette.add(local.g);
      }
    }
  });
  const walkers = Array.from({ length: low ? 8 : 16 }, (_, i) => {
    const p = person(colors[i % 4]); root.add(p.g);
    return { ...p, base: i * (650 / (low ? 8 : 16)), direction: i % 2 ? 1 : -1, phase: i * 1.7 };
  });
  // Small steppe animals: sheep, goats and marmots, grazing away from doors and stalls.
  const animals = Array.from({ length: low ? 14 : 30 }, (_, i) => {
    const g = new THREE.Group(); root.add(g);
    const marmot = i % 5 === 0, goat = i % 3 === 0;
    const color = marmot ? "#9c7951" : goat ? "#8e7863" : "#e7dfcb";
    mesh(g, ball, color, [0, marmot ? .28 : .65, 0], marmot ? [.24, .3, .45] : [.43, .45, .72]);
    const head = mesh(g, ball, marmot ? color : "#6c6051", [0, marmot ? .48 : .88, .58], [.22, .25, .26]);
    for (const s of [-1, 1]) mesh(g, ball, color, [s * .2, marmot ? .58 : 1.03, .58], [.09, .15, .08]);
    if (!marmot) for (const sx of [-.25, .25]) for (const sz of [-.4, .4]) b(g, "#5c5045", [sx, .25, sz], [.1, .5, .1]);
    if (goat && !marmot) for (const sx of [-.12, .12]) mesh(g, cylinder, "#c7b997", [sx, 1.18, .53], [.035, .35, .035]);
    const x = site.x + 150 - i * (650 / (low ? 14 : 30));
    return { g, head, x, z: site.z + trailZ(x - site.x) + (i % 2 ? 23 : -31), phase: i * 2.3 };
  });
  // Keep a fixed shader light count. Only the nearest flames get real inverse-square point lights.
  const lights = Array.from({ length: low ? 3 : 5 }, () => { const l = new THREE.PointLight("#ffb462", 0, 24, 2); scene.add(l); return l; });
  const worldPos = new THREE.Vector3();
  let time = 0, lightClock = 1;
  let nearest = fires.slice(0, lights.length);
  return {
    foundations,
    update(dt: number, tod: number, camera: THREE.Camera) {
      if (!reduced) time += dt;
      const night = THREE.MathUtils.smoothstep(tod, .25, .59);
      fires.forEach((f) => {
        f.flame.visible = night > .015;
        const flicker = 1 + .10 * Math.sin(time * 9 + f.phase) + .05 * Math.sin(time * 17 + f.phase);
        f.flame.scale.set(.85 + flicker * .15, flicker * night, .85 + flicker * .15);
        (f.glow.material as THREE.MeshBasicMaterial).opacity = night * .14 * flicker;
      });
      lightClock += dt;
      if (lightClock > .5) {
        lightClock = 0;
        nearest = [...fires].sort((a, b) => a.g.getWorldPosition(worldPos).distanceToSquared(camera.position) - b.g.getWorldPosition(new THREE.Vector3()).distanceToSquared(camera.position)).slice(0, lights.length);
      }
      lights.forEach((l, i) => {
        const f = nearest[i]; f.flame.getWorldPosition(l.position); l.position.y += .4;
        l.intensity = night * 38 * (1 + .07 * Math.sin(time * 9 + f.phase));
      });
      walkers.forEach((p) => {
        const localX = ((p.base + time * p.direction * .6 + 650) % 650 + 650) % 650 - 500;
        const x = site.x + localX, z = site.z + trailZ(localX) + p.direction * .65;
        p.g.position.set(x, groundHeight(x, z) + .04, z);
        p.g.rotation.y = p.direction * Math.PI / 2;
        p.legs.forEach((leg, j) => { leg.rotation.x = Math.sin(time * 3.8 + p.phase + j * Math.PI) * .38; });
        p.arms.forEach((arm, j) => { arm.rotation.x = -Math.sin(time * 3.8 + p.phase + j * Math.PI) * .25; });
      });
      animals.forEach((a) => {
        const x = a.x + Math.sin(time * .055 + a.phase) * 1.7, z = a.z + Math.cos(time * .04 + a.phase) * 1.2;
        a.g.position.set(x, groundHeight(x, z), z); a.g.rotation.y = a.phase + Math.sin(time * .06) * .35;
        a.head.rotation.x = .15 + Math.sin(time * .8 + a.phase) * .2;
      });
    },
  };
}
