import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Studio } from "@/components/world/Studio";

export const metadata: Metadata = { title: "3D Studio — Mongolingo", robots: { index: false } };

// The 3D studio is a design tool for your own computer only (npm run dev). On the live site it doesn't exist.
export default function StudioPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Studio />;
}
