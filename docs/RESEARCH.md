# The psychology behind Mongolingo

Every choice below is backed by a published study or an official standard. We also list what we chose **not** to rely on, because the evidence is weak.

## How people learn and remember

| What we do | Why (evidence) |
|---|---|
| Each letter has a **picture trick** ("С is a curvy snake: sss") | **Keyword / mnemonic method.** Atkinson & Raugh (1975) found that learners using picture keywords recalled far more foreign vocabulary than a control group. The effect has been repeated many times since. |
| Letter + picture + example word on every card | **Dual coding** (Paivio, 1971) and Mayer's **multimedia principle** (2001): words with pictures are remembered better than words alone. |
| Short quizzes right after the cards, instead of reading again | **Testing effect.** In Roediger & Karpicke (2006), students who practised recalling remembered much more after a week than students who only re‑read. |
| Reviews after 1, 3, 7, 14 and 30 days | **Spacing effect.** Cepeda et al. (2006) reviewed 317 experiments: practice spread over time beats cramming. |
| Questions in both directions, in mixed order | **Interleaving** and retrieval from more than one direction (Rohrer & Taylor, 2007). |
| Wrong answers come back at the end of the lesson | Re‑trying missed items is a core part of retrieval practice (Karpicke & Roediger, 2008, *Science*). |
| Only 4–7 new things per lesson | **Working‑memory limits:** about 4 chunks at a time (Cowan, 2001). See also **cognitive load theory** (Sweller, 1988). |
| The wrong‑answer message says "Good try!" and explains the answer | Explanatory feedback works better than "wrong" alone (Hattie & Timperley, 2007, *The Power of Feedback*). |

## How we keep people motivated

| What we do | Why (evidence) |
|---|---|
| "You already know 5 of the 35 letters!" | **Endowed progress effect.** In Nunes & Drèze (2006), a car‑wash card that started with 2 of 10 stamps already filled was completed 34% of the time, against 19% for a blank 8‑stamp card. People finish more when they feel they have already started. |
| Progress bars everywhere, "Piece 2 of 4" | **Goal‑gradient effect.** Kivetz, Urminsky & Zheng (2006): people speed up as they get closer to a goal. |
| Free mini lesson before signup | Lowers the cost of starting. People see value before they are asked for anything. |
| Streak + stars | Small, frequent rewards and a daily habit cue. Duolingo's own published experiments show streaks raise daily return. This is industry data, not peer‑reviewed, so we keep it light. |
| No timers anywhere | Time pressure raises anxiety, and anxiety hurts language learning (Horwitz, Horwitz & Cope, 1986, *Foreign Language Classroom Anxiety*). Timers are especially hard for older users. |

## Design for every age

| What we do | Why (evidence / standard) |
|---|---|
| 18px base text and an **A / A / A** text‑size switch | Nielsen Norman Group's usability studies with users 65+ found small text is their top problem. The U.S. National Institute on Aging guidelines recommend large, adjustable text. |
| All buttons at least 44–56px tall | **Fitts's law** (1954): bigger targets are faster and easier to hit. **WCAG 2.2 (2.5.8)** sets 24px as the minimum; Apple and Google recommend 44–48px. Older users and kids have less precise fingers. |
| Text contrast is at least 4.5:1 and mostly 7:1 or more | **WCAG 2.2 AA/AAA.** Contrast sensitivity drops with age. We test every page with the axe‑core accessibility scanner. |
| Right/wrong shown with **icon + words + color** | About 8% of men have color‑vision deficiency. WCAG 1.4.1 says color must never be the only signal. |
| A still version of the story for "reduce motion" users | Motion can cause dizziness for people with vestibular disorders (WCAG 2.3.3). We respect the device setting. |
| Labels above inputs, a "Show" password button, plain error messages | NN/g form research: placeholder‑only labels disappear while typing and confuse users. |
| Big emoji pictures and very short sentences | Children read pictures before words. NN/g's research on children's websites. |

## Colors: what we did NOT claim

Popular claims like "blue = trust, red = urgency" have **weak scientific support**. Elliot (2015, *Frontiers in Psychology*) reviews the field and finds the evidence for color effects mostly preliminary. So we chose colors for **contrast, recognition and meaning**, not "color psychology".

The palette is called "Eternal Blue Sky", after Mongolia's own nickname (Мөнх хөх тэнгэр):

| name | hex | used for |
|---|---|---|
| Night | `#0a0f2c` | the story's night sky, headers, big letters |
| Cobalt | `#1e5bff` | main buttons, the day sky |
| Sky | `#4fc3ff` | highlights, lowercase letters |
| Coral | `#ff5a4e` | sunrise, "tricky twin" letters, flag red |
| Gold | `#ffc531` | the Soyombo gold: main call‑to‑action, stars, the sun |
| Paper | `#f5f8ff` | reading background (cool white, low glare) |

- **Long reading happens on light backgrounds.** Dark text on a light background is read faster and more accurately, including by older adults (Piepenbrock, Mayr & Buchner, 2013, *Ergonomics*). The dark night sky is used only for short, very large text.
- **Green and red** appear only for right and wrong answers, always with an icon and words.

## Do we need AI?

**Not for the first version.** The core learning (letters, signs, phrases, quizzes, spacing) works better with fixed, checked content. AI can make mistakes in Mongolian, and a beginner can't spot them.

Good later uses of AI:
1. A **conversation partner** for intermediate learners (shopping or taxi role‑play).
2. **Pronunciation feedback.** Mongolian speech recognition is still weak, so test this carefully first.
3. **Recorded audio by a native speaker** comes before both. Most phones have no Mongolian voice, so the 🔊 button only appears when the device has one.

## Sources

- Atkinson & Raugh (1975), keyword method — [Stanford IMSSS report](https://suppescorpus.stanford.edu/sites/g/files/sbiybj32751/files/media/file/imsss_224.pdf)
- Cepeda et al. (2006), distributed practice meta‑analysis — [USF Digital Commons](https://digitalcommons.usf.edu/psy_facpub/1771/)
- Nunes & Drèze (2006), endowed progress — [PDF](https://msbfile03.usc.edu/digitalmeasures/jnunes/intellcont/Endowed%20Progress%20Effect-1.pdf)
- Kivetz, Urminsky & Zheng (2006), goal gradient — [RePEc](https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html)
- Elliot (2015), color and psychological functioning — [Frontiers / PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4383146/)
- Older‑adult website usability — [PMC content analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7741326/)
- Roediger & Karpicke (2006), testing effect, *Psychological Science* 17(3)
- WCAG 2.2 — w3.org/TR/WCAG22
