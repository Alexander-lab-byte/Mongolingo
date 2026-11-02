import { getSupabase } from "./supabase";

export type Progress = {
  displayName: string;
  completed: string[];
  xp: number;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
  reviewDue: Record<string, { due: string; step: number }>;
};

// Spaced review gaps in days (spacing effect, Cepeda et al. 2006).
const REVIEW_GAPS = [1, 3, 7, 14, 30];

export const EMPTY: Progress = {
  displayName: "",
  completed: [],
  xp: 0,
  streak: 0,
  lastActive: null,
  reviewDue: {},
};

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return today(d);
}

const localKey = (userId: string) => `mongolingo_progress_${userId}`;

function readLocal(userId: string): Progress | null {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function writeLocal(userId: string, p: Progress) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(p));
  } catch {
    /* storage may be blocked — the database copy still works */
  }
}

export async function loadProgress(userId: string, fallbackName: string): Promise<Progress> {
  const local = readLocal(userId);
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("progress").select("*").eq("user_id", userId).maybeSingle();
    if (!error && data) {
      const p: Progress = {
        displayName: data.display_name ?? fallbackName,
        completed: data.completed_lessons ?? [],
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        lastActive: data.last_active,
        reviewDue: data.review_due ?? {},
      };
      writeLocal(userId, p);
      return p;
    }
  }
  return local ?? { ...EMPTY, displayName: fallbackName };
}

export async function saveProgress(userId: string, p: Progress) {
  writeLocal(userId, p);
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("progress").upsert({
    user_id: userId,
    display_name: p.displayName,
    completed_lessons: p.completed,
    xp: p.xp,
    streak: p.streak,
    last_active: p.lastActive,
    review_due: p.reviewDue,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("Could not save progress:", error.message);
}

/** Returns new progress after finishing a lesson (new or review). */
export function finishLesson(p: Progress, lessonId: string, correctFirstTry: number, total: number): Progress {
  const t = today();
  let streak = p.streak;
  if (p.lastActive !== t) {
    streak = p.lastActive === addDays(t, -1) ? p.streak + 1 : 1;
  }
  const prev = p.reviewDue[lessonId];
  const isReview = p.completed.includes(lessonId);
  // If they did well, wait longer before the next review; if not, review again tomorrow.
  const good = correctFirstTry / Math.max(total, 1) >= 0.8;
  const step = isReview ? (good ? Math.min((prev?.step ?? 0) + 1, REVIEW_GAPS.length - 1) : 0) : 0;
  return {
    ...p,
    completed: isReview ? p.completed : [...p.completed, lessonId],
    xp: p.xp + 10 + correctFirstTry,
    streak,
    lastActive: t,
    reviewDue: { ...p.reviewDue, [lessonId]: { due: addDays(t, REVIEW_GAPS[step]), step } },
  };
}

export function dueReviews(p: Progress) {
  const t = today();
  return Object.entries(p.reviewDue)
    .filter(([, v]) => v.due <= t)
    .map(([id]) => id);
}

// Demo (try-before-signup) progress is kept in the browser until the person makes an account.
export const DEMO_KEY = "mongolingo_demo_done";
