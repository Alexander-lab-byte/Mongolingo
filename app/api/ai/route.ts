import { createClient } from "@supabase/supabase-js";
import { ROLEPLAYS } from "@/lib/roleplays";

/*
  Yarii AI (paid plan). One endpoint, five tools.
  Checks, in order: AI key set → signed in → active pass + daily limit (in the database: use_ai()) → valid input.
  Model: Claude Haiku 5.5 ($0.10 / $0.50 per million input / output tokens; docs/BUSINESS.md).
*/

const MODEL = "claude-haiku-5-5";
const MAX_IMAGE = 4_500_000; // base64 characters (~3.4 MB image)

const BASE = `You are Yarii, a warm, patient Mongolian tutor inside the Yarii app, for foreigners who live in or visit Mongolia.
Use simple English (many learners are not native English speakers).
Whenever you write Mongolian, use Cyrillic, then the Latin pronunciation in brackets, then the English meaning.
Use standard Khalkha Mongolian that people in Ulaanbaatar really say. Never invent words; if you are unsure, say so.
Stay on Mongolian language, culture and daily life in Mongolia; for anything else, kindly steer back.
Never give medical, legal or emergency advice beyond the words to use; in an emergency tell them to call 103 (ambulance), 102 (police) or 101 (fire).`;

type Msg = { role: "user" | "assistant"; content: string };
type Body =
  | { mode: "tutor"; messages: Msg[] }
  | { mode: "roleplay"; scenario: string; messages: Msg[] }
  | { mode: "sayit"; text: string }
  | { mode: "photo"; image: string; mediaType: string; question?: string }
  | { mode: "lesson"; topic: string };

const err = (status: number, code: string, error: string) => Response.json({ code, error }, { status });

function cleanMessages(m: unknown): Msg[] | null {
  if (!Array.isArray(m) || m.length === 0) return null;
  const out = m
    .slice(-12)
    .filter((x): x is Msg => !!x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
    .map((x) => ({ role: x.role, content: x.content.slice(0, 1200) }));
  if (!out.length || out[0].role !== "user" || out[out.length - 1].role !== "user") return null;
  return out;
}

function build(body: Body): { system: string; messages: unknown[]; max: number } | null {
  switch (body.mode) {
    case "tutor": {
      const messages = cleanMessages(body.messages);
      if (!messages) return null;
      return { system: `${BASE}\nAnswer in under 120 words. Teach one useful thing at a time.`, messages, max: 600 };
    }
    case "roleplay": {
      const sc = ROLEPLAYS.find((r) => r.id === body.scenario);
      const messages = cleanMessages(body.messages);
      if (!sc || !messages) return null;
      return {
        system: `${BASE}\nRole-play. You are ${sc.role}. Situation: ${sc.situation}
Speak only short, simple Mongolian a beginner can follow (one or two sentences), in character.
Format every reply exactly like this:
MN: <your Mongolian line>
SAY: <Latin pronunciation>
EN: <English translation>
TIP: <only if the learner made a mistake or used English: one gentle correction with the right Mongolian; otherwise leave this line out>`,
        messages,
        max: 400,
      };
    }
    case "sayit": {
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 500) : "";
      if (text.length < 3) return null;
      return {
        system: `${BASE}\nThe learner describes what they need to say. Reply ONLY with JSON, no other text:
{"polite":{"mn":"...","say":"...","en":"..."},"casual":{"mn":"...","say":"...","en":"..."},"note":"one short tip about when to use which"}
"en" is the exact meaning of your Mongolian. Keep each Mongolian line short and natural.`,
        messages: [{ role: "user", content: text }],
        max: 500,
      };
    }
    case "photo": {
      const { image, mediaType } = body;
      if (typeof image !== "string" || image.length > MAX_IMAGE || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) return null;
      const q = typeof body.question === "string" && body.question.trim() ? body.question.trim().slice(0, 300) : "What does this say, and what should I do?";
      return {
        system: `${BASE}\nThe learner sends a photo of a sign, menu, label, notice or screen in Mongolia.
1. Copy every piece of Mongolian text you can read, one line each: Cyrillic — pronunciation — English.
2. Then in one or two sentences, explain what it is and what the learner should do.
If you cannot read something clearly, say so instead of guessing.`,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: q },
            ],
          },
        ],
        max: 700,
      };
    }
    case "lesson": {
      const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 120) : "";
      if (topic.length < 2) return null;
      return {
        system: `${BASE}\nMake a mini lesson of 6 very useful Mongolian words or short phrases for the learner's topic.
Reply ONLY with JSON, no other text: {"title":"...","items":[{"mn":"...","en":"..."}]}
"mn" in Cyrillic, short and common. "en" is the meaning in plain English.`,
        messages: [{ role: "user", content: `Topic: ${topic}` }],
        max: 500,
      };
    }
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return err(503, "no_key", "Yarii AI is not switched on yet.");

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return err(401, "not_signed_in", "Please log in to use Yarii AI.");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return err(503, "no_db", "Yarii AI is not set up yet.");
  const sb = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who } = await sb.auth.getUser(token);
  if (!who.user) return err(401, "not_signed_in", "Please log in again.");

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return err(400, "bad_request", "Bad request.");
  }
  const req = build(body);
  if (!req) return err(400, "bad_request", "Please check what you sent and try again.");

  // Pass + daily limit, counted in the database.
  const { data: usage, error: useErr } = await sb.rpc("use_ai");
  if (useErr) {
    if (useErr.message.includes("no_pass")) return err(402, "no_pass", "Yarii AI needs a pass. Start your free 7-day trial.");
    if (useErr.message.includes("limit")) return err(429, "limit", "You've used today's Yarii AI. It refills tomorrow.");
    return err(503, "no_db", "Yarii AI is not switched on yet.");
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: req.max, system: req.system, messages: req.messages }),
      signal: AbortSignal.timeout(45_000),
    });
    const data = await res.json();
    if (!res.ok) return err(502, "ai_error", "Yarii AI is busy. Please try again in a minute.");
    const text: string = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim();
    return Response.json({ text, usage });
  } catch {
    return err(504, "ai_timeout", "Yarii AI took too long. Please try again.");
  }
}
