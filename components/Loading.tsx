"use client";

export function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper" role="status">
      <div className="flex flex-col items-center gap-4">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-cobalt" aria-hidden />
        <p className="text-xl font-semibold">Loading your lessons…</p>
      </div>
    </div>
  );
}
