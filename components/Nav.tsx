"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { useAuth, useTextSize, TEXT_SCALES } from "./Providers";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 font-display text-[19px] font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}
      aria-label="Mongolingo home"
    >
      <svg width="44" height="44" viewBox="0 0 40 40" aria-hidden>
        <rect width="40" height="40" rx="12" fill="#563a1f" />
        <circle cx="29" cy="11" r="5" fill="#f2cf6a" />
        <path d="M7 31 L7 20 L20 12 L33 20 L33 31 Z" fill="#fff" />
        <rect x="7" y="20" width="26" height="3" fill="#a9c2a6" />
        <rect x="17" y="24" width="6" height="7" rx="1" fill="#a9c2a6" />
      </svg>
      <span className="hidden min-[420px]:inline">Mongolingo</span>
    </Link>
  );
}

export function TextSizeControl({ dark = false }: { dark?: boolean }) {
  const { scale, setScale } = useTextSize();
  return (
    <div
      role="group"
      aria-label="Text size"
      className={`flex items-center rounded-full p-1 ${dark ? "bg-white/10 ring-1 ring-white/20" : "bg-white ring-1 ring-line"}`}
    >
      {TEXT_SCALES.map((s, i) => {
        const on = scale === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setScale(s)}
            aria-pressed={on}
            aria-label={["Normal text", "Bigger text", "Biggest text"][i]}
            className={`grid h-[44px] min-w-[44px] place-items-center rounded-full font-bold transition ${
              on ? "bg-gold text-night" : dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-sky-soft"
            }`}
            style={{ fontSize: `${14 + i * 5}px` }}
          >
            A
          </button>
        );
      })}
    </div>
  );
}

export function Nav() {
  const { user, loading } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/translate"
            className="hidden h-[44px] min-w-[44px] place-items-center gap-2 rounded-full px-0 font-semibold text-ink ring-1 ring-line hover:bg-sky-soft min-[380px]:grid sm:flex sm:px-4"
            aria-label="Translate"
          >
            <Languages size={20} aria-hidden />
            <span className="hidden sm:inline">Translate</span>
          </Link>
          <TextSizeControl />
          <Link href={!loading && user ? "/learn" : "/login"} className="btn btn-primary px-4 text-[16px] sm:px-6">
            {!loading && user ? "My lessons" : "Log in"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
