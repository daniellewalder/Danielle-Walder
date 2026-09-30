# The Tuesday Test: proposed instrument (Phase 2)

A redesign of the question set so it can support a real agent brief. **No code
changed.** This is a proposal for approval.

Budget: **8 core questions, 2 conditional.** Price, timeline and areas move to
an optional handoff attached to the brief, not the test.

---

## What changes, in one table

| Current | Verdict | Becomes |
|---|---|---|
| Q1 `tuesday` | **Kept exactly** | Still context, still weight 0.5. Now honestly non-load-bearing, because every attribute it touches gets a second source elsewhere |
| Q2 `dealbreaker` | **Changed** | Up to two, **ordered**. First 3, second 2. The order is free hierarchy |
| Q3 `daily` | **Restructured** | Primary + secondary, plus a qualifier tap that resolves the bundle |
| Q4 `inherit` | **Replaced** | Becomes the adaptive tradeoff, asked last, with the old lot-vs-condition pair as the fallback |
| Q5 `whitehouse` | **Split in two** | Q4 architecture, Q5 personalization. They stop being opposites |
| Q6 `kitchen` | **Changed** | Five options carrying four project bands; "depends" now triggers a follow-up |
| Q7 `location` | **Kept** | Same four postures. Every one now gets an interpretation rule |
| Q8 `clarify` | **Kept, narrowed** | Fires much less, because the architecture/personalization split removes the commonest false conflict |
| — | **New** | C1 "depends on what?" resolves the largest uncertainty bucket in the model |

---

# 1. The proposed core set, in order

## Q1 — `tuesday` · context · weight 0.5 · choose 1 · **unchanged**

> It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?

| Option | Establishes | Strength | Provenance |
|---|---|---|---|
| Getting dinner, errands, and the rest of life done without making it a project. | convenience 1.5 | directional | `tuesday` |
| Having enough room to work, rest, host people, and occasionally avoid everyone. | size 1.0, separation 1.0 | directional, bundled | `tuesday` |
| Being close to the places and people that make Los Angeles worth living in. | proximity 1.5 | directional | `tuesday` |
| Closing the door and not hearing everyone else's life through the walls. | privacy 1.5, street 0.5 | directional | `tuesday` |

**Why it exists:** identity, and it puts someone in an ordinary evening before
they start declaring absolutes. **What it may never do:** create a requirement
on its own. No option here reaches the protect threshold, and after this
redesign every attribute it touches has a full-strength source elsewhere, so it
is genuinely a second opinion rather than a hidden first one.

---

## Q2 — `dealbreaker` · **up to two, ordered** · weight 1

> You love the house. What still kills it?
> *Pick the one that kills it. If there's honestly a second, add it.*

| Option | Establishes | 1st pick | 2nd pick | Changeability |
|---|---|---|---|---|
| It's dark. | light | 3 | 2 | protectAtPurchase |
| The street is too busy. | street | 3 | 2 | protectAtPurchase |
| There's nowhere I'd actually want to be outside. | outdoor | 3 | 2 | protectAtPurchase |
| I'm too far from the people I see constantly. | proximity | 3 | 2 | protectAtPurchase |
| There's no privacy. | privacy | 3 | 2 | protectAtPurchase |
| **Everything is a drive.** *(new)* | convenience | 3 | 2 | protectAtPurchase |
| The layout fights how I live. | layout | 3 | 2 | realProject |
| I'll outgrow it. | size | 3 | 2 | realProject |
| None of these automatically kill it. | — | — | — | — |

### Recommendation: **allow two, and make the order count.**

The audit showed this is the strongest question in the test: eight of nine
options reach protect unaided. Capping it at one forces a buyer with two real
non-negotiables to discard one, and there is nowhere else in the instrument
that recovers it.

Three things make two picks safe:

1. **The second is explicitly optional and explicitly weaker.** 3 then 2. A
   buyer who only has one says one.
2. **Two picks are still ONE provenance source.** Both record `dealbreaker`.
   So this cannot manufacture "you kept coming back to it" — that still needs a
   second *question*. This is the rule from Phase 1 doing its job.
3. **The ordering is free evidence.** "Dark kills it, and the street is second"
   is a hierarchy the current instrument cannot express at all, and it feeds
   the tradeoff question at Q8.

**New agent action unlocked:** a two-dealbreaker buyer gets a brief that ranks
its own non-negotiables, which is the difference between "these five things
matter" and "this is the one that ends a viewing."

---

## Q3 — `daily` · primary + secondary + qualifier · weight 1

> Which of these would wear on you first?
> *Then: and second?*

| Option | Establishes | 1st | 2nd | Qualifier follows? |
|---|---|---|---|---|
| The main rooms don't work for how I cook, eat and have people over. | publicRooms | 3 | 2 | **yes** |
| There's nowhere to close a door. | separation | 3 | 2 | no |
| Stairs, levels, getting around it. | circulation | 3 | 2 | no |
| Nowhere for everyday life to go. | utility | 3 | 2 | **yes** |
| Cars, arriving, getting in and out. | parking | 3 | 2 | **yes** |
| Keeping the outside up. | upkeep 3, `operationalBurdenTolerance` −3 | 3 | 2 | **yes** |
| I'd want help thinking about this. | — | — | — | no |

### The qualifier tap — this is the fix for bundling

Immediately after the **primary** pick only, one more tap:

| Category | Qualifier options | Recorded as |
|---|---|---|
| Main rooms | Cooking · Having people over · Everyday eating | `publicRooms:cooking` etc. |
| Everyday life | Laundry · Storage and closets · Pantry and kitchen storage | `utility:storage` etc. |
| Cars | Parking on the property · A real garage · Charging · Getting in and out | `parking:charging` etc. |
| Keeping it up | A pool · Planting and garden · General maintenance | `upkeep:pool` etc. |

**A qualifier is not a new attribute and carries no extra weight.** It is a
precision tag on the same single signal. `utility` is still one attribute with
one source; we simply know it is storage rather than laundry.

This directly fixes the overclaim: **"bundled upkeep does not prove a pool is
unwanted."** Under this design, `upkeep:pool` licenses a statement about pools
and `upkeep:planting` does not. Nothing is inferred; the buyer said which.

**Why primary + secondary rather than choose-two:** identical breadth, plus an
order we can use, plus the qualifier lands on the thing that matters most
rather than on an arbitrary one of two equals.

---

## Q4 — `architecture` · **new** · weight 1 · choose 1

> Some houses have something of their own. Others are just well built. Which matters to you?

| Option | Establishes | Scale | Changeability |
|---|---|---|---|
| A lot. If the house has no point of view, I'm not interested. | character 3 | `architecturalRequirement` **+3** | protectAtPurchase |
| Some. I'd take well proportioned and plain, but I'd rather have both. | character 1 | +1 | protectAtPurchase |
| Not really. I care how it works, not what period it is. | — | 0 | — |
| I'd rather it be plain, so nothing fights what I bring to it. | — | **−3** | — |

**Two fixes here.**

1. The scale becomes **two-sided**. Today `architecturalRequirement` runs
   0 to 4, so "if the bones are right I can add the character" contributes +1
   and reads as *no architectural requirement at all*. A buyer can now say
   architecture actively does not matter.
2. **`character` is reclassified from `usuallyAdaptable` to
   `protectAtPurchase`.** This is a modelling error in the current system. You
   cannot add 1920s proportion or a real Spanish arcade to a house that lacks
   it. What *is* adaptable is the decorative layer, and that is the
   personalization scale, not an attribute. Today the result tells buyers that
   "only character could come later", which is backwards.

---

## Q5 — `personalization` · **new** · weight 1 · choose 1

> Once you're in, how much of the look do you want to be yours?

| Option | Scale | Also |
|---|---|---|
| All of it. Paint, paper, lighting, the lot. | `personalizationAppetite` **+3** | |
| Some. I'd change what bothers me and live with the rest. | +1 | |
| Not much. If it's done well I'd rather leave it alone. | **−2** | |
| I'd rather buy it finished and not think about it. | **−3** | `dayOneReadiness` +1 |

**Q4 and Q5 are independent by construction.** "The house must bring real
architecture" *and* "I'll paper every room" is one coherent person and is now
directly reachable in one pass. In the current instrument that combination
requires answering contradictorily and then being caught by the conflict
question, which is why it fires on **1.19%** of paths.

---

## Q6 — `project` · changed · weight 1 · choose 1

> Great house. Very 2007 kitchen.

| Option | Establishes | Scales | Band | Signals |
|---|---|---|---|---|
| Who cares. That's fixable. | — | reno +2 | **contained** | `willBuild` |
| Honestly I'd go further. Walls, an addition, whatever the house needs. | expansion 3 | reno +3, dayOne −2 | **major** | `willBuild` |
| Depends how much work we're talking about. | — | reno +1 | **undecided** → fires C1 | |
| I know myself. I'll never redo it. | kitchen 3 | reno −3 | **cosmetic only** | |
| No. I want to move in and be done. | kitchen 2, condition 3 | dayOne +3, reno −2 | **turnkey** | `wantsFinished` |

Five options now carry four named bands plus the undecided case. The "I'd go
further" option is what sources `expansion`, which currently has no source at
all and is tested vacuously in the live code.

---

## Q7 — `location` · unchanged · weight 1 · choose 1

> How much does the map actually move?

| Option | Posture | Interpretation rule |
|---|---|---|
| It doesn't. One area, and outside it doesn't work for my life. | `fixed` | Geography will not be the lever. Name a different one. **Does not license** speculation that the map is untested, or any claim about inventory |
| I have a strong preference, but the right house nearby would get a look. | `strongPreference` | **Geography is the lever, and it is the cheapest one available.** A materially better house just outside the line is worth presenting before any project inside it |
| There are a handful of areas that genuinely work. | `fewAreas` | Area *selection* is the lever. Choose the areas deliberately rather than drifting between them |
| The right property could move me. | `propertyLed` | The property spec is the whole filter. Geography follows it |

`strongPreference` gets an explicit rule for the first time. It was 8.85% of
all answer paths with no combination at all.

The optional free-text note stays exactly as it is: shown for `fixed` and
`strong`, **never reaches the model**, read only by Danielle.

---

## Q8 — `tradeoff` · **adaptive** · weight 1 · choose 1

> Two of these came up. If you had to pick one, which survives?
> **[A]** vs **[B]** vs *I'd keep looking.*

The pair is chosen from evidence already collected. Algorithm in section 7.

**Recording rules, unchanged from the approved model:**
- The winner gets a tradeoff win, sourced to `tradeoff`.
- **The loser receives no penalty. Ever.** It records that there is somewhere
  to compare real houses, nothing more.
- The answer establishes relative ordering **between those two things only**.
  It says nothing about anything else.
- "I'd keep looking" records `narrowCriteria` and establishes no ranking.

---

# 2. Conditional questions

## C1 — "depends on what?" · fires when Q6 = *depends*

> Depends on what, mostly?

| Option | Scales | Establishes | Band |
|---|---|---|---|
| The money. If the numbers work, I'd take on a lot. | reno +2 | `budgetLed` | major, budget-gated |
| The time. I can't live in a construction site. | reno +1 | `timeLed` | contained |
| The scale. Rooms, yes. Moving walls, no. | reno +1 | `scaleLimited` | contained |
| The house. For the right property I'd do a lot more. | reno +2, arch +1 | `propertyGated` | major, property-gated |

**Why this earns a slot.** "Depends" is currently the single largest source of
uncertainty in the model, and it drives the open question on **64%** of all
result paths. It is one question that turns the biggest unresolved bucket into
four operationally different buyers. A budget-gated renovator and a
time-limited renovator get different listings.

## C2 — contradiction clarification · fires on `wantsFinished` + `willBuild`

Unchanged in mechanism. It will fire far less often, because the commonest
false conflict in the current instrument — wanting architecture and wanting to
decorate reading as a contradiction — no longer exists once Q4 and Q5 are
separate.

---

# 3. Evidence and provenance map (proposed)

| Attribute | Class | Sources | n | Reaches protect | Repeatable |
|---|---|---|---|---|---|
| `light` | protectAtPurchase | dealbreaker | 1 | yes | via tradeoff only |
| `privacy` | protectAtPurchase | tuesday, dealbreaker | 2 | yes | **yes** |
| `outdoor` | protectAtPurchase | dealbreaker | 1 | yes | via tradeoff |
| `street` | protectAtPurchase | tuesday, dealbreaker | 2 | yes | **yes** |
| `proximity` | protectAtPurchase | tuesday, dealbreaker | 2 | yes | **yes** |
| `convenience` | protectAtPurchase | tuesday, **dealbreaker (new)** | 2 | **yes (was never)** | **yes** |
| `lot` | protectAtPurchase | tradeoff | 1 | via tradeoff | no |
| `character` | **protectAtPurchase (was adaptable)** | architecture | 1 | yes | via tradeoff |
| `layout` | realProject | dealbreaker | 1 | yes | via tradeoff |
| `size` | realProject | tuesday, dealbreaker | 2 | yes | **yes** |
| `separation` | realProject | tuesday, daily | 2 | yes | **yes** |
| `publicRooms` | realProject | daily | 1 | yes | via tradeoff |
| `kitchen` | realProject | project | 1 | yes | no |
| `condition` | realProject | project, personalization, clarify | 3 | yes | **yes** |
| `expansion` | verifyPerProperty | **project (new)** | 1 | yes | no |
| `circulation` | verifyPerProperty | daily | 1 | yes | no |
| `utility` + qualifier | verifyPerProperty | daily | 1 | yes | no |
| `parking` + qualifier | verifyPerProperty | daily | 1 | yes | no |
| `upkeep` + qualifier | verifyPerProperty | daily | 1 | yes | no |

**19 attributes, every one reachable.** Down from 22 with four dead.

### Removed from the scored model

| Attribute | Decision | Reasoning |
|---|---|---|
| `view` | **Remove** | No source, and it is largely carried by `lot` and `light`. Adding a question for it would cost a slot that the project bands need more. It can live in the free-text note |
| `ceilings` | **Remove** | Real, but it is a showing observation rather than a search filter. No listing filter uses it reliably |
| `finishes` | **Remove** | It duplicates `personalizationAppetite`. Having both means the same thing is modelled twice |
| `expansion` | **Keep, now sourced** | Genuinely decision-changing: it is the difference between "must already be big" and "could get there". Sourced from Q6 |
| `convenience` | **Keep, now sourced** | Given a full-strength second source in Q2. It either matters enough to filter or it should not be modelled; this makes it the former |

### The `usuallyAdaptable` class becomes empty

That is the correct outcome. Nothing in the scored model is genuinely
cosmetic, because the cosmetic layer is a scale. The consequence for the brief:
the "only X could come later" line disappears, and everything in the
non-negotiables list is something you buy. Simpler and true.

---

# 4. Revised combination matrix

The backbone is **map posture × project band**. Every cell has a rule; no
posture is a blind spot.

| | **turnkey** | **cosmetic only** | **contained** | **major** | **undecided** |
|---|---|---|---|---|---|
| **fixed** | Both standard levers closed. Name the weakest protected attribute as the third lever | Condition closed, map closed. The lever is tolerance for dated finishes | Condition is the lever, bounded by C1's limit | Condition is the lever, wide open | **The project decision is what unblocks this search.** Settle it before adding filters |
| **strongPreference** | The map is the only lever. Present outside the line deliberately, early | **The map is the lever.** A plainer finished house just outside beats a project inside | Two levers. Spend the map first | Two levers, both wide | Resolve the project first, then decide whether the map needs to move |
| **fewAreas** | Area selection is the lever. Rank the areas rather than drifting | Area selection, plus tolerance for dated | Area selection and condition | Widest practical search | Resolve the project; area selection follows |
| **propertyLed** | The house spec is the entire filter | House spec, cosmetic-tolerant | House spec, condition open | **Widest search in the model.** Only the site really filters | House spec, project open |

### Cross-cutting modifiers

These attach to any cell and are where most of the brief's specific value lives.

| Modifier | Trigger | What it licenses | What it does not |
|---|---|---|---|
| Pool is a negative | `upkeep` protected **and qualifier = pool** | "A pool is a cost for this buyer, not a feature" | Nothing about pools if the qualifier was planting or general |
| Garden is a negative | qualifier = planting | "Planted gardens are a standing job here" | Nothing about pools |
| Outdoor must be usable | `outdoor` protected + `upkeep` protected | "Usability over size" | Any claim about what typical listings offer |
| Architecture filter | arch ≥ high | Filter on bones; staging is not character | Anything about personalization |
| Cosmetic freedom | pers ≥ high | Dated finishes should not cost a viewing | That they will renovate |
| **Bones and layers** | arch high **and** pers high | "The house must arrive with architecture; the styling is yours." Directly reachable now | — |
| **Must arrive both** | arch high **and** pers low | The narrowest aesthetic brief in the model: characterful *and* finished | — |
| Layout eliminates | `layout` protected + reno < contained | Skip the floor-plan rescue | **Nothing at all if `layout` was never established** |
| Size is a start, not a floor | `size` protected + `expansion` established | "Must already be big" versus "could get there" is now an answered question | — |
| Light versus privacy | both protected | A genuine internal tension to raise before viewing | Which one wins, unless the tradeoff resolved it |
| Ranked dealbreakers | two picks at Q2 | "This is the harder of the two" | That the second is negotiable |
| Budget-gated project | C1 = the money | Renovation scope follows the numbers | Any actual budget figure unless the handoff supplied one |
| Time-gated project | C1 = the time | Contained projects only; occupied-during-works is a filter | That they lack budget |

---

# 5. The adaptive tradeoff, in plain English

**When it runs.** Last, after the map, so the map can be a candidate.

**Step 1 — build the pool.** Every attribute with direct evidence at or above
the protect threshold, plus two pseudo-candidates: **the map** (if `fixed` or
`strongPreference`) and **condition** (if the project band is turnkey or
cosmetic-only). Pseudo-candidates let us ask geography-versus-property and
finish-versus-property, which are the two most useful trades in a real search.

**Step 2 — keep only real tensions.** A pair is eligible only if it appears on
a fixed, hand-authored list of trades that genuinely compete. This list is
Danielle's professional knowledge written down once; it is **not** inferred,
and it is the only place the instrument encodes anything about how houses
actually trade off.

| Tension | Left | Right |
|---|---|---|
| Space vs place | size, separation, publicRooms | proximity, convenience, the map |
| Land vs finish | lot, outdoor | condition, kitchen |
| Character vs finish | character | condition, kitchen |
| Outdoor vs indoor | outdoor | size, publicRooms |
| Quiet vs access | privacy, street | proximity, convenience |
| Light vs privacy | light | privacy |
| Space vs finish | size | condition |
| Map vs property | the map | any protected property attribute |

**Step 3 — reject nonsensical pairs.** A pair is discarded if:
- either side is below protect level (never pair a certainty against a guess);
- both sides sit in the same cluster (size against separation reads as a trick
  question, and rightly);
- the two were already resolved against each other by an earlier answer;
- either side is a qualifier rather than an attribute.

**Step 4 — rank.** Among eligible pairs, choose the one with the highest
**joint strength**: the *lower* of the two directs, so we pair two strong
things rather than a strong thing against a medium one. Ties break on the
number of independent sources, then on the tension order in the table above,
then on a stable attribute order so the same answers always produce the same
question.

**Step 5 — fall back.** If no eligible pair exists, present the current fixed
pair, *a great lot and a dated house* versus *a beautiful renovation on a
compromised lot*. It needs no prior evidence and is universally legible. The
question always renders; only its content adapts.

**Step 6 — record.** Winner: a tradeoff win sourced to `tradeoff`, which makes
it the one mechanism by which a single-source attribute can become repeated.
Loser: a tradeoff loss, **no penalty**. The pair itself is stored so the brief
can say precisely which two things were weighed.

**Worked example.** A buyer protects `outdoor` (dealbreaker) and `publicRooms`
(daily primary) and answers `fewAreas`. Eligible: outdoor vs publicRooms
(outdoor-vs-indoor), outdoor vs condition (land-vs-finish, but condition is not
protected so it is discarded), map vs either (discarded, `fewAreas` is not a
pseudo-candidate). Winner by joint strength: **usable outdoor space vs interior
living space.** That is a question the current fixed instrument can never ask,
and the answer changes which houses get sent.

---

# 6. Clarification rules

| Rule | Detail |
|---|---|
| At most **one** clarification per result | C1 and C2 are mutually exclusive; C1 takes precedence |
| C1 fires only on Q6 = *depends* | Deterministic, not inferred |
| C2 fires only on `wantsFinished` + `willBuild` | Unchanged |
| A clarification may not introduce a new attribute above scrutinize | It resolves, it does not add priorities |
| An unanswered clarification is recorded as unresolved | It never defaults to a middle value |
| No clarification for a buyer with fewer than two protected attributes | They need houses, not more questions |

---

# 7. What moves to the optional handoff

**I agree with your instinct, and the reason is measurement, not length.**

Budget in the middle of a priorities quiz changes the answers. People rank
against what they think they can afford, which destroys exactly the thing the
test measures. Timeline does the same to project appetite: "I need to be in by
August" is a logistics fact that will masquerade as low renovation tolerance.
And the result page is shareable — price does not belong on a URL someone might
send to a friend.

So: shown **only** on the brief step, after the result, clearly optional.

| Field | Form | Scored? |
|---|---|---|
| Approximate range | Bands, never an exact figure | **Never.** Brief only |
| Timeline | Bands: now / a few months / this year / no rush | **Never.** Brief only |
| Areas already being considered | Free text | **Never scored, never matched.** Same rule as the existing map note |

**Fair housing.** The areas field is recorded verbatim for Danielle and is
scored, ranked and matched against nothing, exactly like the existing map note.
We continue to model the *strength* of a geographic constraint and never its
reason.

**Effect on the result:** none. These fields change the brief Danielle reads
and nothing the buyer sees.

---

# 8. The three layers, and what they forbid

Every statement in the brief must be labelled as one of:

| Layer | Definition | Status |
|---|---|---|
| **Buyer evidence** | What they told us, with provenance | Live |
| **Derived search strategy** | What Danielle concludes from combinations | Live |
| **Market knowledge** | External facts about inventory, pricing, what is typical | **Empty. There is no data source** |

**Until a market-data layer exists, no sentence may assert anything about
inventory, price patterns or what is typical.** Lines currently in the system
that violate this and must be removed:

- "Not much matches both at once."
- "The house that shows badly is usually the only way to get the rest of it."
- "Dated isn't broken … that's usually where the value is."
- "Finished and plain photographs badly and usually gets priced for it."
- "The turnkey stock in most LA pockets has the least usable outdoor space."

Each is plausible and none is evidenced. They read as expertise and are
actually guesses.

### Four more overclaims to fix in the logic, not the copy

1. **`map = fixed` does not license "the map has never been tested."** It
   licenses only: geography will not be the lever here. The current open
   question asserts an untested assumption about the buyer.
2. **An unset attribute licenses no advice about that attribute.** The current
   open question about outdoor upkeep fires *because* upkeep is unset. Silence
   is not a finding; it can be listed as not established, nothing more.
3. **A bundled answer licenses only what the qualifier says.** Solved
   structurally by the Q3 qualifier.
4. **An unestablished attribute cannot generate an insight.** The layout check
   currently fires from the project band alone. Every modifier must name the
   evidence that licenses it.

---

# 9. Five example paths

For each: what the buyer **said**, what the **combination** adds, and what
**Danielle does differently**. Nothing in the third row is derivable from any
single answer.

---

### Path A — architecture and layers, now reachable in one pass

*Q1 close · Q2 dark, then privacy · Q3 main rooms → hosting; second stairs · Q4 "a lot" · Q5 "all of it" · Q6 never redo · Q7 fewAreas · Q8 character vs condition → character*

| | |
|---|---|
| **Said** | Light kills it, privacy second. Hosting is the daily friction. The house needs its own character. All the styling is theirs. They'll never redo the kitchen. A handful of areas. Character beats finish. |
| **Combination** | Architecture is required **and** the cosmetic layer is theirs — reachable directly for the first time. Against that, the kitchen must already work. So: the house must arrive with its architecture and a working kitchen, and arrive undecorated. Light and privacy are both protected and pull against each other. |
| **Danielle does** | Filters on period and proportion, not on presentation. Sends the characterful house with a dated-but-sound kitchen and no styling. Skips the flipped house with a new kitchen and no point of view. Raises the light-versus-privacy tension before the first viewing, because the two are in conflict on most hillside lots. |

**Currently impossible.** Today Q4 and Q5 are one question, so "real character"
zeroes personalization. This buyer reads as someone who wants a finished house.

---

### Path B — storage, specifically

*Q1 errands · Q2 everything is a drive · Q3 everyday life → storage; second cars → charging · Q4 not really · Q5 some · Q6 move in and be done · Q7 fixed · Q8 convenience vs condition → convenience*

| | |
|---|---|
| **Said** | Errands matter, and "everything is a drive" kills it. **Storage** is the daily friction, not laundry. **Charging** is the second. Architecture doesn't matter. Wants it finished. One area. Convenience beats finish. |
| **Combination** | Convenience is confirmed twice and won a forced choice: it is the hardest criterion in the search, ahead of condition, despite them also wanting a finished house. The practical program is exact: closet and storage volume, and an EV charger or the capacity to add one. |
| **Danielle does** | Leads on walkable location, then finish. Checks storage volume and panel capacity in person, both invisible in listings. Skips the beautiful house that needs a car for everything. Does **not** mention laundry or pantry, because those were not what they picked. |

**Currently impossible.** Today this buyer gets "Laundry, storage and pantry"
and "Parking, garage and charging" — two bundles, four wrong implications, and
a brief that can't tell her to check the electrical panel.

---

### Path C — strong preference plus turnkey, the blind spot

*Q1 quiet · Q2 no privacy · Q3 nowhere to close a door; second main rooms → everyday eating · Q4 plain please · Q5 not much · Q6 move in and be done · Q7 strongPreference · Q8 map vs condition → condition*

| | |
|---|---|
| **Said** | Privacy kills it, confirmed twice. Needs a door to close. Wants plain and finished. Strong area preference. **Finish beats the map.** |
| **Combination** | They said the map has give and then confirmed it by choosing finish over geography when forced. So geography is not just the available lever, it is the one they have already agreed to spend. Privacy is the single hardest criterion and cannot be created. |
| **Danielle does** | Presents finished houses outside the usual line **first**, not apologetically. Screens hard on privacy geometry before condition. Skips the project inside the area, which is what most agents would default to showing. |

**Currently impossible.** `strongPreference` matches no combination rule, and
the fixed lot-versus-condition trade could never have asked map versus finish.

---

### Path D — "depends" resolved two ways

Identical through Q5. Both: *Q2 I'll outgrow it · Q3 main rooms → cooking · Q6 depends · Q7 fixed*

| | **D1 — C1 "the money"** | **D2 — C1 "the time"** |
|---|---|---|
| **Said** | Scope follows the numbers | Can't live in a construction site |
| **Combination** | Inside a fixed map, condition is the lever, and its limit is budget. A larger project is available if the maths works. | Inside a fixed map, condition is the lever but it is capped by disruption, not cost. Occupied-during-works becomes a filter. |
| **Danielle does** | Sends the underpriced house needing real work. Frames the conversation as scope against price. | Sends the cosmetically dated but structurally finished house. Screens out anything needing a permit timeline. Never sends the gut job. |

**Currently impossible.** Both are one "depends", one band, one identical
brief — and this is **64%** of the open questions the system produces.

---

### Path E — a pair the fixed question could never ask

*Q1 room · Q2 nowhere to be outside · Q3 main rooms → having people over; second keeping it up → planting · Q4 some · Q5 all of it · Q6 fixable · Q7 propertyLed · Q8 **outdoor vs interior space** → outdoor*

| | |
|---|---|
| **Said** | Outdoor space kills it. Hosting is the friction, **planting** is the second. Will decorate, will renovate, property-led. Outdoor beats interior space. |
| **Combination** | They host, they want outdoor space, and they do not want a garden to maintain. Outdoor beat interior space in a forced choice, so on a constrained site the outdoor room wins and the interior gives. Renovation tolerance is high, so a poor interior plan is recoverable and a poor outdoor relationship is not. |
| **Danielle does** | Filters on the indoor-outdoor relationship and on flat usable outdoor space, ahead of square footage. Treats heavy planting as a cost. Sends the compromised interior on the right site. **Says nothing about pools** — they chose planting, not pool. |

**Currently impossible.** The fixed trade asks lot versus condition, which this
buyer would answer without revealing the thing that actually drives their
search.

---

# 10. Honest costs of this proposal

1. **Taps go up.** Q2 and Q3 can each take two taps, Q3 a third for the
   qualifier. Worst case is 8 questions and 12 taps against today's 7 and 8. It
   is still a quiz, not a form, but it is not free.
2. **The tradeoff question is the hardest thing here to build.** The
   adjacency list is judgement encoded as data and will need your review.
3. **Existing result URLs break.** The answer codec changes shape. Old links
   should degrade to a partial result rather than an error, which is how the
   decoder already behaves.
4. **`light`, `outdoor`, `layout`, `character` and `publicRooms` still have one
   source each**, and can only become repeated by winning the tradeoff. That is
   a deliberate trade for keeping the test to eight questions. If you want more
   of them confirmable, the honest price is a ninth question, and my
   recommendation is not to pay it.
