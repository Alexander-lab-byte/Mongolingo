# Mongolingo 🇲🇳

**Learn Mongolian for life in Mongolia.** Easy lessons for foreigners living in Mongolia: kids, adults and grandparents.

- **Landing page:** a scroll story where an Ulaanbaatar street comes to life (buildings → shop, pharmacy and café signs + a taxi → speech bubbles → МОНГОЛ over the city), plus a free 2‑minute lesson you can try without an account.
- **Translator + phrasebook (no login):** English ⇄ Mongolian with Latin pronunciation, "show to someone" full screen, saved phrases, ready phrases for taxi/shop/café/doctor/emergency and the official emergency numbers.
- **Learning app (needs login):** 8 lessons. All 35 Cyrillic letters, real street signs, and first phrases. Each lesson has picture tricks, a quiz, mistakes asked again, stars, a streak and spaced reviews.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Motion, Supabase (auth + database).

## Run it

```bash
npm install
cp .env.example .env.local   # skip if .env.local already exists
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub as `Mongolingo`.
2. On Vercel, click **Add New → Project** and import the repo.
3. Under **Environment Variables**, add both lines from `.env.example`.
4. Click **Deploy**.
5. In Supabase (project `mongolingo`), go to **Authentication → URL Configuration** and set **Site URL** to your Vercel URL.
6. Optional for demo day: **Authentication → Sign In / Providers → Email → turn off "Confirm email"**, so people can sign up and start right away without checking their email.

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
