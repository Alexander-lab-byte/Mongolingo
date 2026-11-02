"use client";

import Link from "next/link";
import { useAuth, useTextSize, TEXT_SCALES } from "./Providers";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-black text-xl text-ink" aria-label="Mongolingo home">
      <span
        aria-hidden
        className="grid h-[44px] w-[44px] place-items-center rounded-2xl bg-mn-red text-[24px] text-white shadow-[0_3px_0_#8f0b20]"
      >
        М
      </span>
      <span className="hidden min-[420px]:inline">Mongolingo</span>
    </Link>
  );
}

export function TextSizeControl() {
  const { scale, setScale } = useTextSize();
  return (
    <div role="group" aria-label="Text size" className="flex items-center rounded-full border-3 border-ink bg-white p-1">
      {TEXT_SCALES.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => setScale(s)}
          aria-pressed={scale === s}
          aria-label={["Normal text", "Bigger text", "Biggest text"][i]}
          className={`grid h-[44px] min-w-[44px] place-items-center rounded-full px-1.5 font-black sm:px-2 ${
            scale === s ? "bg-ink text-white" : "text-ink hover:bg-sun-soft"
          }`}
          style={{ fontSize: `${14 + i * 5}px` }}
        >
          A
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { user, loading } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b-3 border-line bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <TextSizeControl />
          {!loading && user ? (
            <Link href="/learn" className="btn btn-primary px-4 text-[17px] sm:px-6">
              My lessons
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary px-4 text-[17px] sm:px-6">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
