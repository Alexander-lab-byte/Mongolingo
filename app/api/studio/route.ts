import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/*
  Saves the 3D layout designed at /studio into lib/worldLayout.json.
  Only works while running `npm run dev` on your own computer — never on the live site.
*/

const FILE = path.join(process.cwd(), "lib", "worldLayout.json");
const isDev = process.env.NODE_ENV === "development";

const isNum = (n: unknown) => typeof n === "number" && Number.isFinite(n);
const isVec = (v: unknown) => Array.isArray(v) && v.length === 3 && v.every(isNum);

function valid(d: unknown): boolean {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  if (!Array.isArray(o.shots) || o.shots.length < 2) return false;
  if (!o.shots.every((s) => s && isVec(s.pos) && isVec(s.look) && isNum(s.tod) && typeof s.name === "string")) return false;
  if (!Array.isArray(o.gers) || !o.gers.every((g) => g && typeof g.id === "string" && [g.x, g.z, g.rot, g.scale].every(isNum))) return false;
  if (!Array.isArray(o.signs) || !o.signs.every((s) => s && typeof s.id === "string" && typeof s.text === "string" && [s.x, s.y, s.z, s.rot].every(isNum))) return false;
  return !!o.settings && typeof o.settings === "object";
}

export async function GET() {
  if (!isDev) return Response.json({ error: "Studio only works in development." }, { status: 403 });
  return Response.json(JSON.parse(await readFile(FILE, "utf8")));
}

export async function POST(request: Request) {
  if (!isDev) return Response.json({ error: "Studio only works in development." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!valid(body)) return Response.json({ error: "That layout looks broken, so it was not saved." }, { status: 400 });
  await writeFile(FILE, JSON.stringify(body, null, 2) + "\n", "utf8");
  return Response.json({ ok: true });
}
