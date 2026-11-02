"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Providers";
import { DEMO_KEY, EMPTY, loadProgress, saveProgress, type Progress } from "@/lib/progress";

/** Logged-in learner + their progress. Sends logged-out people to /login. */
export function useLearner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);

  // Supabase hands out a new user object on every auth event (even on tab focus),
  // so depend on these strings: progress must only reload when the person changes.
  const userId = user?.id;
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "friend";

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      router.replace("/login");
      return;
    }
    let stale = false;
    loadProgress(userId, name).then((p) => {
      if (stale) return;
      // Carry over the free demo: they already met 5 friendly letters (endowed progress).
      let next = p;
      try {
        if (localStorage.getItem(DEMO_KEY) && !p.completed.includes("friends")) {
          next = { ...p, xp: p.xp + 5 };
          localStorage.removeItem(DEMO_KEY);
          saveProgress(userId, next);
        }
      } catch {}
      setProgress(next);
    });
    return () => {
      stale = true;
    };
  }, [userId, name, loading, router]);

  const update = useCallback(
    async (p: Progress) => {
      setProgress(p);
      if (userId) await saveProgress(userId, p);
    },
    [userId],
  );

  return { user, progress: progress ?? (loading || !user ? null : EMPTY), ready: !!progress, update };
}
