# How Yarii makes money

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

## 3. Our plans

| Plan | Price | ≈ USD | Why this price |
|---|---|---|---|
| Free | 0₮ | $0 | Translator, alphabet, signs, Greetings, Emergency, Doctor, Pharmacy. Safety is never paid. |
| 30-day Pass | **24,900₮** once | $6.92 | 46% of Ling's monthly price; between GerTrainer and Duolingo |
| 1-year Pass | **149,000₮** once | $41.39 | 12 × 24,900₮ = 298,800₮, then 50% off, like Babbel's yearly plan; 52% of Ling's yearly |
| Teams (5+) | **99,000₮** per person / year | $27.50 | Between Duolingo Family ($20/person) and Babbel's group plan (≈$31/person) |
| Free trial | 7 days, once | | Same idea as Duolingo's 1-week Super trial |

Pass perks copied from the best apps: all 48 ger lessons, conversation practice, and a streak freeze
(one missed day a month keeps the streak, like Duolingo's streak repair).

## 4. Costs per month

| Item | Cost | Source |
|---|---|---|
| Vercel Pro (a paid site must not use the free Hobby plan) | $20 = 72,000₮ | vercel.com/pricing |
| Supabase Pro (free projects pause after a week without visits) | $25 = 90,000₮ | supabase.com/pricing |
| Translation (MyMemory, 50,000 characters/day with an email) | 0₮ | MyMemory API docs |
| **Total fixed** | **162,000₮ / month** | |

Payment: QPay merchant via TDB charges **1%** for Mongolian cards and **3%** for foreign cards (tdbm.mn).

| Plan | Price | Fee | We keep |
|---|---|---|---|
| 30-day Pass (foreign card, 3%) | 24,900₮ | 747₮ | 24,153₮ |
| 1-year Pass (local card, 1%) | 149,000₮ | 1,490₮ | 147,510₮ |
| Teams seat (1%) | 99,000₮ | 990₮ | 98,010₮ |

## 5. Break-even

- **7 Trip Passes a month** pay all costs (162,000 ÷ 24,153 = 6.7).
- Or **14 one-year Passes a year** (1,944,000 ÷ 147,510 = 13.2).

## 6. If… (not a forecast, just the math)

| If | Passes | We keep |
|---|---|---|
| 1 in 1,000 tourists (2025 numbers) buys a 30-day Pass | 846 | 20,433,438₮ |
| 1 in 100 residents buys a 1-year Pass | 343 | 50,595,930₮ |
| **Together, minus 12 months of costs (1,944,000₮)** | | **69,085,368₮ / year (≈ $19,190)** |

For scale: Duolingo turns about 9% of its monthly users into payers (FY2025 10-K). Our "if" uses 0.1% and 1%.

## 7. How a payment works today

1. The learner picks a plan on `/pricing` and leaves an email or phone (`pass_requests` table).
2. We send a QPay invoice. When it is paid, set their row in `passes` (Supabase → Table editor):
   `plan` = month / year / team, `valid_until` = today + 30 or 365 days.
3. Learners can read their own pass but can never write it (row level security, tested).

Next step when there are paying users: QPay's invoice API + webhook to set the pass automatically.
