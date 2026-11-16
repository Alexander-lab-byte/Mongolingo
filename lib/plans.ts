// Plans and what is free. Prices and the reasons behind them: docs/BUSINESS.md.
import { BASE_LESSONS } from "./lessons";
import { CURRICULUM } from "./curriculum";

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
    tagline: "Everything you need to stay safe and read the street.",
    perks: [
      "Translator + ready phrases, no account",
      "All 35 letters, street signs, numbers and money",
      "Greetings, Emergency, Doctor and Pharmacy gers",
      "Streaks, flashcards and spaced review",
    ],
  },
  {
    id: "month",
    name: "30-day Pass",
    price: 24900,
    usd: "≈ $6.90",
    per: "once, for 30 days",
    days: 30,
    tagline: "For your trip. Pay once, it simply ends.",
    perks: ["All 24 gers and 48 lessons", "Every conversation practice", "1 streak freeze", "No auto-renew, no surprise charges"],
  },
  {
    id: "year",
    name: "1-year Pass",
    price: 149000,
    usd: "≈ $41",
    per: "once, for 12 months",
    days: 365,
    tagline: "For people who live here. Half the price of 12 monthly passes.",
    perks: ["Everything in the 30-day Pass", "A streak freeze every month", "All new gers we add this year", "No auto-renew"],
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
    perks: ["1-year Pass for every person", "One invoice for the whole team", "Add people any time"],
  },
];

export const plan = (id: PlanId) => PLANS.find((p) => p.id === id)!;
export const TRIAL_DAYS = 7;

/** Gers that are always free. Safety phrases are never behind a paywall. */
export const FREE_GERS = new Set(["greet", "emergency", "doctor", "pharmacy"]);

const FREE_IDS = new Set([
  ...BASE_LESSONS.map((l) => l.id),
  ...CURRICULUM.filter((l) => l.ger && FREE_GERS.has(l.ger)).map((l) => l.id),
]);

export const isFreeLesson = (id: string) => FREE_IDS.has(id);
export const isFreeGer = (gerId: string) => FREE_GERS.has(gerId);
export const FREE_LESSON_COUNT = FREE_IDS.size;

export const tugrik = (n: number) => `${n.toLocaleString("en-US")}₮`;
