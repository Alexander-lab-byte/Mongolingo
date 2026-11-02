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

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const name = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "friend";
    loadProgress(user.id, name).then((p) => {
      // Carry over the free demo: they already met 5 friendly letters (endowed progress).
      let next = p;
      try {
        if (localStorage.getItem(DEMO_KEY) && !p.completed.includes("friends")) {
          next = { ...p, xp: p.xp + 5 };
          localStorage.removeItem(DEMO_KEY);
          saveProgress(user.id, next);
        }
      } catch {}
      setProgress(next);
    });
  }, [user, loading, router]);

  const update = useCallback(
    async (p: Progress) => {
      setProgress(p);
      if (user) await saveProgress(user.id, p);
    },
    [user],
  );

  return { user, progress: progress ?? (loading || !user ? null : EMPTY), ready: !!progress, update };
}
