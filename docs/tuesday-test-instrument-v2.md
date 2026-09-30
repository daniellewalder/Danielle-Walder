# The Tuesday Test: V2 instrument specification

**No code changed.** Final architecture for sign-off.

8 core questions · at most 2 conditional follow-ups · qualifier taps on bundled
answers · an optional agent handoff after the result.

**Decisions folded in:** Q3 stays 3 / 2. The site concept returns as `site`,
asked in Q2 with a qualifier. Minimum bedrooms and property type go to the
handoff, which is expanded into a real search-parameter layer.

---

# 1. Where `site` lives, and why

You were right that light, privacy, outdoor space and the street do not
describe a site. A buyer can be happy with all four and still reject the
property because of slope, shape, how the house sits on the land, what is built
next to it, or how you get in and out.

## Recommendation: a tenth option in Q2, with a qualifier

Three reasons this beats the alternatives.

**Q2 is already the right kind of question.** A bad site kills a house you
otherwise love, which is exactly what Q2 asks. It carries full protect-level
evidence, and `site` is `protectAtPurchase`, so the strength and the class
match without any special handling.

**The qualifier solves your "do not infer its components" instruction
structurally.** "The lot itself" is a bundled label by your own definition, so
it takes a qualifier tap like the Q3 bundles. `site:slope` licenses a statement
about grade; it licenses nothing about access or neighbouring structures. The
rule already exists and simply applies here.

**It costs one option and one conditional tap**, against a ninth question you
have ruled out.

### Alternatives considered and rejected

| Direction | Why not |
|---|---|
| Fold into Q4 as "house or land?" | Forces a false choice. Architecture and site are not alternatives, and "both" at half weight would read as neither being a requirement |
| Tradeoff candidate only | The tradeoff can only weigh what is already established, so this needs a source first |
| A Q3 friction option | Q3 is about living in the house. Site is about the parcel, and mixing them muddies both |
| Attach to Q7 | Q7 is geography. A site is a specific parcel, not an area |

### Distinguishing the two requirements you named

| Requirement | Established by | Means |
|---|---|---|
| "I need usable outdoor space" | Q2 `outdoor`, or Q3 `upkeep` context | There must be somewhere outside worth being |
| "The site itself has to be right" | Q2 `site` + qualifier | The land and the house's relationship to it must work, independent of whether there is a patio on it |

They can both be selected. A buyer whose two dealbreakers are `site` and
`outdoor` has told us something specific and useful: the parcel must work **and**
it must yield somewhere to sit. That is not expressible today.

---

# 2. Final attribute taxonomy — 19 attributes, 3 scales, 8 stances

## protectAtPurchase — bought, not created

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `light` | Natural light | Q2 | — |
| `privacy` | Privacy | Q1, Q2 | — |
| `outdoor` | Outdoor space you'd actually use | Q2 | — |
| `street` | The street and the noise | Q1, Q2 | — |
| `site` | **The land, and how the house sits on it** | **Q2**, tradeoff fallback | **yes** |
| `proximity` | Being close to the people you see constantly | Q1, Q2 | — |
| `convenience` | Getting daily life done easily | Q1, Q2 | — |
| `architecturalCharacter` | The architecture itself: proportion, bones, materials | Q4 | — |

## realProject — possible, but money, permits, disruption

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `layout` | The layout | Q2 | — |
| `size` | Enough square footage | Q1, Q2 | — |
| `separation` | Somewhere to close a door | Q1, Q3 | — |
| `publicRooms` | Living space that works for how you cook and host | Q3 | optional |
| `kitchen` | A kitchen you don't have to redo | Q6 | — |
| `condition` | Move-in condition | Q5, Q6, C2, tradeoff fallback | — |

## verifyPerProperty — depends on the actual site, structure or rules

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `expansion` | Room to add on later | Q6 | — |
| `circulation` | Stairs and how you move through it | Q3 | — |
| `utility` | Where everyday life goes | Q3 | **yes** |
| `parking` | Cars, arriving, getting in and out | Q3 | **yes** |
| `upkeep` | How much there is to look after | Q3 | **yes** |

## usuallyAdaptable — empty, deliberately

Nothing scored is genuinely cosmetic. The decorative layer is a scale.

## Scales — 3, all two-sided

| Scale | Range | Sources |
|---|---|---|
| `personalizationAppetite` | −3 … +3 | Q5, C2 |
| `renovationTolerance` | −3 … +3 | Q6, C1, C2 |
| `dayOneReadiness` | −2 … +4 | Q5, Q6, C1, C2 |

## Stances — explicit positions, no score

`wantsFinished` · `willBuild` · `wantsNeutral` · `budgetLed` · `timeLed` ·
`scaleLimited` · `propertyGated` · `narrowCriteria`

## Removed

`view` (no source, carried by `light` and the site cluster) · `ceilings` (a
showing observation, not a filter) · `finishes` (fully covered by `condition`
plus `personalizationAppetite`) · the `architecturalRequirement` scale
(duplicated the attribute) · the `operationalBurdenTolerance` scale (duplicated
`upkeep` being protected; the qualifier carries the precision).

---

# 3. The eight core questions

## Q1 · `tuesday` · context · weight 0.5 · choose 1

> It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?

| Option | Establishes | Weighted |
|---|---|---|
| Getting dinner, errands, and the rest of life done without making it a project. | convenience 3 | 1.5 |
| Having enough room to work, rest, host people, and occasionally avoid everyone. | size 2, separation 2 | 1.0 / 1.0 |
| Being close to the places and people that make Los Angeles worth living in. | proximity 3 | 1.5 |
| Closing the door and not hearing everyone else's life through the walls. | privacy 3, street 1 | 1.5 / 0.5 |

Nothing here reaches protect (3). Every attribute it touches has a
full-strength source elsewhere.

---

## Q2 · `dealbreaker` · up to two, **both full strength** · weight 1

> You love the house. What still kills it?
> *Pick the one that kills it. If there's honestly a second, add it.*

| # | Option | Establishes | 1st | 2nd | Bundled |
|---|---|---|---|---|---|
| 1 | It's dark. | light | **3** | **3** | no |
| 2 | There's no privacy. | privacy | **3** | **3** | no |
| 3 | The street is too busy. | street | **3** | **3** | no |
| 4 | There's nowhere I'd actually want to be outside. | outdoor | **3** | **3** | no |
| 5 | **The lot itself. The slope, the shape, the way the house sits on it.** | **site** | **3** | **3** | **yes** |
| 6 | I'm too far from the people I see constantly. | proximity | **3** | **3** | no |
| 7 | Everything is a drive. | convenience | **3** | **3** | no |
| 8 | The layout fights how I live. | layout | **3** | **3** | no |
| 9 | I'll outgrow it. | size | **3** | **3** | no |
| 10 | None of these automatically kill it. | — | — | — | no |

**Rank is stored separately** as `statedRank: { question: 'dealbreaker',
position: 1 | 2 }`. Both picks are full dealbreakers. Position is ordering
information and never reduces importance. It is used for exactly two things:
seeding the adaptive tradeoff, and letting the brief say which of two
non-negotiables is the harder one.

**Provenance: two picks are one source.** Both record `dealbreaker`.

---

## Q3 · `daily` · primary + secondary · weight 1 · **3 / 2**

> Which of these would wear on you first?
> *And second?*

| Option | Establishes | 1st | 2nd | Bundled |
|---|---|---|---|---|
| The main rooms don't work for how I cook, eat and have people over. | publicRooms | **3** | **2** | optional |
| There's nowhere to close a door. | separation | **3** | **2** | no |
| Stairs, levels, getting around it. | circulation | **3** | **2** | no |
| Nowhere for everyday life to go. | utility | **3** | **2** | **yes** |
| Cars, arriving, getting in and out. | parking | **3** | **2** | **yes** |
| Keeping the outside up. | upkeep | **3** | **2** | **yes** |
| I'd want help thinking about this. | — | — | — | no |

**Why 3 / 2 here and 3 / 3 in Q2.** Q2 asks about **membership** in the
dealbreaker set, which is binary, so both members are full members. Q3 asks for
a **rank**, and the second is explicitly second. A rank-2 friction lands in
`scrutinize`: worth checking in person, not a filter.

**Provenance: two picks are one source** (`daily`).

---

## Q4 · `architecture` · weight 1 · choose 1

> Some houses have something of their own. Others are just well built. Which matters to you?

| Option | Establishes | Stance |
|---|---|---|
| A lot. If the house has no point of view, I'm not interested. | architecturalCharacter **3** | |
| Some. I'd take well proportioned and plain, but I'd rather have both. | architecturalCharacter **1** | |
| Not really. I care how it works, not what period it is. | — | |
| I'd rather it be plain, so nothing fights what I bring to it. | — | **`wantsNeutral`** |

No negative score. "Plain is actively preferred" is a stance, which is what
removes the need for a one-sided scale.

---

## Q5 · `personalization` · weight 1 · choose 1

> Once you're in, how much of the look do you want to be yours?

| Option | Scale | Also |
|---|---|---|
| All of it. Paint, paper, lighting, the lot. | personalization **+3** | |
| Some. I'd change what bothers me and live with the rest. | **+1** | |
| Not much. If it's done well I'd rather leave it alone. | **−2** | |
| I'd rather buy it finished and not think about it. | **−3** | condition 1, dayOne +1 |

Independent of Q4 by construction.

---

## Q6 · `project` · weight 1 · choose 1

> Great house. Very 2007 kitchen.

| Option | Establishes | Scales | Band | Stance |
|---|---|---|---|---|
| Who cares. That's fixable. | — | reno **+2** | contained | `willBuild` |
| Honestly I'd go further. Walls, an addition, whatever the house needs. | expansion **3** | reno **+3**, dayOne **−2** | major | `willBuild` |
| Depends how much work we're talking about. | — | reno **+1** | undecided → **C1** | |
| I know myself. I'll never redo it. | kitchen **3** | reno **−3** | cosmetic only | |
| No. I want to move in and be done. | kitchen **2**, condition **3** | dayOne **+3**, reno **−2** | turnkey | `wantsFinished` |

---

## Q7 · `location` · weight 1 · choose 1

> How much does the map actually move?

| Option | Posture | Interpretation | Tradeoff candidate |
|---|---|---|---|
| It doesn't. One area, and outside it doesn't work for my life. | `fixed` | Geography is not the lever. Name another. **Licenses nothing about whether the map was tested, and nothing about inventory** | **never** |
| I have a strong preference, but the right house nearby would get a look. | `strongPreference` | Geography is the available lever | yes |
| There are a handful of areas that genuinely work. | `fewAreas` | Area selection is the lever; choose deliberately | yes |
| The right property could move me. | `propertyLed` | The property spec is the whole filter | no, already answered |

Free-text note unchanged: offered for `fixed` and `strong`, **never reaches the
model**, read only by Danielle.

---

## Q8 · `tradeoff` · adaptive · weight 1 · choose 1

> Two of these came up. If you had to pick one, which survives?
> **[A]** · **[B]** · *I'd keep looking.*

Selection in section 5.

---

# 4. Qualifier behaviour

A qualifier fires for **every bundled selection**, in Q2 or Q3, primary or
secondary. When more than one bundled option is picked, all qualifier sets
appear **on one screen**, so the cost is one tap each rather than one screen
each.

| Bundled selection | Qualifier options |
|---|---|
| **Q2 · The lot itself** | The land itself: slope, shape, how much is usable flat · How the house sits on it: position, level, orientation · What's built right next to it · Getting in and out · Honestly, the whole thing |
| **Q3 · Nowhere for everyday life to go** | Laundry · Storage · Pantry · Honestly, all of it |
| **Q3 · Cars, arriving, getting in and out** | Off-street parking · A garage · The driveway and getting in and out · EV charging |
| **Q3 · Keeping the outside up** | A pool · Planting and landscape · How much property there is · General maintenance |
| **Q3 · The main rooms** *(optional, your call)* | Cooking · Having people over · Everyday eating · All of it |

## Qualifier rules

| Rule | |
|---|---|
| **No provenance source** | A qualifier records no question id. `site` still has exactly one source |
| **No weight** | It never raises or lowers importance |
| **It grants vocabulary only** | `upkeep:pool` licenses a statement about a pool; `upkeep:planting` does not |
| **"All of it" licenses the bundle** | The only way the multi-part phrasing may ever be used |
| **Missing qualifier means no expansion** | The brief falls back to the category label and nothing more specific |
| **Never inferred** | Per your instruction: no component of `site` may be named unless the buyer selected it |

---

# 5. Adaptive tradeoff

## Principle

**The adjacency data says only whether two concepts form a coherent forced
choice.** It encodes nothing about how houses or markets behave. The pair comes
entirely from what this buyer established.

## Clusters

| Cluster | Members | Tradeable |
|---|---|---|
| SITE | light, privacy, outdoor, street, **site** | yes |
| ACCESS | proximity, convenience | yes |
| SPACE | size, separation, publicRooms, layout | yes |
| CONDITION | condition, kitchen | yes |
| CHARACTER | architecturalCharacter | yes |
| BURDEN | upkeep | yes |
| IN-HOUSE LOGISTICS | circulation, utility, parking | **no** |
| CAPACITY | expansion | **no** |
| MAP | pseudo-candidate | only at `strongPreference` or `fewAreas` |

`site` sits in SITE, so it can never be traded against light, privacy, outdoor
or street. That is correct: those live on the site, and the precondition rule
would exclude them anyway. Its useful trades are against SPACE, CONDITION,
CHARACTER, ACCESS, BURDEN and the MAP.

**Why logistics and capacity are excluded.** "Would you rather have storage or
natural light?" is not answerable, and an answer would not change what gets
sent. `expansion` is a route to a requirement, not a requirement.

## Universal guards

| Guard | Rule |
|---|---|
| Evidence floor | Both sides at **protect** (direct ≥ 3). Never a certainty against a guess |
| No unset | An attribute with no evidence can never appear |
| No weak against strong | A Q1 context signal maxes at 1.5 and therefore can never be a side |
| Fixed map never moves | Map is a candidate only at `strongPreference` or `fewAreas` |
| No same cluster | Reads as a trick question |
| No preconditions | Never pair a thing against something it contains or depends on |
| Qualifier honesty | A qualifier-specific concept appears only if that qualifier was selected |
| Already resolved | Never re-ask what an earlier answer settled |
| Abstract only | "If you had to pick one", never "in a house like this" |

## Pair families

### A — two protected property attributes, different clusters

**Eligible:** both at protect, different tradeable clusters, neither a
precondition of the other.
**Disqualified:** same cluster · either below protect · either in an excluded
cluster.
**A win:** when both cannot be had, this one survives. Ordering only.
**A loss:** somewhere to compare real houses. **No penalty. It stays protected.**
**May infer:** lead with the winner when the two compete.
**May not infer:** that the loser is negotiable, or that any given house forces
the choice.

### B — a protected property attribute versus the map

**Eligible:** map is `strongPreference` or `fewAreas`, attribute at protect.
**Disqualified:** map is `fixed` (**never ask a fixed map to move**) or
`propertyLed` (already answered).
**Property wins:** geography is the lever this buyer has agreed to spend. The
strongest result the tradeoff produces.
**Map wins:** geography is firmer than the stated posture; the property
criterion is where the search gives.
**May infer:** which to spend first on a near-miss.
**May not infer:** that they will move areas generally, or anything about what
exists where.

### C — a protected property attribute versus condition

**Eligible:** `condition` or `kitchen` at protect, other side at protect in a
different cluster, project band **not** major.
**Disqualified:** project band is major, so the question is already answered ·
either side below protect.
**Property wins:** finish is the lever; houses that show badly stay on the list.
**Condition wins:** finish is firmer than the project band suggests. Worth
surfacing precisely because it contradicts the softer reading.
**May infer:** whether condition should filter at all.
**May not infer:** anything about how the two co-occur in listings.

### D — fallback, when nothing above is eligible

Needs no prior attribute evidence. Chosen by map posture, so the fixed-map
guard is never violated.

| Map | Pair |
|---|---|
| `strongPreference`, `fewAreas` | *A house that needs real work, in the area you want* · *A finished house you'd have to go further for* |
| `fixed`, `propertyLed` | *A great lot and a dated house* · *A beautiful renovation on a compromised lot* |

The fixed-map fallback is the current instrument's trade, kept because it is
universally legible and it is how a thin-evidence buyer can still establish
`site`.

**Fallback winners receive direct evidence of 2, not 3.** A forced choice with
nothing volunteered reveals ordering, not importance, so it lands in
`scrutinize`. Adaptive winners (A to C) receive no new direct evidence, because
both sides were already protected.

## Selection algorithm

1. Candidates: every protect-level attribute in a tradeable cluster, plus the
   map when its posture allows.
2. Form all pairs; drop any failing a universal guard.
3. Classify surviving pairs as A, B or C.
4. Rank by **joint strength**: the *lower* of the two directs, so two strong
   things are paired rather than a strong against a medium. Ties break on
   independent source count, then `statedRank` (a rank-1 dealbreaker outranks a
   rank-2), then a stable attribute order for determinism.
5. Nothing survives → family D.
6. Record: winner gets a tradeoff win sourced to `tradeoff`; loser gets a
   tradeoff loss and **no penalty**; the pair is stored so the brief can name
   exactly which two things were weighed.

---

# 6. Conditional follow-ups

## C1 · "depends on what?" · fires on Q6 = *depends*

| Option | Scales | Stance |
|---|---|---|
| The money. If the numbers work, I'd take on a lot. | reno **+2** | `budgetLed` |
| The time. I can't live in a construction site. | reno **+1**, dayOne **+1** | `timeLed` |
| The scale. Rooms, yes. Moving walls, no. | reno **+1** | `scaleLimited` |
| The house. For the right property I'd do a lot more. | reno **+2** | `propertyGated` |

## C2 · contradiction · fires on `wantsFinished` + `willBuild`

| Option | Scales | Also |
|---|---|---|
| I enjoy cosmetic changes, not construction. | pers **+3**, reno **−3** | |
| I'd renovate, but only for an exceptional property. | reno **+1** | `propertyGated` |
| I'm genuinely open to a major project if the economics work. | reno **+3**, dayOne **−2** | |
| I mostly want the house finished when I buy it. | dayOne **+3**, reno **−2** | condition 2 |

## Rules

- At most **one** clarification per result. C1 takes precedence.
- A clarification may not raise a new attribute above `scrutinize`.
- Unanswered is recorded as unresolved, never defaulted to a middle value.

---

# 7. Provenance rules

| Rule | |
|---|---|
| Two picks in Q2 | **one source** (`dealbreaker`) |
| Two picks in Q3 | **one source** (`daily`) |
| Qualifier taps | **no source, no weight** |
| Tradeoff win | **a new source** (`tradeoff`) — a separate question at a separate moment |
| Rank | `statedRank`, never importance |
| Recurrence language | still requires **two distinct question ids** |
| Derived result states | never evidence, however many one answer reaches |

**Repeatable without the tradeoff:** `privacy` · `street` · `proximity` ·
`convenience` · `size` · `separation` · `condition`. Everything else needs a
tradeoff win. Accepted, per your instruction not to add a ninth question.

---

# 8. Optional agent handoff

Shown **only** after the result, on the brief step. Every field optional, the
whole thing skippable in one tap, and presented as a short form rather than an
intake questionnaire.

**None of these rescore the test, alter the shareable result, or produce any
conclusion about the buyer.** They are search parameters.

### Price
| Field | Form |
|---|---|
| Target range | Two numbers, or a band |
| Hard ceiling | Optional single number |

### Timing
| Field | Form |
|---|---|
| Where they are | Casually looking · Hoping to buy this year · Actively looking now |
| Specific timing | Optional free text |

### Where
| Field | Form |
|---|---|
| Already considering | Free text, buyer-entered |
| Already ruled out | Optional free text |
| Geographic notes | Optional free text |

### Schools and districts
| Field | Form |
|---|---|
| A school, district or boundary to respect | Optional free text, **buyer-entered only** |

### Regular destinations
| Field | Form |
|---|---|
| Places they want reasonable access to | Optional free text, buyer-entered |

### Property basics
| Field | Form |
|---|---|
| Property type | House · Condo · Townhouse · Open to any |
| Minimum bedrooms | Number |
| Minimum bathrooms | Optional number |
| Minimum square footage | Optional number |

### Hard filters
| Field | Form |
|---|---|
| Parking or garage | Required · Preferred · No preference |
| Stairs | Step-free needed · Prefer minimal · No preference |
| Pool | Yes · No · No preference |
| EV charging | Required · Preferred · No preference |
| Other physical requirement | Optional free text |

### Anything else Danielle should know
Free text.

## Handling rules

| Rule | |
|---|---|
| Never scored | No handoff field touches the model, the result, or the shareable URL |
| Never inferred from | A blank field means nothing. It is not evidence of flexibility |
| Recorded verbatim | Free text is passed to Danielle as written, never parsed into categories |
| **Free text only for schools and destinations** | No pickers, no lists, no ratings. A category picker invites protected-class data; a ratings source would turn a buyer's boundary into an automated area-quality judgement |
| Never ask why | Not for bedrooms, not for schools, not for destinations, not for step-free access, not for areas ruled out |
| Exclusions are notes, not rules | "Already ruled out" is recorded for Danielle. The tool never propagates it into an automated filter |

## Fair-housing discipline

The same rule the map already follows: **record the constraint, never the
reason.**

- **Bedrooms** is a property specification. Familial status is protected, so
  the number is asked and the household never is.
- **Schools** is a buyer-supplied boundary Danielle honours, not an area-quality
  signal. No ratings data enters the product, and nothing about schools is ever
  surfaced that the buyer did not type.
- **Destinations** are recorded as the buyer wrote them. No categories, because
  a category list would collect things like places of worship.
- **Step-free access** is a property filter. Disability is protected, so the
  requirement is asked and the reason never is.
- **Areas ruled out** is recorded and shown to Danielle. Whether and how to act
  on a buyer-supplied exclusion is her professional judgement with her
  brokerage, and the tool should not automate it.

## One useful interaction, and it is a flag rather than a rescore

If the handoff says **pool: yes** and the test recorded **`upkeep:pool`**, those
disagree. The brief should surface that to Danielle as a discrepancy to raise.
It must not change the result or the scoring; it is a note that two things the
buyer said do not line up, which is exactly the kind of thing an agent should
catch before spending a Saturday on it.

---

# 9. What still needs your call

1. **The main-rooms qualifier in Q3.** Included, but it is arguably one concept
   described three ways rather than three systems. Cutting it saves a tap and
   costs nothing structural.
2. **The Q2 `site` wording.** I have "The lot itself. The slope, the shape, the
   way the house sits on it." The enumeration is deliberate, to make the
   category legible before the qualifier resolves it.
3. **Cluster assignments in the tradeoff**, and the two excluded clusters.
   These are judgement calls and they determine which questions can ever be
   asked.

Once those are settled the instrument is ready to build.
