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

## Colors: warm, calm and easy on the eyes

The palette, "Warm sand + calm blue", follows three groups of studies:

| Finding | Study | What we did |
|---|---|---|
| **Warm backgrounds are read faster.** Peach, orange and yellow gave the fastest reading. Blue‑grey, blue and green were slowest. This held for readers with and without dyslexia (341 people). | Rello & Bigham (2017), *Good Background Colors for Readers*, ASSETS | Cream background `#fbf5ec`; peach `#fbe9da` for highlight areas; no cool blue‑grey backgrounds. |
| **Saturated, bright colors raise arousal** (stress, alertness); low‑saturation colors are the calmest. Brighter colors and **medium** saturation feel most pleasant. | Wilms & Oberfeld (2018), *Psychological Research* 82; Valdez & Mehrabian (1994), *J. Exp. Psychology: General* 123 | Big areas are soft and low‑saturation. Strong color is kept small (buttons, progress, signs). |
| **Aging eyes:** the lens yellows, blues and greens get confused, pastels blur together, and glare from bright surfaces hurts. | Aging‑eye research (summary: Sherwin‑Williams, *Color and the Aging Eye*) | No pure white (warm white `#fffdf9`); meaning carried by light/dark contrast + icons + words, never by hue alone. |

| Name | Hex | Used for |
|---|---|---|
| Cream | `#fbf5ec` | page background |
| Warm white | `#fffdf9` | cards and panels |
| Peach | `#fbe9da` | highlight areas, icon tiles |
| Charcoal | `#2a2420` | text (14:1 on cream) |
| Warm grey | `#5c5249` | secondary text (7:1 on cream) |
| Calm blue | `#2f5da8` | buttons and links only (white text 6.4:1) |
| Saffron | `#e8b04b` | stars, goal, taxi |
| Green / Red | `#276b43` / `#b3403a` | right / wrong, always with an icon and words |

Popular claims like "blue = trust, red = urgency" have weak support (Elliot, 2015, *Frontiers in Psychology*), so we don't rely on them. We use only the effects above, which come from controlled experiments.

- **Long reading happens on light backgrounds.** Dark text on light is read faster and more accurately, including by older adults (Piepenbrock, Mayr & Buchner, 2013, *Ergonomics*).

## Why the translator and phrasebook come first

Our main users are 20–40-year-olds who just moved to Mongolia. Research on why people adopt a new tool says they keep using it when it is **useful right away** and **easy to use**.

| What we do | Why (evidence) |
|---|---|
| Free translator and phrasebook, no sign-up | **Technology Acceptance Model** (Davis, 1989): *perceived usefulness* is the strongest predictor of whether people adopt a tool. Solving today's problem (a taxi, a pharmacy) proves usefulness in seconds. |
| Give first, ask later | **Reciprocity** (Regan, 1971; Cialdini, 2001): people are more willing to say yes after they have received something. We ask for sign-up only after they've got value. |
| Phrases grouped by situation (Taxi, Shop, Café, Doctor, Emergency) | **Hick's law** (Hick, 1952): fewer, clearer choices mean faster decisions. Six situations instead of one long list. |
| "Show to someone" full screen | Removes the hardest part, pronunciation, in stressful moments. Big text also works for older eyes and for the person reading it. |
| Pronunciation in Latin letters for every Mongolian word | Learners can act before they can read Cyrillic. This also builds letter–sound links for the lessons (**dual coding**). |
| After 3 translations: "Want to read signs without your phone?" | **Curiosity gap** (Loewenstein, 1994) plus a small next step. It's an invitation, never a pop‑up or a block. |
| "Checked phrase" badge vs. "Machine translation" label | Being honest about reliability builds trust. Machine translation into Mongolian still makes mistakes. |

**What we chose not to do:** no fake user counts, fake reviews, fake countdown timers or fake "only 2 spots left". These dark patterns damage trust once noticed (Mathur et al., 2019, *Dark Patterns at Scale*), and an early‑stage product has no real numbers to show yet.

## Do we need AI?

**Only for free‑text translation.** The translator uses a free machine‑translation service (MyMemory) for sentences that aren't in our phrasebook. It shows a "Machine translation" label and checks the phrasebook first. Lessons and phrases stay fixed and checked, because AI can make mistakes in Mongolian and a beginner can't spot them.

Good later uses of AI:
1. A **conversation partner** for intermediate learners (shopping or taxi role‑play).
2. **Pronunciation feedback.** Mongolian speech recognition is still weak, so test this carefully first.
3. **Recorded audio by a native speaker** comes before both. Most phones have no Mongolian voice, so the 🔊 button only appears when the device has one.

## Sources

- Atkinson & Raugh (1975), keyword method — [Stanford IMSSS report](https://suppescorpus.stanford.edu/sites/g/files/sbiybj32751/files/media/file/imsss_224.pdf)
- Cepeda et al. (2006), distributed practice meta‑analysis — [USF Digital Commons](https://digitalcommons.usf.edu/psy_facpub/1771/)
- Nunes & Drèze (2006), endowed progress — [PDF](https://msbfile03.usc.edu/digitalmeasures/jnunes/intellcont/Endowed%20Progress%20Effect-1.pdf)
- Kivetz, Urminsky & Zheng (2006), goal gradient — [RePEc](https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html)
- Rello & Bigham (2017), good background colors for readers — [PDF](https://www.changedyslexia.org/publications/pdfs/2017-ASSETS-Good%20Background%20Colors.pdf)
- Wilms & Oberfeld (2018), color and emotion: hue, saturation, brightness — [PDF](https://www.staff.uni-mainz.de/oberfeld/downloads/Wilms-Oberfeld2018_Article_ColorAndEmotionEffectsOfHueSat.pdf)
- Valdez & Mehrabian (1994), effects of color on emotions — [PubMed](https://pubmed.ncbi.nlm.nih.gov/7996122/)
- Color and the aging eye — [Sherwin‑Williams](https://www.sherwin-williams.com/architects-specifiers-designers/inspiration/styles-and-techniques/SW-ART-STIR-COLOR-AGING-EYE)
- Elliot (2015), color and psychological functioning — [Frontiers / PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4383146/)
- Older‑adult website usability — [PMC content analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7741326/)
- Roediger & Karpicke (2006), testing effect, *Psychological Science* 17(3)
- Davis (1989), perceived usefulness and ease of use, *MIS Quarterly* 13(3)
- Regan (1971), effects of a favor on liking and compliance, *Journal of Experimental Social Psychology* 7(6)
- Hick (1952), on the rate of gain of information, *Quarterly Journal of Experimental Psychology* 4(1)
- Loewenstein (1994), the psychology of curiosity, *Psychological Bulletin* 116(1)
- Mathur et al. (2019), Dark Patterns at Scale, *Proc. ACM HCI* (CSCW)
- Emergency numbers — [Communications Regulatory Commission of Mongolia](https://crc.gov.mn/list/harilcaa-holboony-jlchilgee/en?show=196)
- WCAG 2.2 — w3.org/TR/WCAG22
