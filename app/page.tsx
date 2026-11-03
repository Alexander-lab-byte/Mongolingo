import { Nav, Logo } from "@/components/Nav";
import { ScrollWorld } from "@/components/world/ScrollWorld";

export default function Home() {
  return (
    <>
      <a
        href="#try"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:p-3 focus:font-semibold"
      >
        Skip to the free lesson
      </a>
      <Nav />
      <main>
        <ScrollWorld />
      </main>
      <footer className="border-t border-white/10 bg-[#0f151c] px-4 py-8 text-[#f6ece0]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Logo dark />
          <p className="text-[#f6ece0]/75">Made in Ulaanbaatar</p>
        </div>
      </footer>
    </>
  );
}
