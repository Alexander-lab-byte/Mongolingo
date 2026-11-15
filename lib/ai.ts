// Shared by the Yarii AI page (browser) and /api/ai (server).
import { getSupabase } from "./supabase";
export { ROLEPLAYS } from "./roleplays";


export type AiMode = "tutor" | "roleplay" | "sayit" | "photo" | "lesson";
export type AiResult = { text?: string; error?: string; code?: string; usage?: { used: number; limit: number } };

/** Calls /api/ai with the learner's login, so the server can check their pass. */
export async function askAI(payload: Record<string, unknown> & { mode: AiMode }): Promise<AiResult> {
  const sb = getSupabase();
  const { data } = sb ? await sb.auth.getSession() : { data: { session: null } };
  const token = data.session?.access_token;
  if (!token) return { code: "not_signed_in", error: "Please log in to use Yarii AI." };
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return (await res.json()) as AiResult;
  } catch {
    return { code: "network", error: "Can't reach Yarii AI. Check your internet and try again." };
  }
}

/** Pulls the first {...} block out of a reply and parses it. */
export function parseJson<T>(text: string | undefined): T | null {
  if (!text) return null;
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(text.slice(a, b + 1)) as T;
  } catch {
    return null;
  }
}

/** Reads MN:/SAY:/EN:/TIP: lines from a role-play reply. */
export function parseRoleplay(text: string) {
  const get = (k: string) => text.match(new RegExp(`^${k}:\\s*(.+)$`, "mi"))?.[1]?.trim();
  return { mn: get("MN"), say: get("SAY"), en: get("EN"), tip: get("TIP"), raw: text };
}
