# Yarii 🇲🇳

**Learn Mongolian for life in Mongolia.** Easy lessons for foreigners living in Mongolia: kids, adults and grandparents.

- **Landing page:** a scroll story where an Ulaanbaatar street comes to life (buildings → shop, pharmacy and café signs + a taxi → speech bubbles → МОНГОЛ over the city), plus a free 2‑minute lesson you can try without an account.
- **Translator + phrasebook (no login):** English ⇄ Mongolian with Latin pronunciation, "show to someone" full screen, saved phrases, ready phrases for taxi/shop/café/doctor/emergency and the official emergency numbers.
- **Learning app (needs login):** 8 lessons. All 35 Cyrillic letters, real street signs, and first phrases. Each lesson has picture tricks, a quiz, mistakes asked again, stars, a streak and spaced reviews.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Motion, Supabase (auth + database).

- **100 more lessons (`/learn/packs`):** 20 topics × 5 lessons (colours, body, days, food, drinks, home, jobs, feelings, city signs, travel, nature, animals, bank and post, hospital, friends, customs, winter…). Content: `lib/packs.ts`.
- **Word herd (`/learn/herd`):** spaced review drawn as a nomad's herd. Every word is one of the five livestock; remembered words graze by the ger, forgotten ones wander off, and after a week a wolf comes. Uses the same Leitner boxes as the flashcards.
- **Sign rush (`/learn/rush`):** real signs slide past a bus window; tap the one you're told to find. Trains fast reading. A still grid for reduced motion.
- **Yarii AI (`/ai`, paid):** talk practice with AI characters, photo reader for signs and menus, say-it-for-me, your own lessons, and Ask Yarii. Everything else is free.
- **Plans (`/pricing`):** all learning free; Yarii AI is a 30-day (24,900₮) or 1-year (149,000₮) pass, paid once with QPay, never renews. 7-day free trial. Prices, costs and break-even: `docs/BUSINESS.md`.

## Run it

```bash
npm install
cp .env.example .env.local   # skip if .env.local already exists
npm run dev                  # http://localhost:3000
npx tsx --test tests/*.test.ts   # content and AI-helper checks
```

## Deploy to Vercel

1. Push this repo to GitHub as `Mongolingo`.
2. On Vercel, click **Add New → Project** and import the repo.
3. Under **Environment Variables**, add both lines from `.env.example`.
4. Click **Deploy**.
5. In Supabase (project `mongolingo`), go to **Authentication → URL Configuration** and set **Site URL** to your Vercel URL.
6. Optional for demo day: **Authentication → Sign In / Providers → Email → turn off "Confirm email"**, so people can sign up and start right away without checking their email.

## Yarii AI setup

1. In Vercel → Settings → Environment Variables add `ANTHROPIC_API_KEY` (from console.anthropic.com). Without it, `/ai` says "not switched on yet".
2. Run `supabase/ai.sql` once in the Supabase SQL editor. It adds `ai_usage` and `use_ai()`, which checks the pass and the daily limit (60 a day, 15 on the trial).
3. Model: Claude Haiku 5.5. Set a monthly spend limit in the Anthropic console.

## Passes (payments)

Run `supabase/passes.sql` once in the Supabase SQL editor (already applied to project `mongolingo`). It adds:

- `passes`: one row per learner (`plan`, `valid_until`). Learners can read their own row but never write it.
- `start_trial()`: gives a 7-day trial, once per account.
- `pass_requests`: "send me a QPay invoice" requests from `/pricing`.

When an invoice is paid, open Supabase → Table editor → `passes` and add or edit the learner's row:
`plan` = `month` / `year` / `team`, `valid_until` = today + 30 or 365 days. Lessons in locked gers then open.

## Database

One table, `public.progress` (one row per user). Row Level Security is on, so each user can read and write only their own row.

| column | meaning |
|---|---|
| `completed_lessons` | ids of finished lessons |
| `xp` | stars |
| `streak`, `last_active` | day streak |
| `review_due` | `{ lessonId: { due, step } }` for spaced review (1 → 3 → 7 → 14 → 30 days) |

## Where things are

| file | what |
|---|---|
| `lib/lessons.ts` | **all learning content**: letters, sounds, picture tricks, example words, signs and phrases |
| `lib/progress.ts` | stars, streak, spaced‑review schedule, saving to Supabase |
| `components/SteppeScene.tsx` | the scroll animation (and a still version for "reduce motion" users) |
| `components/TryDemo.tsx` | the free mini lesson on the landing page |
| `components/LessonPlayer.tsx` | the lesson: cards → quiz → result |
| `app/api/translate/route.ts` | free machine translation (MyMemory), used only when the phrasebook has no match |
| `lib/phrases.ts` | the checked phrasebook and emergency numbers |
| `lib/translit.ts` | Mongolian Cyrillic → Latin pronunciation |
| `docs/RESEARCH.md` | the psychology behind every design choice, with studies |
