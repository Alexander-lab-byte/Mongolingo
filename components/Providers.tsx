"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

type AuthState = { user: User | null; loading: boolean; signOut: () => Promise<void> };
const AuthCtx = createContext<AuthState>({ user: null, loading: true, signOut: async () => {} });

type SizeState = { scale: number; setScale: (n: number) => void };
const SizeCtx = createContext<SizeState>({ scale: 1, setScale: () => {} });

export const TEXT_SCALES = [1, 1.15, 1.3];

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // No Supabase keys → nothing to wait for.
  const [loading, setLoading] = useState(() => getSupabase() !== null);
  const [scale, setScaleState] = useState(1);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("mongolingo_text_scale"));
      // Browser-only setting, so it can only be read after the first render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (TEXT_SCALES.includes(saved)) setScaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--text-scale", String(scale));
  }, [scale]);

  const setScale = useCallback((n: number) => {
    setScaleState(n);
    try {
      localStorage.setItem("mongolingo_text_scale", String(n));
    } catch {}
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, signOut }}>
      <SizeCtx.Provider value={{ scale, setScale }}>{children}</SizeCtx.Provider>
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export const useTextSize = () => useContext(SizeCtx);
