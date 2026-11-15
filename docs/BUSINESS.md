# How Yarii makes money

Learning is free. People pay for Yarii AI.

Checked November 2026. Exchange rate used: **₮3,600 = $1** (Bank of Mongolia rate was about ₮3,600 in early Nov 2026).

## 1. Who pays

| Group | Size | Source |
|---|---|---|
| Foreign tourists, 2025 | **846,103** (record) | Ministry of Culture, Sports, Tourism and Youth, via Xinhua |
| Tourists, 1st half of 2026 | 418,732 (+19.8% on 2025) | Go Go Mongolia / Asia News Network |
| Foreigners living here, end of 2025 | **34,272** from 136 countries | Immigration Agency, via insider.mn |
| …of them here to work / study | 17,168 / 5,213 | same |
| Average tourist stay | about 12 days | mongolia-trips.com |

Tourists stay weeks, residents stay years. So we sell **passes that end by themselves**, not subscriptions:
a tourist never has to remember to cancel.

## 2. What the big apps charge (Nov 2026)

| App | Monthly | Yearly | Notes |
|---|---|---|---|
| Ling (has Mongolian) | $14.99 | $79.99 | App Store listing |
| GerTrainer (Mongolian) | $5.99 | $34.99 | App Store listing |
| Duolingo Super (no Mongolian) | $12.99 | $83.99 | Family: $119.99/yr for 6 |
| Babbel (no Mongolian) | $17.95 | $107.40 | 12-month plan = 50% off monthly |

What they lock: Duolingo keeps lessons free and sells convenience (unlimited hearts, no ads, streak repair) with a
1-week free trial. Babbel and Ling give the first lessons free and lock the rest. Yearly plans are always about half
the monthly price.

## 3. What is free, what is paid

**Free forever, for everyone:** all 159 lessons (alphabet, 48 ger-town lessons, 100 topic lessons), Word herd and
Sign rush, the translator, flashcards, streaks and a monthly streak freeze. Learning is never behind a paywall.

**Paid: Yarii AI**, a Mongolian friend in your pocket. The thing people pay for at the hard moment:

- Talk practice with AI characters (taxi driver, landlord, pharmacist, herder family…), with gentle corrections
- Photo reader: photograph a sign, menu, notice or label and get every line read, pronounced and explained
- Say it for me: describe the situation in English, get a polite and a casual Mongolian version to show
- My own lesson: a 6-word lesson about your job, hobby or trip
- Ask Yarii: short answers about words, grammar and customs

| Plan | Price | ≈ USD | Why this price |
|---|---|---|---|
| Free | 0₮ | $0 | Everything for learning |
| Yarii AI · 30 days | **24,900₮** once | $6.92 | Under a quarter of Duolingo Max ($29.99/month, its AI tier); under half of Ling's monthly price |
| Yarii AI · 1 year | **149,000₮** once | $41.39 | 12 × 24,900₮ = 298,800₮, then 50% off, like Babbel's yearly plan |
| Teams (5+) | **99,000₮** per person / year | $27.50 | Between Duolingo Family ($20/person) and Babbel's group plan (≈$31/person) |
| Free trial | 7 days, once, 15 AI uses a day | | Same idea as Duolingo's 1-week Super trial |

Limits: 60 AI uses a day with a pass, 15 during the trial. Counted in the database (`use_ai()`), so they can't be skipped.

## 4. Costs

**Fixed, per month**

| Item | Cost | Source |
|---|---|---|
| Vercel Pro (a paid site must not use the free Hobby plan) | $20 = 72,000₮ | vercel.com/pricing |
| Supabase Pro (free projects pause after a week without visits) | $25 = 90,000₮ | supabase.com/pricing |
| Translator (MyMemory, 50,000 characters/day with an email) | 0₮ | MyMemory API docs |
| **Total fixed** | **162,000₮ / month** | |

**AI, per use** (Claude Haiku 5.5: $0.10 per million input tokens, $0.50 per million output tokens; platform.claude.com/docs/en/about-claude/pricing)

| Use | Tokens (in / out, estimate) | Cost |
|---|---|---|
| Chat, role-play, say-it, lesson | 1,500 / 350 | $0.000325 |
| Photo reader | 2,000 / 500 | $0.00045 |
| **Worst case: 60 photos a day for 30 days** | | **$0.81 = 2,916₮ per pass a month** |
| Worst case trial (15 a day × 7 days) | | $0.05 = 170₮ |

**Payment:** QPay merchant via TDB keeps **1%** on Mongolian cards and **3%** on foreign cards (tdbm.mn).

| Plan | Price | QPay fee | AI worst case | We keep (at least) |
|---|---|---|---|---|
| 30-day (foreign card) | 24,900₮ | 747₮ | 2,916₮ | 21,237₮ |
| 1-year (local card) | 149,000₮ | 1,490₮ | 35,478₮ | 112,032₮ |

## 5. Break-even

- **8 thirty-day passes a month** pay every cost, even if every buyer uses AI to the daily limit (162,000 ÷ 21,237 = 7.6).
- Or **18 one-year passes a year** (1,944,000 ÷ 112,032 = 17.4), again at the worst-case AI use.

## 6. If… (not a forecast, just the math)

| If | Passes | We keep (worst-case AI) |
|---|---|---|
| 1 in 1,000 tourists (2025 numbers) buys a 30-day pass | 846 | 17,966,502₮ |
| 1 in 100 residents buys a 1-year pass | 343 | 38,426,976₮ |
| **Together, minus 12 months of fixed costs (1,944,000₮)** | | **54,449,478₮ / year (≈ $15,125)** |

For scale: Duolingo turns about 9% of its monthly users into payers (FY2025 10-K). Our "if" uses 0.1% and 1%.

## 7. How a payment works today

1. The learner picks a plan on `/pricing` and leaves an email or phone (`pass_requests` table).
2. We send a QPay invoice. When it is paid, set their row in `passes` (Supabase → Table editor):
   `plan` = month / year / team, `valid_until` = today + 30 or 365 days.
3. Learners can read their own pass but can never write it (row level security, tested).

Next step when there are paying users: QPay's invoice API + webhook to set the pass automatically.
