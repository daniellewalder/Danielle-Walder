# The Tuesday Test: V2 instrument specification

**Built and frozen.** This is the instrument as implemented in
`lib/tuesday/v2/`, not a proposal.

8 core questions · 2 conditional follow-ups · qualifier taps on four bundled
answers · an optional agent handoff after the result.

**Earlier revision applied:** `expansion` removed entirely and Q6's
major-project answer no longer establishes it; Q8 adds no direct importance at
all; the same-cluster prohibition is replaced by an explicit allowed-pair
matrix; the main-rooms qualifier is cut; `site` wording settled.

**This revision applies three corrections found while building the structured
brief contract.** Q5's "some" moves from +1 to 0, because at +1 it normalised
above the high threshold and the middle band could never occur, so "some" and
"all of it" scored as one answer. C2 is replaced: the artificial contradiction
conditional is gone, and the slot now carries the size route, which settles how
a protected size may be satisfied. `site` gains an in-person check. Full
reasoning and measurements: `docs/tuesday-test-brief-contract.md`.

---

# 1. Final attribute taxonomy — 18 attributes, 3 scales, 9 stances

## protectAtPurchase — bought, not created (8)

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `light` | Natural light | Q2 | — |
| `privacy` | Privacy | Q1, Q2 | — |
| `outdoor` | Outdoor space you'd actually use | Q2 | — |
| `street` | The street and the noise | Q1, Q2 | — |
| `site` | The land, and how the house sits on it | Q2 | **yes** |
| `proximity` | Being close to the people you see constantly | Q1, Q2 | — |
| `convenience` | Getting daily life done easily | Q1, Q2 | — |
| `architecturalCharacter` | The architecture itself: proportion, bones, materials | Q4 | — |

## realProject — possible, but money, permits, disruption (6)

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `layout` | The layout | Q2 | — |
| `size` | Enough square footage | Q1, Q2 | — |
| `separation` | Somewhere to close a door | Q1, Q3 | — |
| `publicRooms` | Living space that works for how you cook and host | Q3 | **no** (cut) |
| `kitchen` | A kitchen you don't have to redo | Q6 | — |
| `condition` | Move-in condition | Q5, Q6 | — |

## verifyPerProperty — depends on the actual site, structure or rules (4)

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `circulation` | Stairs and how you move through it | Q3 | — |
| `utility` | Where everyday life goes | Q3 | **yes** |
| `parking` | Cars, arriving, getting in and out | Q3 | **yes** |
| `upkeep` | How much there is to look after | Q3 | **yes** |

## usuallyAdaptable — empty, deliberately

## `expansion` is removed

You were right on both counts.

**Willingness is not desire.** "I'd go further, walls, an addition, whatever
the house needs" says the buyer would *do* structural work. It says nothing
about whether room to expand is something they want a property to have. Scoring
it as a priority turns an answer about appetite into a requirement the buyer
never stated.

**And with that removed, nothing sources it.** It would be permanently unknown,
which is exactly the dead-attribute problem the audit found in `view`,
`ceilings` and `finishes`. So it leaves the taxonomy.

**What replaces it:** a stance, `structuralWorkOkay`, and a combination
inference in the interpretation layer:

> `size` protected **+** `structuralWorkOkay`
> → open question: *"Does the space need to exist already, or would you create it?"*

That is derived from two things the buyer actually said. Expansion potential
becomes a **search parameter Danielle checks**, never a scored buyer priority.

## Scales — 3, all two-sided

| Scale | Range | Sources |
|---|---|---|
| `personalizationAppetite` | −3 … +3 | Q5 only |
| `renovationTolerance` | −3 … +3 | Q6, C1 |
| `dayOneReadiness` | −2 … +4 | Q5, Q6, C1 |

C2 moves no scale and scores no attribute. It records a position only.

## Stances — explicit positions, no score (13)

`wantsFinished` · `willBuild` · **`structuralWorkOkay`** · `wantsNeutral` ·
`budgetLed` · `timeLed` · `scaleLimited` · `propertyGated` · `narrowCriteria`

Plus the four from C2, which say how a protected size may be satisfied and
nothing about how much it matters: `sizeExistingOnly` · `sizeAdditionOkay` ·
`sizeReconfigureOkay` · `sizePropertySpecific`

## Removed from the scored model

`view` · `ceilings` · `finishes` · **`expansion`** · the
`architecturalRequirement` scale · the `operationalBurdenTolerance` scale.

---

# 2. The eight core questions

## Q1 · `tuesday` · context · weight 0.5 · choose 1

> It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?

| Option | Establishes | Weighted |
|---|---|---|
| Getting dinner, errands, and the rest of life done without making it a project. | convenience 3 | **1.5** |
| Having enough room to work, rest, host people, and occasionally avoid everyone. | size 2, separation 2 | **1.0 / 1.0** |
| Being close to the places and people that make Los Angeles worth living in. | proximity 3 | **1.5** |
| Closing the door and not hearing everyone else's life through the walls. | privacy 3, street 1 | **1.5 / 0.5** |

Nothing reaches protect. Every attribute it touches has a full-strength source
elsewhere.

---

## Q2 · `dealbreaker` · up to two, both full strength · weight 1

> You love the house. What still kills it?
> *Pick the one that kills it. If there's honestly a second, add it.*

| Option | Establishes | 1st | 2nd | Qualifier |
|---|---|---|---|---|
| It's dark. | light | **3** | **3** | — |
| There's no privacy. | privacy | **3** | **3** | — |
| The street is too busy. | street | **3** | **3** | — |
| There's nowhere I'd actually want to be outside. | outdoor | **3** | **3** | — |
| **The lot itself. The slope, the shape, or how the house sits on it.** | **site** | **3** | **3** | **yes** |
| I'm too far from the people I see constantly. | proximity | **3** | **3** | — |
| Everything is a drive. | convenience | **3** | **3** | — |
| The layout fights how I live. | layout | **3** | **3** | — |
| I'll outgrow it. | size | **3** | **3** | — |
| None of these automatically kill it. | — | — | — | — |

Rank stored separately as `statedRank { question: 'dealbreaker', position: 1|2 }`.
Both picks are full dealbreakers; position never reduces importance. Used only
to seed Q8 and to let the brief say which of two non-negotiables is harder.

**`site` stays separate from `outdoor`, `light`, `privacy` and `street`.** A
buyer can protect usable outdoor space without caring about the site overall,
and can require the site to work without protecting outdoor space. Both can be
selected together.

**Provenance: two picks are one source** (`dealbreaker`).

---

## Q3 · `daily` · primary + secondary · weight 1 · 3 / 2

> Which of these would wear on you first?
> *And second?*

| Option | Establishes | 1st | 2nd | Qualifier |
|---|---|---|---|---|
| The main rooms don't work for how I cook, eat and have people over. | publicRooms | **3** | **2** | **no** |
| There's nowhere to close a door. | separation | **3** | **2** | — |
| Stairs, levels, getting around it. | circulation | **3** | **2** | — |
| Nowhere for everyday life to go. | utility | **3** | **2** | **yes** |
| Cars, arriving, getting in and out. | parking | **3** | **2** | **yes** |
| Keeping the outside up. | upkeep | **3** | **2** | **yes** |
| I'd want help thinking about this. | — | — | — | — |

**3 / 2 rather than 3 / 3** because Q2 asks about *membership* in the
dealbreaker set, which is binary, while Q3 asks for a *rank*, which is ordinal.
A rank-2 friction lands in `scrutinize`: check it in person, do not filter on it.

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

No negative score. "Plain is actively preferred" is a stance.

---

## Q5 · `personalization` · weight 1 · choose 1

> Once you're in, how much of the look do you want to be yours?

| Option | Scale | Also |
|---|---|---|
| All of it. Paint, paper, lighting, the lot. | personalization **+3** | band `yes` |
| Some. I'd change what bothers me and live with the rest. | **0** | band `conditional` |
| Not much. If it's done well I'd rather leave it alone. | **−2** | band `no` |
| I'd rather buy it finished and not think about it. | **−3** | condition **1**, dayOne **+1**, band `no` |

Independent of Q4 by construction.

**Why "some" is 0 and not +1.** Normalised against the scale's own range of
[−3, +3], +1 reads as 0.667, which is above the 0.62 high threshold. The middle
band was arithmetically unreachable and "some" scored identically to "all of
it", so every rule that fires on high personalization treated the two buyers as
one person. At 0 it reads as 0.500.

`conditional` means willing to change things, with decorating not itself a
goal. On its own it does **not** license the cosmetic-finish lever, a second
look on a plain house, or any do-not-flex on finish. The lever is vetoed with
`limitedCosmeticAppetite`, which is kept separate from `noCosmeticAppetite`
because this is a position, not a refusal. The low band establishes nothing
about renovation tolerance: neither low answer touches that scale.

---

## Q6 · `project` · weight 1 · choose 1

> Great house. Very 2007 kitchen.

| Option | Establishes | Scales | Band | Stances |
|---|---|---|---|---|
| Who cares. That's fixable. | — | reno **+2** | contained | `willBuild` |
| **Honestly I'd go further. Walls, an addition, whatever the house needs.** | **nothing** | reno **+3**, dayOne **−2** | major | `willBuild`, **`structuralWorkOkay`** |
| Depends how much work we're talking about. | — | reno **+1** | undecided → **C1** | |
| I know myself. I'll never redo it. | kitchen **3** | reno **−3** | cosmetic only | |
| No. I want to move in and be done. | kitchen **2**, condition **3** | dayOne **+3**, reno **−2** | turnkey | `wantsFinished` |

The major answer establishes **no attribute**. It records appetite and a
stance, nothing more.

---

## Q7 · `location` · weight 1 · choose 1

> How much does the map actually move?

| Option | Posture | Interpretation | Q8 candidate |
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

Pair matrix in section 5.

---

# 3. Qualifiers

Four bundled selections take a qualifier tap. Multiple bundles share **one
screen**, so the cost is one tap each rather than one screen each.

| Bundled selection | Qualifier options |
|---|---|
| **Q2 · The lot itself** | The land itself: slope, shape, how much is usable flat · How the house sits on it: position, level, orientation · What's built right next to it · Getting in and out · Honestly, the whole thing |
| **Q3 · Nowhere for everyday life to go** | Laundry · Storage · Pantry · Honestly, all of it |
| **Q3 · Cars, arriving, getting in and out** | Off-street parking · A garage · The driveway and getting in and out · EV charging |
| **Q3 · Keeping the outside up** | A pool · Planting and landscape · How much property there is · General maintenance |

**The main-rooms qualifier is cut.** Cooking, eating and hosting are treated as
one public-room-function concept. Qualifiers are kept only where the sub-answer
materially changes what gets searched or inspected.

## Qualifier rules

| Rule | |
|---|---|
| **No provenance source** | `site` still has exactly one source |
| **No weight** | Never raises or lowers importance |
| **Grants vocabulary only** | `upkeep:pool` licenses a pool statement; `upkeep:planting` does not |
| **"All of it" licenses the bundle** | The only way multi-part phrasing may be used |
| **Missing qualifier → no expansion** | Falls back to the category label |
| **Never inferred** | No component of `site` may be named unless the buyer selected it |

---

# 4. Evidence weights and provenance

## Weights, in full

| Source | Attribute evidence | Scales | Stances |
|---|---|---|---|
| Q1 any option | 0.5 × listed weight (max **1.5**) | — | — |
| Q2 pick 1 | **3** | — | — |
| Q2 pick 2 | **3** | — | — |
| Q3 primary | **3** | — | — |
| Q3 secondary | **2** | — | — |
| Q3 upkeep | 3 / 2 | — | — |
| Q4 | 3 or 1 | — | `wantsNeutral` |
| Q5 | condition 1 (finished option only) | pers ±, dayOne + | — |
| Q6 | kitchen 2–3, condition 3 | reno ±, dayOne ± | `willBuild`, `structuralWorkOkay`, `wantsFinished` |
| Q7 | **none** | — | — |
| **Q8** | **none, ever** | — | `narrowCriteria` (escape only) |
| C1 | none | reno +, dayOne + | four gating stances |
| C2 | **none** | **none** | one size-route stance |

## Provenance rules

| Rule | |
|---|---|
| Two picks in Q2 | **one source** (`dealbreaker`) |
| Two picks in Q3 | **one source** (`daily`) |
| Qualifier taps | **no source, no weight** |
| Tradeoff outcome | **a new source** (`tradeoff`), for ordering only |
| Rank | `statedRank`, never importance |
| Recurrence language | requires **two distinct question ids** |
| Derived result states | never evidence, however many one answer reaches |

**Repeatable without Q8:** `privacy` · `street` · `proximity` · `convenience` ·
`size` · `separation` · `condition`.

---

# 5. Adaptive tradeoff

## What a tradeoff answer does, and does not do

You caught a contradiction in the previous draft, and the correction simplifies
the model rather than complicating it.

| A tradeoff answer **does** | A tradeoff answer **does not** |
|---|---|
| Create a `tradeoff` provenance source | Add direct importance to the winner |
| Record `A > B` for that one forced choice | Reduce the loser's importance |
| Raise confidence, because it is a second interaction | Make the winner a dealbreaker |
| — | Move either side across the protect threshold |

**No direct points, including in the fallback.** Relative preference and
absolute importance stay separate, in both directions.

The existing state machine already produces the right outcome from zero direct
points, so nothing special is needed:

| Situation | Resulting state | Reads as |
|---|---|---|
| Wins, no direct evidence | `scrutinize` | Worth looking at closely; not established as a requirement |
| Wins, already protected | stays `protect` | A non-negotiable that also survived a forced choice |
| Loses, already protected | **stays `protect`** | Still a non-negotiable. Somewhere to compare real houses |
| Loses, no direct evidence | `flexibilityToTest` | Nothing established either way |

## Clusters are organizational only

They label the matrix. They do not gate eligibility.

## The allowed-pair matrix

Read as: this concept may be weighed against these. Symmetric.

| Concept | May be paired with |
|---|---|
| `light` | privacy · outdoor · street · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `privacy` | light · outdoor · street · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `outdoor` | light · privacy · street · size · proximity · convenience · MAP · condition · kitchen · architecturalCharacter · upkeep |
| `street` | light · privacy · outdoor · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `site` | size · separation · publicRooms · layout · proximity · convenience · MAP · condition · kitchen · architecturalCharacter · upkeep · circulation |
| `proximity` | light · privacy · outdoor · street · site · size · separation · publicRooms · layout · condition · kitchen · architecturalCharacter · parking |
| `convenience` | light · privacy · outdoor · street · site · size · separation · publicRooms · layout · condition · kitchen · architecturalCharacter · parking |
| `MAP` | light · privacy · outdoor · street · site · size · separation · publicRooms · layout · condition · kitchen · architecturalCharacter · parking |
| `size` | **layout** · **separation** · **publicRooms** · outdoor · site · proximity · convenience · MAP · condition · kitchen · architecturalCharacter · upkeep · parking · circulation |
| `separation` | size · **publicRooms** · site · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `publicRooms` | size · separation · site · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `layout` | size · site · proximity · convenience · MAP · condition · kitchen · architecturalCharacter |
| `condition` | light · privacy · outdoor · street · site · proximity · convenience · MAP · size · separation · publicRooms · layout · architecturalCharacter |
| `kitchen` | light · privacy · outdoor · street · site · proximity · convenience · MAP · size · separation · publicRooms · layout · architecturalCharacter |
| `architecturalCharacter` | light · privacy · outdoor · street · site · proximity · convenience · MAP · size · separation · publicRooms · layout · condition · kitchen |
| `upkeep` | site · outdoor · size |
| `parking` | size · proximity · convenience · MAP |
| `circulation` | site · size |
| `utility` | **nothing** |

**Bold** entries are the same-cluster pairs you named, now allowed.

The matrix is **symmetric and written out in full**. An earlier draft used
"everything except" as shorthand for `condition`, `kitchen` and
`architecturalCharacter`, which silently claimed twelve pairs that the
restricted rows deny: nothing may be weighed against `utility`, and `upkeep`,
`parking` and `circulation` each trade on one narrow axis. Shorthand hides that.
Every row is now explicit and checkable.

## Excluded pairs, with reasons

| Excluded | Why |
|---|---|
| `site` ↔ light, privacy, outdoor, street | The site qualifier already asks about how the house sits and what is next to it. A buyer would reasonably say it is the same question twice |
| `layout` ↔ separation, publicRooms | Both are properties **of** the layout. Containment |
| `condition` ↔ kitchen | The kitchen is part of the condition. Containment |
| `upkeep` ↔ anything but site, outdoor, size | "Less to maintain or better light" is not answerable, and an answer would not change what gets sent |
| `parking` / `circulation` ↔ most concepts | Tradeable only against footprint, site and area. Everything else produces an unanswerable question |
| `utility` ↔ everything | Storage and laundry are per-property checks, not requirements you weigh against light or location |

## Rules per family

Precedence for classification, most specific first: **finish → character →
burden → access → site → place → interior → setting.**

### F1 · Two setting qualities
`light`/`privacy`/`outdoor`/`street` against each other

| | |
|---|---|
| **Coherent because** | These are the four ways a house meets what surrounds it, and openness genuinely pulls against protection |
| **Minimum evidence** | Both at protect (direct ≥ 3) |
| **Preconditions** | None |
| **Winner licenses** | Lead with this when the two compete on a site |
| **Loser licenses** | Somewhere to compare real houses. **Still a non-negotiable** |
| **Cannot infer** | That the loser is negotiable, or that any particular house forces the choice |

### F2 · Two interior qualities
`size` ↔ `layout` · `size` ↔ `separation` · `size` ↔ `publicRooms` · `separation` ↔ `publicRooms`

| | |
|---|---|
| **Coherent because** | These compete for the same square footage. More total space or better organised space is a question a buyer can answer without a house in front of them |
| **Minimum evidence** | Both at protect |
| **Preconditions** | None |
| **Winner licenses** | Which interior quality to hold when a plan cannot deliver both |
| **Loser licenses** | Room to compare in person |
| **Cannot infer** | Anything about how floor plans usually resolve this |

### F3 · Property versus place
Any property concept against `proximity`, `convenience` or `MAP`

| | |
|---|---|
| **Coherent because** | The oldest question in a search: the house or where it is |
| **Minimum evidence** | Property side at protect. `MAP` requires only that Q7 answered |
| **Preconditions** | **`MAP` eligible only at `strongPreference` or `fewAreas`.** Never at `fixed`, never at `propertyLed` |
| **Property wins** | Geography is the lever this buyer has agreed to spend. The strongest result Q8 produces |
| **Map wins** | Geography is firmer than the stated posture. The property criterion is where the search gives |
| **Cannot infer** | That they will move areas generally, or anything about what exists where |

### F4 · Site versus house
`site` against interior, finish or character

| | |
|---|---|
| **Coherent because** | Land and building are separable, and only one of them can be changed |
| **Minimum evidence** | Both at protect |
| **Preconditions** | None |
| **Site wins** | The parcel filters first; the building is the adjustable part |
| **House wins** | The site is a constraint to satisfy, not the leading filter |
| **Cannot infer** | Which components of the site matter, unless the qualifier said so |

### F5 · Anything versus finish
Any concept against `condition` or `kitchen`

| | |
|---|---|
| **Coherent because** | Condition is the most commonly traded thing in any search |
| **Minimum evidence** | Both at protect |
| **Preconditions** | **Project band must not be major.** A buyer who has already said condition does not filter has answered this |
| **Property wins** | Finish is the lever. Houses that show badly stay on the list |
| **Finish wins** | Finish is firmer than the project band suggests. Worth surfacing precisely because it contradicts the softer reading |
| **Cannot infer** | Anything about how the two co-occur in listings |

### F6 · Character versus anything
`architecturalCharacter` against any other concept

| | |
|---|---|
| **Coherent because** | Architectural identity cannot be created, so weighing it against anything is a real question |
| **Minimum evidence** | Both at protect |
| **Preconditions** | Not asked when `wantsNeutral` is set. They have already said it does not matter |
| **Character wins** | Filter on bones before anything else |
| **Other wins** | Character is a preference inside a harder requirement |
| **Cannot infer** | Anything about staging, or about what reads as character in a listing |

### F7 · Burden versus scale
`upkeep` ↔ `site` · `upkeep` ↔ `outdoor` · `upkeep` ↔ `size`

| | |
|---|---|
| **Coherent because** | More land, more outside, more house all mean more to look after. This is the only axis `upkeep` genuinely trades against |
| **Minimum evidence** | Both at protect |
| **Preconditions** | `upkeep` must carry a qualifier, so the brief knows what kind of burden |
| **Upkeep wins** | Scale is a cost. Smaller and usable beats larger and managed |
| **Scale wins** | They will take the maintenance for the property |
| **Cannot infer** | Which maintenance, unless the qualifier said so. **A pool may be named only on `upkeep:pool`** |

### F8 · Access and circulation versus footprint
`parking` ↔ size/proximity/convenience/MAP · `circulation` ↔ site/size

| | |
|---|---|
| **Coherent because** | Off-street parking and level living both consume footprint or constrain the site |
| **Minimum evidence** | Both at protect |
| **Preconditions** | `parking` must carry a qualifier |
| **Access wins** | A hard physical requirement that outranks square footage or area |
| **Footprint wins** | Access is a strong preference, to be solved rather than filtered on |
| **Cannot infer** | The reason for a step-free requirement. **Never asked** |

### F9 · Fallback, when no allowed pair qualifies
Needs no prior evidence. Chosen by map posture so the fixed-map rule holds.

| Map | Pair |
|---|---|
| `strongPreference`, `fewAreas` | *A house that needs real work, in the area you want* · *A finished house you'd have to go further for* |
| `fixed`, `propertyLed` | *A great lot and a dated house* · *A beautiful renovation on a compromised lot* |

**Also no direct points.** The winner lands in `scrutinize` and the loser in
`flexibilityToTest`, which is the honest reading: an ordering was established,
a requirement was not.

## Selection algorithm

1. Candidates: every attribute at protect, plus `MAP` when Q7 allows.
2. Form all pairs. Keep only those in the allowed matrix.
3. Drop any failing a family precondition or the minimum-evidence rule.
4. Classify by the precedence order above.
5. Rank by **joint strength**: the *lower* of the two directs, so two strong
   things are paired rather than a strong against a medium. Ties break on
   independent source count, then `statedRank` (a rank-1 dealbreaker outranks a
   rank-2), then a stable attribute order for determinism.
6. Nothing qualifies → F9.
7. Record: a `tradeoff` source, a win, a loss, and the pair itself so the brief
   can name exactly which two things were weighed. **No importance changes.**

---

# 6. Conditional follow-ups

## C1 · "depends on what?" · fires on Q6 = *depends*

| Option | Scales | Stance |
|---|---|---|
| The money. If the numbers work, I'd take on a lot. | reno **+2** | `budgetLed` |
| The time. I can't live in a construction site. | reno **+1**, dayOne **+1** | `timeLed` |
| The scale. Rooms, yes. Moving walls, no. | reno **+1** | `scaleLimited` |
| The house. For the right property I'd do a lot more. | reno **+2** | `propertyGated` |

## C2 · the size route · fires on `size` protect **AND** `structuralWorkOkay`

> If the right house is smaller than you want today, what happens?

| Option | Route | Scales | Attributes |
|---|---|---|---|
| It needs to be big enough already. | `existingOnly` | **none** | **none** |
| I'd consider adding on if the property made sense. | `additionOkay` | **none** | **none** |
| I'd rework the space that's already there, but I don't want an addition. | `reconfigureOkay` | **none** | **none** |
| I'd have to see the actual house before I knew. | `propertySpecific` | **none** | **none** |

**Both trigger conditions, not either.** A high renovation tolerance alone is
not enough: plenty of buyers take on work without size being what is at stake,
and asking someone how they would reach a size they never protected is a
question that makes the instrument feel like it is guessing. `project: fixable`
gives a high renovation band without accepting structural work and does not
fire this.

**It changes the route, never the requirement.** No option carries an attribute
weight or a scale delta. Each sets one stance and nothing else, so `size` stays
protected at exactly the same strength, from the same sources, at the same
stated rank, on all four routes. No option creates an `expansion` attribute,
and `expansion` remains absent from the taxonomy.

Strategy consequences, which differ on every route:

| route | search behaviour |
|---|---|
| `existingOnly` | undersized is eliminated; never kept on the assumption it can be enlarged later; the route itself is no longer a lever |
| `additionOkay` | undersized may stay a candidate; whether **this** property can take an addition is a property fact and is verified in person, never assumed |
| `reconfigureOkay` | the existing area may work when the problem is the arrangement; this never implies that genuinely insufficient area is acceptable |
| `propertySpecific` | nothing is decided from the listing; the house and the site settle it |

While the route is unanswered, the brief reports `mustSpaceExistAlready` as its
unresolved item and offers no second look on an undersized house, because
keeping one in play would assume the answer.

At most one clarification per result; C1 takes precedence, though in practice
the two cannot both be live since `depends` and `further` are different answers
to Q6. A clarification may not raise a new attribute above `scrutinize`.
Unanswered is recorded as unresolved, never defaulted.

---

# 7. Optional agent handoff

Shown **only** after the result, on the brief step. Every field optional, the
whole thing skippable in one tap. **Verbatim search facts, not scored evidence.**

| Group | Fields |
|---|---|
| **Price** | Target range · Hard ceiling *(optional)* |
| **Timing** | Casually looking · Hoping to buy this year · Actively looking now · Specific timing *(free text)* |
| **Where** | Neighborhoods or cities considering · Areas ruled out · Geographic notes |
| **Schools** | A specific school, district or boundary they want respected *(free text)* |
| **Destinations** | Places they want reasonable access to *(free text)* |
| **Property basics** | Property type · Minimum bedrooms · Minimum bathrooms · Minimum square footage *(optional)* |
| **Hard filters** | Parking or garage · Stairs or step-free requirement · Pool preference · EV requirement · Other physical requirement |
| **Open** | Anything else Danielle should know |

## Handling rules

| Rule | |
|---|---|
| Never scored | No handoff field touches the model, the result, or the shareable URL |
| Never inferred from | A blank field means nothing. It is not evidence of flexibility |
| Recorded verbatim | Free text passes to Danielle as written, never parsed into categories |
| Free text only for schools and destinations | No pickers, no lists, no ratings |
| Never ask why | Bedrooms, schools, destinations, step-free access, areas ruled out |
| Exclusions are notes | "Already ruled out" is recorded for Danielle, never propagated into an automated filter |

## Fair-housing discipline

The rule the map already follows: **record the constraint, never the reason.**

- **Schools:** ask for the buyer's own specific requirement. Never ask whether
  they want "good schools", never rate a school, never derive an area
  recommendation from school quality. Nothing about schools is surfaced that
  the buyer did not type.
- **Bedrooms:** a property specification. Familial status is protected, so the
  number is asked and the household never is.
- **Step-free access:** a property filter. Disability is protected, so the
  requirement is asked and the reason never is.
- **Destinations:** recorded as written. No categories, because a category list
  would collect things like places of worship.
- **Geography:** strength of constraint, never its reason. Unchanged from today.

## One interaction, as a flag rather than a rescore

Handoff **pool: yes** against test **`upkeep:pool`** is a discrepancy the brief
raises for Danielle. It changes no score and no result.
