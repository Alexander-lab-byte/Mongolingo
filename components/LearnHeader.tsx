"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LibraryBig, Sparkles, TramFront, Wind } from "lucide-react";
import { Logo, TextSizeControl } from "./Nav";

const LINKS = [
  { href: "/learn", label: "Ger-town", icon: Home },
  { href: "/learn/packs", label: "100 lessons", icon: LibraryBig },
  { href: "/learn/herd", label: "Word herd", icon: Wind },
  { href: "/learn/rush", label: "Sign rush", icon: TramFront },
  { href: "/ai", label: "Yarii AI", icon: Sparkles },
];

/** Shared top bar for the learning pages outside the 3D town. */
export function LearnHeader() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo />
        <TextSizeControl />
      </div>
      <nav aria-label="Learning" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const on = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-semibold ${on ? "bg-cobalt text-white" : "text-ink hover:bg-sky-soft"}`}
            >
              <Icon size={18} aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
