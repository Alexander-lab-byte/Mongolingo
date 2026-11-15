"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Providers";
import { daysLeft, isActive, loadPass, PASS_EVENT, startTrial, type Pass } from "@/lib/pass";

/** The current person's pass. `ready` is false until it has been checked. */
export function usePass() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  // Time is only read in effects and handlers (never while rendering), so pages can be prerendered.
  const [state, setState] = useState<{ pass: Pass | null; active: boolean; days: number }>({ pass: null, active: false, days: 0 });
  const [ready, setReady] = useState(false);
  const setPass = useCallback((p: Pass | null) => setState({ pass: p, active: isActive(p), days: daysLeft(p) }), []);

  useEffect(() => {
    if (loading) return;
    let stale = false;
    loadPass(userId).then((p) => {
      if (stale) return;
      setPass(p);
      setReady(true);
    });
    return () => {
      stale = true;
    };
  }, [userId, loading, setPass]);

  useEffect(() => {
    const onChange = (e: Event) => setPass((e as CustomEvent<Pass | null>).detail);
    window.addEventListener(PASS_EVENT, onChange);
    return () => window.removeEventListener(PASS_EVENT, onChange);
  }, [setPass]);

  const trial = useCallback(async () => {
    const res = await startTrial(userId);
    if (res.pass) {
      setPass(res.pass);
      window.dispatchEvent(new CustomEvent(PASS_EVENT, { detail: res.pass }));
    }
    return res;
  }, [userId, setPass]);

  return { pass: state.pass, active: state.active, daysLeft: state.days, ready, signedIn: !!userId, trial };
}
