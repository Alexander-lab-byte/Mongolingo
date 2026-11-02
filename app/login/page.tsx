"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Mail, PlayCircle } from "lucide-react";
import { Logo, TextSizeControl } from "@/components/Nav";
import { useAuth } from "@/components/Providers";
import { getSupabase } from "@/lib/supabase";
import { startGuest } from "@/lib/progress";

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
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-b from-white to-sky-soft p-12 pb-56 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="relative z-10">
          <p className="font-display whitespace-nowrap text-[clamp(3.5rem,6vw,5.5rem)] font-extrabold leading-none text-cobalt">Сайн уу</p>
          <p className="mt-4 text-2xl text-ink-soft">means hello.</p>
        </div>
        <svg viewBox="0 0 600 200" className="absolute inset-x-0 bottom-0 w-full" aria-hidden>
          <path d="M0 120 L90 60 L170 110 L260 40 L360 110 L450 70 L600 130 L600 200 L0 200Z" fill="#e2dcd6" />
          <path d="M0 160 C150 130 300 150 450 140 C520 135 560 140 600 150 L600 200 L0 200Z" fill="#d8c9b8" />
          <circle cx="480" cy="40" r="22" fill="#e8b04b" />
        </svg>
      </aside>

      <div className="flex flex-col bg-paper">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 lg:border-0 lg:bg-transparent lg:px-8 lg:py-6">
          <span className="lg:hidden">
            <Logo />
          </span>
          <span className="hidden lg:block" />
          <span className="lg:hidden">
            <TextSizeControl />
          </span>
          <span className="hidden lg:block">
            <TextSizeControl dark={false} />
          </span>
        </header>
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 pt-8 lg:pt-12">
          <h1 className="text-3xl font-bold sm:text-4xl">{isSignup ? "Create your free account" : "Welcome back"}</h1>
          <p className="mt-3 text-lg text-ink-soft">
            {isSignup ? "Save your progress." : "Continue where you stopped."}
          </p>

          <div role="tablist" aria-label="Log in or sign up" className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-white p-1 ring-1 ring-line">
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
                className={`min-h-12 rounded-full font-semibold transition ${mode === m ? "bg-night text-white" : "text-ink hover:bg-sky-soft"}`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-6" noValidate>
            {isSignup && (
              <Field label="Your name" hint="What should we call you?">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required />
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
              <div className="relative">
                <input
                  className="input pr-24"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 min-h-11 -translate-y-1/2 rounded-full px-4 font-semibold text-cobalt hover:bg-sky-soft"
                  onClick={() => setShow(!show)}
                  aria-pressed={show}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="flex gap-3 rounded-2xl bg-bad-soft p-4 font-medium text-ink">
                <AlertCircle className="mt-0.5 shrink-0 text-bad" size={22} aria-hidden />
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="flex gap-3 rounded-2xl bg-ok-soft p-4 font-medium text-ink">
                <Mail className="mt-0.5 shrink-0 text-ok" size={22} aria-hidden />
                {info}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
              {busy ? "Please wait…" : isSignup ? "Create my account" : "Log in"}
            </button>
          </form>
          <div className="mt-8 flex items-center gap-4 text-ink-soft" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            className="btn btn-line mt-6 w-full text-lg text-ink"
            onClick={() => {
              startGuest();
              router.push("/learn");
            }}
          >
            <PlayCircle size={22} aria-hidden /> See a demo
          </button>
          <p className="mt-3 text-center text-ink-soft">Look around the lessons. No account needed.</p>
        </main>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-lg font-semibold">{label}</span>
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
