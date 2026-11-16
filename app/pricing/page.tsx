import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Pricing } from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Plans · Yarii",
  description:
    "Free translator, alphabet and safety phrases forever. Unlock all 48 lessons with a 30-day or 1-year Pass. Pay once with QPay, no auto-renew.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <Pricing />
    </>
  );
}
