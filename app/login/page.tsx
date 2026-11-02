"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, TextSizeControl } from "@/components/Nav";
import { useAuth } from "@/components/Providers";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    // Read ?mode=signup without useSearchParams, so the page can stay fully static.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup");
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace("/learn");
  }, [user, loading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    const sb = getSupabase();
    if (!sb) {
      setError("Login is not set up yet. Please try again later.");
      return;
    }
    if (password.length < 6) {
      setError("Your password needs at least 6 characters.");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() } },
      });
      setBusy(false);
      if (error) return setError(friendly(error.message));
      if (!data.session) setInfo("Almost done! We sent you an email. Open it and tap the link, then log in here.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(friendly(error.message));
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-sky">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Logo />
        <TextSizeControl />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16 pt-4">
        <div className="card p-6 sm:p-8">
          <div className="text-center text-6xl" aria-hidden>
            {isSignup ? "🏕️" : "👋"}
          </div>
          <h1 className="mt-2 text-center text-3xl font-black">
            {isSignup ? "Create your free account" : "Welcome back!"}
          </h1>
          <p className="mt-1 text-center text-lg text-ink-soft">
            {isSignup ? "Save your progress and keep learning." : "Log in to continue your lessons."}
          </p>

          <div role="tablist" aria-label="Log in or sign up" className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-cream p-1.5">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setInfo("");
                }}
                className={`min-h-12 rounded-full font-extrabold ${mode === m ? "bg-ink text-white" : "text-ink hover:bg-white"}`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
            {isSignup && (
              <Field label="Your name" hint="What should we call you?">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <input
                className="input"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password" hint={isSignup ? "At least 6 characters" : undefined}>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                />
                <button type="button" className="btn btn-ghost px-4" onClick={() => setShow(!show)} aria-pressed={show}>
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="rounded-2xl border-3 border-bad bg-bad-soft p-3 font-bold">
                ⚠️ {error}
              </p>
            )}
            {info && (
              <p role="status" className="rounded-2xl border-3 border-ok bg-ok-soft p-3 font-bold">
                📧 {info}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full text-xl" disabled={busy}>
              {busy ? "Please wait…" : isSignup ? "Create my account" : "Log in"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-lg">
          <Link href="/#try" className="font-bold underline underline-offset-4">
            ← Try a free lesson first
          </Link>
        </p>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-lg font-extrabold">{label}</span>
      {hint && <span className="-mt-1 text-ink-soft">{hint}</span>}
      {children}
    </label>
  );
}

function friendly(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "That email or password is not right. Please check and try again.";
  if (m.includes("already registered")) return "This email already has an account. Please log in instead.";
  if (m.includes("email not confirmed")) return "Please open the email we sent you and tap the link first.";
  if (m.includes("valid email") || m.includes("invalid email")) return "Please check your email address.";
  return msg;
}
