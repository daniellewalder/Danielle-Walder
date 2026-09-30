# The Tuesday Test: proposed instrument (Phase 2, revised)

**No code changed.** Proposal for approval.

8 core questions, at most 2 conditional follow-ups, plus qualifier taps on
bundled answers. Price, timeline and search parameters move to an optional
handoff attached to the brief.

**Revision note.** Four corrections applied: both dealbreakers now carry full
protect-level evidence with rank stored separately; `character` is split into
`architecturalCharacter` and the personalization scale; qualifiers follow any
bundled selection rather than only the primary; the tradeoff adjacency data now
encodes only question coherence and contains no market claims.

---

## What changed since the last draft

| Correction | Consequence |
|---|---|
| Both dealbreakers at full weight | Rank becomes a separate field. Two protected attributes from one question, one provenance source |
| `character` split properly | `architecturalCharacter` attribute; `finishes` and the `architecturalRequirement` scale **removed**; "plain is fine" becomes a stance, not a negative score |
| Qualifiers on any bundled pick | Up to two qualifier taps, merged onto one screen |
| No market claims in the tradeoff | Adjacency data now answers "is this a coherent question?", never "do houses trade this way?" |
| **Knock-on** | Both one-sided scales disappear. Five scales become **three, all two-sided** |
| **Knock-on** | `lot` is decomposed into the site cluster and removed. Flagged below as a decision for you |

---

# 1. Revised attribute taxonomy

## Attributes — 18, every one reachable

### protectAtPurchase — you buy these or you don't get them

| id | Label | Sources |
|---|---|---|
| `light` | Natural light | Q2 |
| `privacy` | Privacy | Q1, Q2 |
| `outdoor` | Outdoor space you'd actually use | Q2 |
| `street` | The street and the noise | Q1, Q2 |
| `proximity` | Being close to the people you see constantly | Q1, Q2 |
| `convenience` | Getting daily life done easily | Q1, **Q2 (new)** |
| `architecturalCharacter` | The architecture itself: proportion, bones, materials | **Q4 (new)** |

### realProject — possible, but money, permits and disruption

| id | Label | Sources |
|---|---|---|
| `layout` | The layout | Q2 |
| `size` | Enough square footage | Q1, Q2 |
| `separation` | Somewhere to close a door | Q1, Q3 |
| `publicRooms` | Living space that works for how you cook and host | Q3 |
| `kitchen` | A kitchen you don't have to redo | Q6 |
| `condition` | Move-in condition | Q5, Q6, C2 |

### verifyPerProperty — depends on the actual site, structure or rules

| id | Label | Sources | Qualifier |
|---|---|---|---|
| `expansion` | Room to add on later | **Q6 (new)** | — |
| `circulation` | Stairs and how you move through it | Q3 | — |
| `utility` | Where everyday life goes | Q3 | **yes** |
| `parking` | Cars, arriving, getting in and out | Q3 | **yes** |
| `upkeep` | How much there is to look after | Q3 | **yes** |

### usuallyAdaptable — **empty, deliberately**

Nothing in the scored model is genuinely cosmetic. The decorative layer is a
scale, not an attribute. Keeping the class empty is the honest outcome and it
removes the current result's backwards claim that "only character could come
later."

## Scales — 3, all two-sided

| Scale | Range | Sources | Means |
|---|---|---|---|
| `personalizationAppetite` | −3 to +3 | Q5, C2 | How much of the decorative layer the buyer wants to supply |
| `renovationTolerance` | −3 to +3 | Q6, C1, C2 | How much construction they will take on |
| `dayOneReadiness` | −2 to +4 | Q5, Q6, C1, C2 | How much must already work at purchase |

## Stances — explicit positions, no score

`wantsFinished` · `willBuild` · **`wantsNeutral`** (new) · `budgetLed` ·
`timeLed` · `scaleLimited` · `propertyGated` · `narrowCriteria`

## Removed from the scored model

| Removed | Why |
|---|---|
| `view` | No source. Largely carried by `light` and the site cluster. Belongs in free text |
| `ceilings` | A showing observation, not a search filter |
| `finishes` | **Fully covered by `condition` plus `personalizationAppetite`.** "Finishes matter" means either "they must already be good" (condition) or "I'll replace them" (personalization). Scoring it separately models the same thing twice |
| `character` | **Renamed and reclassified** to `architecturalCharacter`, protectAtPurchase |
| `architecturalRequirement` scale | Duplicated the attribute. One representation, not two |
| `operationalBurdenTolerance` scale | Duplicated `upkeep` being protected. The qualifier now carries the precision the scale was standing in for |
| `lot` | **Decision needed — see below** |

### On removing `lot`

`lot` currently has one source, the forced trade, and it functions as a proxy
for "the site as a whole". Under V2 the site is asked directly and in parts:
light, privacy, outdoor space, the street. Those four *are* the lot for search
purposes, and each is individually actionable where "the lot itself" is not.

Keeping it would need a tenth option in Q2 ("the lot itself doesn't work"),
which overlaps three options already there.

**Your call.** I recommend removing it. If you want it kept, the cheapest home
is that tenth Q2 option, and I'd want your wording.

---

# 2. The eight core questions

## Q1 · `tuesday` · context · weight 0.5 · choose 1 · unchanged

> It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?

| Option | Establishes | Weighted |
|---|---|---|
| Getting dinner, errands, and the rest of life done without making it a project. | convenience 3 | **1.5** |
| Having enough room to work, rest, host people, and occasionally avoid everyone. | size 2, separation 2 | **1.0 each** |
| Being close to the places and people that make Los Angeles worth living in. | proximity 3 | **1.5** |
| Closing the door and not hearing everyone else's life through the walls. | privacy 3, street 1 | **1.5 / 0.5** |

No option reaches protect (3). Every attribute it touches has a full-strength
source elsewhere, so it is a genuine second opinion rather than a hidden first.

---

## Q2 · `dealbreaker` · **up to two, both at full strength** · weight 1

> You love the house. What still kills it?
> *Pick the one that kills it. If there's honestly a second, add it.*

| Option | Establishes | **1st pick** | **2nd pick** |
|---|---|---|---|
| It's dark. | light | **3** | **3** |
| The street is too busy. | street | **3** | **3** |
| There's nowhere I'd actually want to be outside. | outdoor | **3** | **3** |
| I'm too far from the people I see constantly. | proximity | **3** | **3** |
| There's no privacy. | privacy | **3** | **3** |
| Everything is a drive. *(new)* | convenience | **3** | **3** |
| The layout fights how I live. | layout | **3** | **3** |
| I'll outgrow it. | size | **3** | **3** |
| None of these automatically kill it. | — | — | — |

### Rank is stored separately from importance

Both picks record `statedRank: { question: 'dealbreaker', position: 1 | 2 }`.

The model can now represent the thing it could not before: **both are
non-negotiable, and if forced to rank them this one comes first.** Position is
ordering information. It never reduces importance, and a rank-2 dealbreaker is
still a dealbreaker.

Rank is used for exactly two things: seeding the adaptive tradeoff, and letting
the brief say which of two non-negotiables is the harder one. It is never used
to downgrade, filter or omit.

### Provenance

**Two picks are one source.** Both record `dealbreaker`. Two selections inside
one question are not two independent confirmations, so this cannot manufacture
recurrence language. That still requires a second *question*.

---

## Q3 · `daily` · primary + secondary · weight 1

> Which of these would wear on you first?
> *And second?*

| Option | Establishes | **1st: 3** | **2nd: 2** | Bundled? |
|---|---|---|---|---|
| The main rooms don't work for how I cook, eat and have people over. | publicRooms | 3 | 2 | **yes** |
| There's nowhere to close a door. | separation | 3 | 2 | no |
| Stairs, levels, getting around it. | circulation | 3 | 2 | no |
| Nowhere for everyday life to go. | utility | 3 | 2 | **yes** |
| Cars, arriving, getting in and out. | parking | 3 | 2 | **yes** |
| Keeping the outside up. | upkeep | 3 | 2 | **yes** |
| I'd want help thinking about this. | — | — | — | no |

### Why Q3 is weighted 3 / 2 and Q2 is 3 / 3

Different questions. **Q2 asks about membership**: is this a dealbreaker, yes
or no? Membership is binary, so both members are full members. **Q3 asks for a
rank**: what wears on you *first*, and *second*? The second is explicitly
second, and a rank-2 friction genuinely is a lesser signal than a rank-1 one.

A secondary at 2 lands in `scrutinize`, which is correct: worth checking in
person, not a filter.

---

## Q3 qualifiers · **on any bundled selection**

A qualifier fires for each bundled pick, primary or secondary. When both picks
are bundled, both qualifier sets appear **on one screen**, so the cost is two
taps rather than two question transitions.

| Category | Qualifier options |
|---|---|
| **Nowhere for everyday life to go** | Laundry · Storage · Pantry · Honestly, all of it |
| **Cars, arriving, getting in and out** | Off-street parking · A garage · The driveway and getting in and out · EV charging |
| **Keeping the outside up** | A pool · Planting and landscape · How much property there is · General maintenance |
| **The main rooms** *(see note)* | Cooking · Having people over · Everyday eating · All of it |

### Qualifier rules

- **No provenance source.** A qualifier records no question id. `utility`
  still has exactly one source.
- **No weight.** It does not raise or lower importance.
- **It grants vocabulary.** `upkeep:pool` licenses a statement about a pool.
  `upkeep:planting` does not, and a brief for that buyer must not mention
  pools.
- **"All of it" licenses the full bundle**, because they said so. That is the
  only way the three-part phrasing may ever be used.
- **No qualifier means no expansion.** If a qualifier is somehow missing, the
  brief uses the category label and nothing more specific.

> **Note on the main rooms — your call.** This one is arguably a single concept
> described three ways, unlike laundry/storage/pantry which are three separate
> systems. I've included the qualifier because it changes what Danielle
> inspects (a serious cook and a serious host need different kitchens), but it
> costs a tap and you can cut it without damaging the model.

---

## Q4 · `architecture` · **new** · weight 1 · choose 1

> Some houses have something of their own. Others are just well built. Which matters to you?

| Option | Establishes | Stance |
|---|---|---|
| A lot. If the house has no point of view, I'm not interested. | architecturalCharacter **3** | |
| Some. I'd take well proportioned and plain, but I'd rather have both. | architecturalCharacter **1** | |
| Not really. I care how it works, not what period it is. | — | |
| I'd rather it be plain, so nothing fights what I bring to it. | — | **`wantsNeutral`** |

**No negative score.** The model's rule that no option may carry negative
importance is preserved. "Plain is actively preferred" is recorded as a
*stance*, exactly like `wantsFinished`, which is what removes the need for a
one-sided `architecturalRequirement` scale.

`architecturalCharacter` is `protectAtPurchase`. You cannot add proportion,
period detailing or the way a house is built. That is the whole point of
separating it from decoration.

---

## Q5 · `personalization` · **new** · weight 1 · choose 1

> Once you're in, how much of the look do you want to be yours?

| Option | Scale | Also |
|---|---|---|
| All of it. Paint, paper, lighting, the lot. | personalization **+3** | |
| Some. I'd change what bothers me and live with the rest. | **+1** | |
| Not much. If it's done well I'd rather leave it alone. | **−2** | |
| I'd rather buy it finished and not think about it. | **−3** | condition 1, dayOne +1 |

**Q4 and Q5 are independent by construction.** "The house must bring real
architecture" *and* "I'll paper every room" is one coherent person, now
reachable in a single pass. In the current instrument that combination is
reachable on 1.19% of paths and only by answering contradictorily first.

---

## Q6 · `project` · changed · weight 1 · choose 1

> Great house. Very 2007 kitchen.

| Option | Establishes | Scales | Band | Stance |
|---|---|---|---|---|
| Who cares. That's fixable. | — | reno **+2** | contained | `willBuild` |
| Honestly I'd go further. Walls, an addition, whatever the house needs. | expansion **3** | reno **+3**, dayOne **−2** | major | `willBuild` |
| Depends how much work we're talking about. | — | reno **+1** | undecided → **C1** | |
| I know myself. I'll never redo it. | kitchen **3** | reno **−3** | cosmetic only | |
| No. I want to move in and be done. | kitchen **2**, condition **3** | dayOne **+3**, reno **−2** | turnkey | `wantsFinished` |

---

## Q7 · `location` · unchanged · weight 1 · choose 1

> How much does the map actually move?

| Option | Posture | Interpretation rule | Tradeoff candidate? |
|---|---|---|---|
| It doesn't. One area, and outside it doesn't work for my life. | `fixed` | Geography will not be the lever. Name another one. **Licenses nothing about whether the map was tested, and nothing about inventory** | **Never** |
| I have a strong preference, but the right house nearby would get a look. | `strongPreference` | Geography is the available lever | **Yes** |
| There are a handful of areas that genuinely work. | `fewAreas` | Area selection is the lever; choose deliberately rather than drifting | **Yes** |
| The right property could move me. | `propertyLed` | The property spec is the whole filter | No — already answered |

Free-text note unchanged: shown for `fixed` and `strong`, **never reaches the
model**, read only by Danielle.

---

## Q8 · `tradeoff` · adaptive · weight 1 · choose 1

> Two of these came up. If you had to pick one, which survives?
> **[A]** · **[B]** · *I'd keep looking.*

Pair selection in section 4.

---

# 3. Conditional follow-ups

## C1 · "depends on what?" · fires when Q6 = *depends*

> Depends on what, mostly?

| Option | Scales | Stance |
|---|---|---|
| The money. If the numbers work, I'd take on a lot. | reno **+2** | `budgetLed` |
| The time. I can't live in a construction site. | reno **+1**, dayOne **+1** | `timeLed` |
| The scale. Rooms, yes. Moving walls, no. | reno **+1** | `scaleLimited` |
| The house. For the right property I'd do a lot more. | reno **+2** | `propertyGated` |

"Depends" currently drives the open question on **64%** of result paths. This
turns one bucket into four operationally different buyers.

## C2 · contradiction · fires on `wantsFinished` + `willBuild`

Unchanged in mechanism, and it will fire far less often now that wanting
architecture and wanting to decorate are no longer read as a contradiction.

## Clarification rules

- At most **one** clarification per result. C1 takes precedence over C2.
- A clarification may not raise a new attribute above `scrutinize`. It
  resolves; it does not add priorities.
- An unanswered clarification is recorded as unresolved and never defaults to
  a middle value.

---

# 4. Adaptive tradeoff — eligibility matrix

## The principle

**The adjacency data says only whether two concepts form a coherent forced
choice. It says nothing about how houses or markets behave.** The pair itself
comes entirely from what this buyer established.

## Clusters, for the same-cluster exclusion

| Cluster | Members | Tradeable? |
|---|---|---|
| SITE | light, privacy, outdoor, street | yes |
| ACCESS | proximity, convenience | yes |
| SPACE | size, separation, publicRooms, layout | yes |
| CONDITION | condition, kitchen | yes |
| CHARACTER | architecturalCharacter | yes |
| BURDEN | upkeep | yes |
| IN-HOUSE LOGISTICS | circulation, utility, parking | **no** |
| CAPACITY | expansion | **no** |
| MAP | pseudo-candidate | only when `strongPreference` or `fewAreas` |

**Why logistics and capacity are excluded.** "Would you rather have storage or
natural light?" is not a question a person can answer, and an answer would not
change what gets sent. `expansion` is a route to a requirement, not a
requirement, so trading it against one is incoherent.

## Universal guards — applied before any pair is considered

| Guard | Rule |
|---|---|
| Evidence floor | Both sides must be at **protect** level (direct ≥ 3). Never pair a certainty against a guess |
| No unset | An attribute with no evidence can never appear |
| No weak against strong | A Q1 context signal (max 1.5) can never be a side. This is a consequence of the floor, stated explicitly because it was your specific concern |
| Fixed map never moves | The map is a candidate only at `strongPreference` or `fewAreas` |
| No same cluster | Both sides in one cluster is a trick question |
| No preconditions | Never pair a thing against something it contains or depends on |
| Qualifier honesty | A qualifier-specific concept may appear only if that qualifier was selected |
| Already resolved | Never re-ask a pair an earlier answer settled |
| Abstract only | The question is "if you had to pick one", never "in a house like this" |

## Pair families

### Family A — two protected property attributes, different clusters

| | |
|---|---|
| **Eligible when** | Both at protect, different clusters, neither a precondition of the other, neither in an excluded cluster |
| **Disqualified when** | Same cluster · either below protect · either is in-house logistics or capacity |
| **A win means** | When both cannot be had, this one survives. Ordering only |
| **A loss means** | There is somewhere to compare real houses. **No penalty. It remains protected** |
| **Legitimate inference** | "When these two compete, lead with the winner." The loser stays a non-negotiable that may have to be satisfied differently |
| **Never infer** | That the loser is negotiable, or that a given house forces this choice |

### Family B — a protected property attribute versus the map

| | |
|---|---|
| **Eligible when** | Map is `strongPreference` or `fewAreas`, and the attribute is at protect |
| **Disqualified when** | Map is `fixed` (**never ask a fixed map to move**) or `propertyLed` (already answered) |
| **A win for the property** | Geography is the lever this buyer has agreed to spend. The strongest result the tradeoff can produce |
| **A win for the map** | Geography is firmer than the stated posture. The property criterion is where the search must give |
| **Legitimate inference** | Which of the two to spend first when a near-miss appears |
| **Never infer** | That they will move areas in general, or anything about what is available where |

### Family C — a protected property attribute versus condition

| | |
|---|---|
| **Eligible when** | `condition` or `kitchen` is at protect, the other side is at protect in a different cluster, and the project band is **not** major |
| **Disqualified when** | Project band is major — they have already said condition does not filter, so the question is dead · either side below protect |
| **A win for the property** | Finish is the lever. Houses that show badly stay on the list |
| **A win for condition** | Finish is firmer than the project band suggests. Worth surfacing, because it contradicts the softer reading |
| **Legitimate inference** | Whether condition should filter at all |
| **Never infer** | Anything about how condition and that attribute co-occur in listings |

### Family D — fallback, when nothing above is eligible

Needs no prior attribute evidence. Chosen by map posture, so the fixed-map
guard is never violated.

| Map | Fallback pair |
|---|---|
| `strongPreference`, `fewAreas` | *A house that needs real work, in the area you want* · *A finished house you'd have to go further for* |
| `fixed`, `propertyLed` | *A smaller house that's finished* · *A bigger one that needs work* |

**Fallback winners receive direct evidence of 2, not 3.** A forced choice with
nothing volunteered reveals ordering, not importance, so it lands in
`scrutinize` rather than protect. Adaptive winners (families A to C) receive no
new direct evidence at all, because both sides were already protected.

## Selection algorithm

1. Build candidates: every protect-level attribute in a tradeable cluster, plus
   the map when its posture allows.
2. Form all pairs; drop any failing a universal guard.
3. Classify each surviving pair as family A, B or C.
4. Rank by **joint strength**: the *lower* of the two sides' direct values, so
   two strong things are paired rather than a strong against a medium. Ties
   break on independent source count, then on `statedRank` from Q2 (a rank-1
   dealbreaker outranks a rank-2 one), then on a stable attribute order so the
   same answers always produce the same question.
5. If nothing survives, use family D.
6. Record: winner gets a tradeoff win sourced to `tradeoff`; loser gets a
   tradeoff loss and **no penalty**; the pair is stored so the brief can name
   exactly which two things were weighed.

The tradeoff is the one mechanism by which a single-source attribute can become
repeated, because it is a genuinely separate question at a separate moment.

---

# 5. Provenance rules

| Rule | |
|---|---|
| Two picks in Q2 | **One source** (`dealbreaker`) |
| Two picks in Q3 | **One source** (`daily`) |
| Qualifier taps | **No source, no weight** |
| Tradeoff win | **A new source** (`tradeoff`) — a separate question at a separate moment |
| Rank | Stored as `statedRank`, never as importance |
| Recurrence language | Still requires **two distinct question ids** |
| Derived result states | Never evidence, however many a single answer reaches |

### Repeatable under V2, without the tradeoff

`privacy` · `street` · `proximity` · `convenience` · `size` · `separation` ·
`condition`

Everything else needs a tradeoff win. That is the accepted price of eight
questions, and per your instruction I am not proposing a ninth to change it.

---

# 6. Optional agent handoff

Shown **only** on the brief step, after the result. Clearly optional, skippable
in one tap.

| Field | Form | Scored? |
|---|---|---|
| Approximate range | Bands, never an exact figure | **Never** |
| Timing | Now · a few months · this year · no rush | **Never** |
| Areas already considering | Free text | **Never scored, never matched** |
| Anything else Danielle should know | Free text | **Never** |
| **Property type** | House · condo · townhouse · open to any | **Never** |
| **Minimum bedrooms** | Number | **Never** |

None of these rescore the test or alter the shareable result.

## On property type and bedrooms — yes to both, for different reasons

**Property type belongs here and is not a duplicate.** Nothing in the test asks
it, and it changes the search completely. A buyer who protects outdoor space
and privacy but is open to a condo is a different search from one who is not,
and the test cannot tell them apart. It is a search parameter rather than a
preference, which is exactly what the handoff is for.

**Minimum bedrooms belongs, with a constraint.** It partially overlaps `size`
and `separation`, but not redundantly: those are *qualities* and bedrooms is a
*filter* that every IDX uses. A buyer who protects separation might need three
bedrooms or five, and the test deliberately cannot tell you which.

The constraint: **ask for the number, never the reason.** Familial status is
protected under the Fair Housing Act. "Minimum bedrooms" is a property
specification and is safe. "How many people live with you", "do you have
children", "is anyone moving in with you" are not, and must never appear.

This is the same discipline already applied to the map: we record the strength
of a constraint and never its reason.

---

# 7. Five answer paths

Nothing in the third row is derivable from any single answer.

---

### Path A — architecture and layers, reachable in one pass

*Q1 quiet · Q2 dark **(rank 1)**, privacy **(rank 2)** · Q3 main rooms → hosting; separation second · Q4 a lot · Q5 all of it · Q6 never redo · Q7 fewAreas · Q8 light vs architecturalCharacter → light*

| | |
|---|---|
| **Directly told us** | Dark kills it, and no privacy kills it too, with dark the harder of the two. Hosting is the daily friction, a door to close is second. The house needs its own architecture. All the styling is theirs. They'll never redo the kitchen. A handful of areas. Forced to choose, light beats architecture. |
| **The combination adds** | Two full dealbreakers with an order, which the current instrument cannot express at all. Architecture is *required* and the decorative layer is *theirs* — separable for the first time. And the tradeoff settles something neither answer contains: when a characterful house is dark, the architecture gives. |
| **Danielle does differently** | Screens on light before period. Sends the plainer bright house over the darker characterful one, and says why. Filters on a kitchen that already works, since they will not touch it. Does not send the flipped house with a new kitchen and no point of view. Raises privacy as the second hard line, not an afterthought. |

---

### Path B — storage, specifically

*Q1 errands · Q2 everything is a drive **(rank 1)** · Q3 everyday life → **storage**; cars second → **EV charging** · Q4 not really · Q5 not much · Q6 move in and be done · Q7 fixed · Q8 fallback: smaller finished vs bigger needing work → smaller finished*

| | |
|---|---|
| **Directly told us** | Errands matter and "everything is a drive" kills it. **Storage** is the friction, not laundry or pantry. **Charging** is second. Architecture does not matter. Wants it finished. One area. Smaller and finished beats bigger and unfinished. |
| **The combination adds** | Convenience is confirmed across two questions *and* is a dealbreaker: it is the hardest criterion in the search. The fallback tradeoff then establishes that size is the give, which nothing they said directly reveals. The practical program is exact: closet and storage volume, and a charger or the panel capacity to add one. |
| **Danielle does differently** | Leads on walkable location, then finish, and treats square footage as the adjustable number. Checks storage volume and electrical capacity in person, both invisible in listings. **Says nothing about laundry or pantry**, because those were not what they picked. |

---

### Path C — strong preference, and it moves

*Q1 quiet · Q2 no privacy **(rank 1)** · Q3 separation; main rooms second → everyday eating · Q4 rather plain (`wantsNeutral`) · Q5 not much · Q6 move in and be done · Q7 strongPreference · Q8 **privacy vs the map** → privacy*

| | |
|---|---|
| **Directly told us** | Privacy kills it, confirmed by Q1 as well. Needs a door to close. Would rather the house be plain. Wants it finished. Strong area preference. Privacy beats the map. |
| **The combination adds** | They said the map has give, and then confirmed it under pressure by choosing a property quality over geography. So geography is not merely the available lever, it is the one they have already agreed to spend. `wantsNeutral` means blandness is not a filter, which widens the list considerably for a buyer who otherwise looks fussy. |
| **Danielle does differently** | Presents finished houses outside the usual line first and without apology. Screens hard on privacy geometry before anything else. Stops discounting plain houses. Skips the project inside the area, which is the default thing to show a strong-preference buyer. |

---

### Path D — one "depends", two searches

Identical through Q5: *Q2 I'll outgrow it · Q3 main rooms → cooking · Q6 depends · Q7 fixed*

| | **D1 · C1 = the money** | **D2 · C1 = the time** |
|---|---|---|
| **Directly told us** | Scope follows the numbers | Cannot live in a construction site |
| **Combination adds** | Inside a fixed map, condition is the available lever and its limit is budget. A larger project is on the table if the maths works. | Inside a fixed map, condition is the lever but capped by disruption, not cost. Occupied-during-works becomes a filter, and `dayOneReadiness` rises even though renovation tolerance did not fall. |
| **Danielle does differently** | Sends houses needing real work and frames the conversation as scope against price. | Sends cosmetically dated but structurally sound houses. Screens out anything needing a permit timeline. Never sends the gut job. |

---

### Path E — a pair the fixed question could never ask

*Q1 room · Q2 nowhere to be outside **(rank 1)**, I'll outgrow it **(rank 2)** · Q3 main rooms → having people over; keeping it up second → **planting** · Q4 some · Q5 all of it · Q6 fixable · Q7 propertyLed · Q8 **outdoor vs size** → outdoor*

| | |
|---|---|
| **Directly told us** | Outdoor space kills it, and outgrowing it kills it too, with outdoor the harder. Hosting is the friction, **planting** is second. Will decorate, will renovate, property-led. Outdoor beats size. |
| **The combination adds** | Two full dealbreakers that genuinely compete for the same site, resolved by the tradeoff: on a constrained lot, the outdoor room wins and interior square footage gives. Renovation tolerance is high, so interior space is recoverable and the outdoor relationship is not. And the qualifier says the burden is **planting**, not a pool. |
| **Danielle does differently** | Filters on the indoor-outdoor relationship ahead of square footage. Treats heavy planting as a cost and flags it at the showing. Sends the compromised interior on the right site, because the interior is the part this buyer will change. **Says nothing about pools.** |

---

# 8. Honest costs

1. **Taps.** 8 questions, 8 to 12 taps depending on bundles and the follow-up.
   Today it is 7 and 8.
2. **`lot` is removed** pending your decision.
3. **Existing result links break.** The codec changes shape; old links should
   degrade to a partial result rather than an error, which is how the decoder
   already behaves.
4. **The tradeoff adjacency data is still judgement**, even stripped of market
   claims. The cluster assignments and the two excluded clusters are calls I
   have made and you should check.
5. **Seven attributes are repeatable without the tradeoff.** The rest need a
   tradeoff win. Accepted, per your instruction not to add a ninth question.
