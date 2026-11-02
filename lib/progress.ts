import { getSupabase } from "./supabase";

export type Progress = {
  displayName: string;
  completed: string[];
  xp: number;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
  reviewDue: Record<string, { due: string; step: number }>;
  // Flashcards (Leitner boxes), daily goal and stats — stored in the `extra` column.
  cards: Record<string, { box: number; due: string }>;
  goal: number; // cards per day
  day: { date: string; n: number }; // cards reviewed today
  reviewed: number;
  bestStreak: number;
  talks: string[]; // finished conversations
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
  cards: {},
  goal: 10,
  day: { date: "", n: 0 },
  reviewed: 0,
  bestStreak: 0,
  talks: [],
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
  const sb = userId === GUEST_ID ? null : getSupabase();
  if (sb) {
    const { data, error } = await sb.from("progress").select("*").eq("user_id", userId).maybeSingle();
    if (!error && data) {
      const p: Progress = {
        ...EMPTY,
        ...(data.extra ?? {}),
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
  const sb = userId === GUEST_ID ? null : getSupabase();
  if (!sb) return;
  const { error } = await sb.from("progress").upsert({
    user_id: userId,
    display_name: p.displayName,
    completed_lessons: p.completed,
    xp: p.xp,
    streak: p.streak,
    last_active: p.lastActive,
    review_due: p.reviewDue,
    extra: { cards: p.cards, goal: p.goal, day: p.day, reviewed: p.reviewed, bestStreak: p.bestStreak, talks: p.talks },
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("Could not save progress:", error.message);
}

/** Marks today as active and updates the streak. */
function touchDay(p: Progress): Progress {
  const t = today();
  let streak = p.streak;
  if (p.lastActive !== t) streak = p.lastActive === addDays(t, -1) ? p.streak + 1 : 1;
  return { ...p, streak, bestStreak: Math.max(p.bestStreak ?? 0, streak), lastActive: t };
}

/** Returns new progress after finishing a lesson (new or review). */
export function finishLesson(p0: Progress, lessonId: string, correctFirstTry: number, total: number): Progress {
  const p = touchDay(p0);
  const t = today();
  const streak = p.streak;
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

// Guest demo: explore the full learning area without an account. Saved only in this browser.
export const GUEST_ID = "guest";
const GUEST_KEY = "mongolingo_guest";

export function isGuest() {
  try {
    return localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

/** Starts a guest demo with sample progress, so every part of the app has something to show. */
export function startGuest() {
  try {
    localStorage.setItem(GUEST_KEY, "1");
    if (!localStorage.getItem(`mongolingo_progress_${GUEST_ID}`)) {
      const t = today();
      const sample: Progress = {
        ...EMPTY,
        bestStreak: 1,
        displayName: "Guest",
        completed: ["friends"],
        xp: 15,
        streak: 1,
        lastActive: t,
        reviewDue: { friends: { due: t, step: 0 } },
      };
      localStorage.setItem(`mongolingo_progress_${GUEST_ID}`, JSON.stringify(sample));
    }
  } catch {}
}

export function endGuest() {
  try {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(`mongolingo_progress_${GUEST_ID}`);
  } catch {}
}

// ---------- Flashcards (Leitner system: know it → wait longer; miss it → see it again soon) ----------
const CARD_GAPS = [0, 1, 2, 4, 8, 16]; // days per box

export function todayCount(p: Progress) {
  return p.day?.date === today() ? p.day.n : 0;
}

export function cardResult(p0: Progress, cardId: string, knew: boolean): Progress {
  const p = touchDay(p0);
  const t = today();
  const prev = p.cards[cardId]?.box ?? 0;
  const box = knew ? Math.min(prev + 1, CARD_GAPS.length - 1) : 1;
  return {
    ...p,
    cards: { ...p.cards, [cardId]: { box, due: knew ? addDays(t, CARD_GAPS[box]) : t } },
    day: { date: t, n: todayCount(p) + 1 },
    reviewed: (p.reviewed ?? 0) + 1,
    xp: p.xp + (knew ? 1 : 0),
  };
}

/** Cards to study now: due ones first (oldest first), then new ones. */
export function cardsToStudy<T extends { id: string }>(p: Progress, deck: T[], limit: number): T[] {
  const t = today();
  const due = deck.filter((c) => p.cards[c.id] && p.cards[c.id].due <= t).sort((a, b) => (p.cards[a.id].due < p.cards[b.id].due ? -1 : 1));
  const fresh = deck.filter((c) => !p.cards[c.id]);
  return [...due, ...fresh].slice(0, limit);
}

export function finishTalk(p0: Progress, id: string, firstTry: number): Progress {
  const p = touchDay(p0);
  return { ...p, talks: p.talks.includes(id) ? p.talks : [...p.talks, id], xp: p.xp + 5 + firstTry };
}
