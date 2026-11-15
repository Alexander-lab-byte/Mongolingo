// A learner's pass (trial, 30-day, 1-year or team). Stored in Supabase `passes`
// (read-only for the learner; see supabase/passes.sql). Guests keep a trial in this browser only.
import { getSupabase } from "./supabase";
import { TRIAL_DAYS, type PlanId } from "./plans";

export type Pass = {
  plan: "trial" | Exclude<PlanId, "free">;
  validUntil: string; // ISO date-time
};

const GUEST_PASS = "mongolingo_guest_pass";

export function isActive(p: Pass | null, now = Date.now()) {
  return !!p && new Date(p.validUntil).getTime() > now;
}

export function daysLeft(p: Pass | null, now = Date.now()) {
  if (!p) return 0;
  return Math.max(0, Math.ceil((new Date(p.validUntil).getTime() - now) / 86_400_000));
}

function readGuest(): Pass | null {
  try {
    const raw = localStorage.getItem(GUEST_PASS);
    return raw ? (JSON.parse(raw) as Pass) : null;
  } catch {
    return null;
  }
}

export async function loadPass(userId: string | null): Promise<Pass | null> {
  if (!userId) return readGuest();
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("passes").select("plan, valid_until").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return { plan: data.plan, validUntil: data.valid_until };
}

/** Free 7-day trial, once per account (the database enforces "once"). */
export async function startTrial(userId: string | null): Promise<{ pass: Pass | null; error?: string }> {
  if (!userId) {
    const existing = readGuest();
    if (existing) return { pass: existing, error: existing && !isActive(existing) ? "Your free trial has ended." : undefined };
    const pass: Pass = { plan: "trial", validUntil: new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString() };
    try {
      localStorage.setItem(GUEST_PASS, JSON.stringify(pass));
    } catch {}
    return { pass };
  }
  const sb = getSupabase();
  if (!sb) return { pass: null, error: "Sign-in is not set up yet." };
  const { data, error } = await sb.rpc("start_trial");
  if (error) return { pass: null, error: "Could not start the trial. Please try again." };
  const pass: Pass = { plan: data.plan, validUntil: data.valid_until };
  if (!isActive(pass)) return { pass, error: "You have already used your free trial." };
  return { pass };
}

/** Asks for a QPay invoice. We send it by email; the pass starts when it is paid. */
export async function requestPass(input: { plan: Exclude<PlanId, "free">; contact: string; seats?: number; note?: string }) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Payments are not set up yet." };
  const { error } = await sb.from("pass_requests").insert({
    plan: input.plan,
    contact: input.contact.trim(),
    seats: input.plan === "team" ? input.seats ?? 5 : null,
    note: input.note?.trim() || null,
  });
  if (error) return { ok: false, error: "Could not send your request. Please check the details and try again." };
  return { ok: true };
}

export const PASS_EVENT = "mongolingo-pass";
