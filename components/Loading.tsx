"use client";

export function Loading() {
  return (
    <div className="grid min-h-screen place-items-center" role="status">
      <div className="text-center">
        <div className="nudge text-6xl" aria-hidden>
          🏕️
        </div>
        <p className="mt-2 text-xl font-bold">Loading…</p>
      </div>
    </div>
  );
}
