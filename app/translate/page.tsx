import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Translator } from "@/components/Translator";
import { Phrasebook } from "@/components/Phrasebook";

export const metadata: Metadata = {
  title: "Translate English ⇄ Mongolian · Mongolingo",
  description: "Free English–Mongolian translator with pronunciation, plus ready phrases for taxis, shops, cafés and doctors.",
};

export default function TranslatePage() {
  return (
    <>
      <Nav />
      <main className="bg-gradient-to-b from-white to-paper px-4 pb-24 pt-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Translate</h1>
          <p className="mt-3 text-xl text-ink-soft">Free. No sign-up.</p>
          <div className="mt-8">
            <Translator />
          </div>

          <h2 id="phrases" className="mt-16 scroll-mt-24 text-3xl font-bold sm:text-4xl">
            Ready phrases
          </h2>
          <p className="mt-2 text-lg text-ink-soft">Tap a phrase to show it full screen.</p>
          <div className="mt-6">
            <Phrasebook />
          </div>
        </div>
      </main>
    </>
  );
}
