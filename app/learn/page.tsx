import type { Metadata } from "next";
import { Town } from "@/components/Town";

export const metadata: Metadata = { title: "Ger town · Yarii" };

export default function LearnHome() {
  return <Town />;
}
