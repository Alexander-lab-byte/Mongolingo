// Plans and what is free. Prices and the reasons behind them: docs/BUSINESS.md.
import { LESSONS } from "./lessons";

export type PlanId = "free" | "month" | "year" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // ₮, paid once (no auto-renew)
  usd: string; // shown for visitors, ≈ at ₮3,600 / $1
  per: string;
  days: number | null; // how long a pass lasts
  tagline: string;
  perks: string[];
  best?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    usd: "$0",
    per: "forever",
    days: null,
    tagline: "Every lesson, every game. Free for everyone.",
    perks: [
      "All lessons: alphabet, ger-town and 100 topic lessons",
      "Word herd and Sign rush games",
      "Translator + ready phrases, no account",
      "Streaks, flashcards and a monthly streak freeze",
    ],
  },
  {
    id: "month",
    name: "Yarii AI · 30 days",
    price: 24900,
    usd: "≈ $6.90",
    per: "once, for 30 days",
    days: 30,
    tagline: "For your trip. Pay once, it simply ends.",
    perks: ["Talk practice with AI characters", "Photo reader for signs and menus", "Say it for me + your own lessons", "60 AI uses a day, no auto-renew"],
  },
  {
    id: "year",
    name: "Yarii AI · 1 year",
    price: 149000,
    usd: "≈ $41",
    per: "once, for 12 months",
    days: 365,
    tagline: "For people who live here. Half the price of 12 monthly passes.",
    perks: ["Everything in the 30-day pass", "A Mongolian friend in your pocket all year", "All new AI tools we add", "No auto-renew"],
    best: true,
  },
  {
    id: "team",
    name: "Teams",
    price: 99000,
    usd: "≈ $27.50",
    per: "per person, per year (5+ people)",
    days: 365,
    tagline: "For companies, universities and embassies with foreign staff or students.",
    perks: ["1-year Yarii AI for every person", "One invoice for the whole team", "Add people any time"],
  },
];

export const plan = (id: PlanId) => PLANS.find((p) => p.id === id)!;
export const TRIAL_DAYS = 7;
export const LESSON_COUNT = LESSONS.length;

export const tugrik = (n: number) => `${n.toLocaleString("en-US")}₮`;
