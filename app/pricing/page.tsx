import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Pricing } from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Plans · Yarii",
  description:
    "Every lesson and game is free. Yarii AI (talk practice, photo reader, say-it-for-me) is a 30-day or 1-year pass, paid once with QPay. No auto-renew.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <Pricing />
    </>
  );
}
