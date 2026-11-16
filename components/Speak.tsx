"use client";

import { LoaderCircle, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./speak.module.css";

// Keep pronunciation from separate controls from overlapping.
let stopCurrent: (() => void) | undefined;

export function Speak({ text, label = "Listen" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const cleanup = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cleanup.current?.(), [text]);

  async function play() {
    if (state === "loading" || state === "playing") { cleanup.current?.(); return; }
    stopCurrent?.();
    let cancelled = false;
    let audio: HTMLAudioElement | undefined;
    const stop = () => {
      cancelled = true;
      audio?.pause();
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.removeAttribute("src");
        audio.load();
      }
      if (stopCurrent === stop) stopCurrent = undefined;
      window.speechSynthesis?.cancel();
      setState("idle");
    };
    cleanup.current = stop;
    stopCurrent = stop;
    setState("loading");
    try {
      // Start inside the user's click so mobile browsers allow playback.
      // The endpoint serves a checked-in recording; no synthesis request is needed.
      audio = new Audio(`/api/speech?text=${encodeURIComponent(text)}`);
      audio.onended = stop;
      audio.onerror = () => { stop(); setState("error"); };
      await audio.play();
      if (!cancelled) setState("playing");
    } catch {
      if (cancelled) return;
      const voice = window.speechSynthesis?.getVoices().find(v => /^mn(?:-|$)/i.test(v.lang));
      if (voice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = .8;
        utterance.onend = stop;
        utterance.onerror = () => { stop(); setState("error"); };
        window.speechSynthesis.speak(utterance);
        setState("playing");
      } else { stop(); setState("error"); }
    }
  }
  return <span className={styles.control}>
    <button type="button" className={styles.button} onClick={play}
      aria-label={`${state === "loading" || state === "playing" ? "Stop" : label}: ${text}`}
      aria-pressed={state === "playing"} title="Hear Mongolian pronunciation">
      {state === "loading" ? <LoaderCircle size={18} className={styles.spinner} aria-hidden /> : state === "playing" ? <Square size={16} aria-hidden /> : <Volume2 size={18} aria-hidden />}
      {state === "loading" ? "Loading…" : state === "playing" ? "Stop" : state === "error" ? "Try audio again" : label}
    </button>
    {state === "error" && <small role="status">Audio unavailable. Check your connection and retry.</small>}
  </span>;
}
