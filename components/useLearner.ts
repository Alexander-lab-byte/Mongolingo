"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Providers";
import { DEMO_KEY, EMPTY, GUEST_ID, isGuest, loadProgress, saveProgress, type Progress } from "@/lib/progress";

const PROGRESS_EVENT = "mongolingo-progress";

/** Logged-in learner (or guest demo) + their progress. Sends everyone else to /login. */
export function useLearner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    if (loading) return;
    const asGuest = !user && isGuest();
    if (!user && !asGuest) {
      router.replace("/login");
      return;
    }
    const id = user?.id ?? GUEST_ID;
    const name = user
      ? (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "friend"
      : "Guest";
    loadProgress(id, name).then((p) => {
      // Carry over the free mini lesson: they already met 5 friendly letters (endowed progress).
      let next = p;
      try {
        if (user && localStorage.getItem(DEMO_KEY) && !p.completed.includes("friends")) {
          next = { ...p, xp: p.xp + 5 };
          localStorage.removeItem(DEMO_KEY);
          saveProgress(id, next);
        }
      } catch {}
      setGuest(asGuest);
      setProgress(next);
    });
  }, [user, loading, router]);

  // Keep every open screen (including pages kept alive in the background) in sync.
  useEffect(() => {
    const onChange = (e: Event) => setProgress((e as CustomEvent<Progress>).detail);
    window.addEventListener(PROGRESS_EVENT, onChange);
    return () => window.removeEventListener(PROGRESS_EVENT, onChange);
  }, []);

  const update = useCallback(
    async (p: Progress) => {
      setProgress(p);
      window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: p }));
      await saveProgress(user?.id ?? GUEST_ID, p);
    },
    [user],
  );

  return { user, guest, progress: progress ?? (loading ? null : EMPTY), ready: !!progress, update };
}
