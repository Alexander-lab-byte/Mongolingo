"use client";

import { useEffect, useState } from "react";

/**
 * Plays the word with the device's Mongolian voice — only if the device has one.
 * Most devices do NOT have a Mongolian voice, so we hide the button rather than
 * play a wrong (e.g. Russian) pronunciation.
 */
export function Speak({ text, label }: { text: string; label?: string }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("mn"));
      setVoice(v ?? null);
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  if (!voice) return null;
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.8;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }}
    >
      🔊 {label ?? "Listen"}
    </button>
  );
}
