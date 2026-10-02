# The Tuesday Test: model audit

An audit of what the test currently asks, what each answer establishes, what
combinations are reachable, and where the model is weaker than the copy makes
it look. **No code was changed to produce this.** Numbers come from reading the
source and from enumerating the full answer space (345,600 reachable paths,
including the conditional clarification branch).

Files audited: `lib/tuesday/questions.ts`, `model.ts`, `score.ts`, `read.ts`,
`interpret.ts`, `showing.ts`.

---

## The short version

The test asks seven questions and models twenty-two attributes. That ratio is
the root of most of what follows.

- **Four attributes can never be established at all.** `view`, `ceilings`,
  `expansion` and `finishes` have no source question. They are permanently
  unknown, they appear in every buyer's "not established" list, and
  `showing.ts` holds checks for them that can never fire.
- **One attribute can never become a priority.** `convenience` maxes out at
  1.5 against a protect threshold of 3.
- **Thirteen of twenty-two attributes can never be "repeated"**, because only
  one question can produce them. The provenance gate built last week is
  structurally unreachable for them, and on 52.5% of paths nothing at all is
  repeatable.
- **One question carries five concepts.** `daily` is the sole source of
  `publicRooms`, `circulation`, `utility`, `parking` and `upkeep`, and it is
  choose-two-of-nine.
- **A whole map posture has no interpretation.** `strongPreference` matches
  neither `mapTight` nor `mapOpen`, so 8.85% of all answer paths produce no
  combination, no headline and a degraded hero.
- **The agent read has eight distinct first paragraphs**, three of which cover
  74% of buyers. "Figure this out next" is the same question 64% of the time.
- **There is no price and no timeline in the model.** Every real lever
  conversation in a search is ultimately about one of those two.

The engine is sound. The instrument feeding it is too small.

---

# PART 1 — Every question, every option

`Provenance ID` is the question id recorded against the evidence. Two picks
inside one multi-select record the same id once, which is why `daily` can never
produce a repeated attribute on its own.

## Q1 `tuesday` — weight 0.5, choose 1

> It is 7:14 p.m. on a Tuesday. What do you most want your home to make easier?

| Option | Exact wording | Attributes (weighted) | Evidence type | Strength | Independent or bundled | Changeability | Can reach | Legitimately infers | Cannot infer |
|---|---|---|---|---|---|---|---|---|---|
| `errands` | Getting dinner, errands, and the rest of life done without making it a project. | convenience 1.5 | ordinary-life direction | weak, half weight | single concept | protectAtPurchase | scrutinize only | daily logistics colour this search | that convenience is a filter; it cannot reach protect |
| `room` | Having enough room to work, rest, host people, and occasionally avoid everyone. | size 1.0, separation 1.0 | ordinary-life direction | weak, half weight | **bundled: two attributes from one click** | realProject | scrutinize; protect only with a second source | space and separation are in play | which of the two they meant |
| `close` | Being close to the places and people that make Los Angeles worth living in. | proximity 1.5 | ordinary-life direction | weak | single concept | protectAtPurchase | scrutinize; protect with Q2 `far` | proximity matters | how far is too far |
| `quiet` | Closing the door and not hearing everyone else's life through the walls. | privacy 1.5, street 0.5 | ordinary-life direction | weak | **bundled, asymmetric** | protectAtPurchase | scrutinize; protect with Q2 | quiet matters | whether it is neighbours, the street, or the walls |

**Note.** Q1 is documented as "context, not a verdict", but it is the *only*
second source for `privacy`, `proximity`, `size` and `separation`. It is
load-bearing for the recurrence gate despite being described as decorative.

## Q2 `dealbreaker` — weight 1, choose 1

> You love the house. Which one still kills it?

| Option | Attributes | Evidence type | Strength | Changeability | Legitimately infers | Cannot infer |
|---|---|---|---|---|---|---|
| `dark` | light 3 | **explicit dealbreaker** | protect on its own | protectAtPurchase | light is an elimination criterion | the threshold, or which rooms |
| `street` | street 3 | explicit dealbreaker | protect alone | protectAtPurchase | traffic or noise eliminates | which one of the two |
| `outside` | outdoor 3 | explicit dealbreaker | protect alone | protectAtPurchase | usable outdoor space is required | size, type, or whether a balcony counts |
| `far` | proximity 3 | explicit dealbreaker | protect alone | protectAtPurchase | distance from people eliminates | who, or how far. **Deliberately not asked** (fair housing) |
| `privacy` | privacy 3 | explicit dealbreaker | protect alone | protectAtPurchase | privacy is an elimination criterion | from neighbours, street or sightlines |
| `layout` | layout 3 | explicit dealbreaker | protect alone | realProject | floor plan eliminates | which layout problem |
| `outgrow` | size 3 | explicit dealbreaker | protect alone | realProject | size eliminates | whether they mean today's size or future size |
| `none` | *(nothing)* | refusal | none | n/a | they decline to name an absolute | **nothing.** Records an answered question with zero evidence |

**Note.** This is the strongest single question in the test: seven of eight
options reach protect unaided. It is also single-choice, so a buyer with two
genuine dealbreakers can only record one.

## Q3 `daily` — weight 1, **choose 2 of 9**

> Which part of a house is most likely to become a daily frustration if it does not work for you?

| Option | Attributes | Scales | Bundled | Changeability | Legitimately infers | Cannot infer |
|---|---|---|---|---|---|---|
| `dark` | light 3 | | single | protectAtPurchase | light is a lived frustration | (with Q2 `dark`, the only repeatable light path) |
| `outdoor` | outdoor 3 | | single | protectAtPurchase | outdoor access is a lived frustration | |
| `public` | publicRooms 3 | | single | realProject | living/cooking/hosting space must work | **sole source** |
| `separation` | separation 3 | | single | realProject | a door to close is required | |
| `stairs` | circulation 3 | | single | verifyPerProperty | stairs and circulation matter | single-storey vs better circulation |
| `utility` | utility 3 | | **bundled: laundry + storage + pantry** | verifyPerProperty | one of these three creates friction | **which one.** Sole source |
| `upkeep` | upkeep 3 | operationalBurdenTolerance −3 | **bundled: pool + landscape + maintenance** | verifyPerProperty | property maintenance is a burden | which of the three. **Sole source, and the only option in the entire test that moves this scale** |
| `parking` | parking 3 | | **bundled: parking + garage + driveway + charging** | verifyPerProperty | vehicle logistics matter | which one. Sole source |
| `unsure` | *(nothing)* | | | n/a | they want help here | **nothing.** Silence, not flexibility |

**Note.** Five modeled concepts compete for two slots. Not choosing `upkeep`
is silence, not tolerance, which is why the scale reads `unset` rather than
high.

## Q4 `inherit` — weight 1, choose 1 — the only tradeoff

> Which would you rather inherit?

| Option | Attributes | Tradeoff | Scales | Signals | Legitimately infers | Cannot infer |
|---|---|---|---|---|---|---|
| `lot` | lot 3 | lot **beats** condition, kitchen | reno +2, dayOne −1 | `willBuild` | land beats finish in a forced choice | that condition is unimportant; the losers take no penalty |
| `renovation` | condition 3 | condition **beats** lot | reno −2, dayOne +2 | | finish beats land in a forced choice | that the lot doesn't matter |
| `both` | *(nothing)* | | | | `narrowCriteria`: they refused the trade | any ranking at all |

**Note.** `inherit` is the sole source of `lot`, and `lot` receives direct
evidence *and* a tradeoff win from the same click. That double-count used to
inflate confidence; it is now collapsed by provenance.

## Q5 `whitehouse` — weight 1, choose 1

> You walk into a beautifully proportioned house that is almost entirely white. Your first thought is…

| Option | Attributes | Scales | Legitimately infers | Cannot infer |
|---|---|---|---|---|
| `mine` | | personalization +3 | they will supply the cosmetic layer | anything about construction appetite |
| `bones` | layout 1 | personalization +2, architecture +1 | they will layer if the plan works | **architecture +1 normalises to 0.25 to 0.33, which reads as "no"** |
| `personality` | character 3 | architecture +3 | the house must bring its own character | that they will not also layer. **Sets personalization to zero** |
| `finished` | condition 2 | dayOne +3, personalization −2 | they want it done | how much work counts as "another project" |

**Note.** This question is doing three jobs at once (personalization,
architecture, day-one readiness) and they are mutually exclusive at the answer
level. `character` and high `personalization` cannot both be established here,
which is why the "bones then layers" combination fires on only **1.19%** of
paths and only via the clarification branch.

## Q6 `kitchen` — weight 1, choose 1

> Great house. Very 2007 kitchen.

| Option | Attributes | Scales | Signals | Legitimately infers | Cannot infer |
|---|---|---|---|---|---|
| `fixable` | | reno +3 | `willBuild` | real work is on the table | budget, timeline, or scale |
| `depends` | | reno +1 | | conditional appetite | **the condition it depends on.** This is the single largest source of "unresolved" in the model |
| `never` | kitchen 3 | reno −3 | | the kitchen must already work | that they would not do other work |
| `done` | kitchen 2, condition 3 | dayOne +3, reno −2 | `wantsFinished` | move-in condition is required | how finished |

## Q7 `location` — weight 1, choose 1 — no attributes, no scales

> How much does the map actually move?

| Option | Map constraint | Legitimately infers | Cannot infer |
|---|---|---|---|
| `fixed` | `fixed` | one area, hard boundary | **the reason. Deliberately never asked** |
| `strong` | `strongPreference` | a real preference with give | how much give |
| `few` | `fewAreas` | several areas work | which ones |
| `property` | `propertyLed` | the house can move the map | that geography is irrelevant |

The optional free-text `MAP_NOTE` is shown for `fixed` and `strong` and
**never reaches the model**, by design: constraint strength is modeled, the
reason is not, because reasons are protected-class adjacent.

## Q8 `clarify` — conditional, fires on 18.8% of base paths

Shown only when `wantsFinished` **and** `willBuild` are both present.

| Option | Attributes | Scales |
|---|---|---|
| `cosmetic` | | personalization +3, reno −3 |
| `exceptional` | | reno +1, architecture +1 |
| `major` | | reno +3, dayOne −2 |
| `finished` | condition 2 | dayOne +3, reno −2 |

---

# PART 2 — What each question is actually for

| Q | Job in one sentence | Verdict |
|---|---|---|
| `tuesday` | Establishes ordinary-life context and weak directional preference; should not create a requirement alone. | **Mislabelled.** It is the only second source for four attributes, so it is quietly load-bearing. |
| `dealbreaker` | Records one explicit elimination criterion at full strength. | Working, but single-choice caps it at one. |
| `daily` | Surfaces lived friction that does not show in photographs. | **Overloaded.** Five sole-source concepts, two slots. |
| `inherit` | Forces one relative ranking between land and finish. | Working. The only tradeoff in the test. |
| `whitehouse` | Separates "I will decorate" from "the house must bring character". | **Conflated.** Also carries day-one readiness, and its options are mutually exclusive in a way the model is not. |
| `kitchen` | Establishes renovation tolerance against a concrete, recognisable case. | Working, but `depends` produces most of the model's uncertainty. |
| `location` | Records map constraint strength without recording its reason. | Working, and correctly restrained. |
| `clarify` | Resolves one named contradiction. | Working, but only detects one kind. |

### Questions doing the same job
- `tuesday` and `dealbreaker` overlap on `privacy`, `proximity`, `size`. That
  overlap is not redundancy: it is the *only* mechanism that produces a
  repeated attribute. It should be intentional rather than incidental.
- `inherit`, `whitehouse` and `kitchen` all move `renovationTolerance` and
  `dayOneReadiness`. Three questions, one axis, no explicit budget.

### Concepts asked only once
`publicRooms`, `kitchen`, `character`, `lot`, `circulation`, `utility`,
`parking`, `upkeep`, `convenience`. None can ever be confirmed twice.

### Concepts never asked
`view`, `ceilings`, `expansion`, `finishes`, **price**, **timeline**,
**who lives there / how the house is used** (deliberately constrained),
**stairs as accessibility rather than annoyance**.

---

# PART 3 — Attribute provenance map

Derived mechanically from `QUESTIONS`. "Max single" is the largest weighted
value one answer can contribute; protect threshold is **3**.

| Attribute | Changeability | Source questions | n | Max single | Protect alone? | Repeatable? |
|---|---|---|---|---|---|---|
| `light` | protectAtPurchase | dealbreaker, daily | 2 | 3 | yes | **yes** |
| `privacy` | protectAtPurchase | tuesday, dealbreaker | 2 | 3 | yes | **yes** |
| `outdoor` | protectAtPurchase | dealbreaker, daily | 2 | 3 | yes | **yes** |
| `street` | protectAtPurchase | tuesday, dealbreaker | 2 | 3 | yes | **yes** |
| `proximity` | protectAtPurchase | tuesday, dealbreaker | 2 | 3 | yes | **yes** |
| `layout` | realProject | dealbreaker, whitehouse | 2 | 3 | yes | **yes** |
| `size` | realProject | tuesday, dealbreaker | 2 | 3 | yes | **yes** |
| `separation` | realProject | tuesday, daily | 2 | 3 | yes | **yes** |
| `condition` | realProject | inherit, whitehouse, kitchen, clarify | 4 | 3 | yes | **yes, up to 3 sources** |
| `lot` | protectAtPurchase | inherit | 1 | 3 | yes | no |
| `publicRooms` | realProject | daily | 1 | 3 | yes | no |
| `kitchen` | realProject | kitchen | 1 | 3 | yes | no |
| `circulation` | verifyPerProperty | daily | 1 | 3 | yes | no |
| `utility` | verifyPerProperty | daily | 1 | 3 | yes | no |
| `parking` | verifyPerProperty | daily | 1 | 3 | yes | no |
| `upkeep` | verifyPerProperty | daily | 1 | 3 | yes | no |
| `character` | usuallyAdaptable | whitehouse | 1 | 3 | yes | no |
| `convenience` | protectAtPurchase | tuesday | 1 | **1.5** | **never** | no |
| `view` | protectAtPurchase | — | **0** | 0 | **never** | never |
| `ceilings` | realProject | — | **0** | 0 | **never** | never |
| `expansion` | verifyPerProperty | — | **0** | 0 | **never** | never |
| `finishes` | usuallyAdaptable | — | **0** | 0 | **never** | never |

### Reading the evidence

| Evidence pattern | What it licenses | What it does not |
|---|---|---|
| **One direct source** | "You flagged X." "X is on the list." It can filter inventory. | "You kept coming back to X." Any claim of emphasis. |
| **Two distinct question sources** | "You kept coming back to X." Confidence `moderate`. | Still not a measure of intensity, only of consistency. |
| **Three sources** (`condition` only) | Confidence `strong`. The one attribute that can be triple-confirmed. | |
| **Tradeoff win, no direct** | "X came out on top when you had to choose." | That it is a requirement. It beat one named thing, once. |
| **Tradeoff loss** | "There may be room here. Worth testing against real houses." | That it is unimportant. **No penalty is applied, ever.** |
| **Direct + win from the same question** | One interaction. `inherit.lot` and `inherit.renovation` both do this. | Two confirmations. This was the confidence-inflation bug. |
| **Conflicting sources** | Not currently possible: no option carries negative attribute weight, by design. | |
| **No source** | "This test didn't establish it." | "You have flexibility here." Silence is not permission. |

**The consequence of the table above:** on **52.5%** of answer paths, *no*
attribute is repeatable, so the recurrence language can never be used, and the
result must lead on something other than emphasis.

---

# PART 4 & 5 — Combination matrix, with the "so what"

Reachability percentages are of all 345,600 enumerated paths. Except where
noted, the figure is the share of paths where that combination **leads** the
read, not where it merely fires.

| # | Combination | Required evidence | Guards / exclusions | What it means | Search consequence | What Danielle does | What not to claim | **So what (that one answer could not tell her)** | Reach |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Fixed map + low renovation** | `map=fixed`, reno ≤ LOW or dayOne ≥ HIGH | — | Both usual levers are closed | A third lever has to be named explicitly | Identify the weakest protected preference and flex that | That inventory is impossible, or that either will bend | The buyer thinks they made two independent choices; together they eliminate every standard compromise, so the search needs a *named* third give | 3.26% |
| 2 | **Fixed map + high renovation** | `map=fixed`, reno ≥ HIGH | — | Geography closed, condition open | Condition does the flexing | Send the houses that show badly inside the line | That they will take on anything | Inside a closed map, ugly is the only currency left | 8.00% |
| 3 | **Fixed map + conditional renovation** | `map=fixed`, reno mid | Must not assert appetite | The lever exists but is undecided | Settle appetite before adding filters | Put them in one imperfect house inside the area | That condition is the lever | The unresolved question is not a gap in the quiz, it is the single decision that unblocks a closed search | 8.00% |
| 4 | **Strong-preference map + low renovation** | `map=strongPreference`, reno ≤ LOW | — | Geography is the more plausible lever | Spend the map first | Show a materially better house just outside the line before accepting a project inside it | That they will move areas | They said "strong preference" about geography and "never" about work; only one of those two has give, and it is not the one they think | 9.00% |
| 5 | **Open map + high specificity** | `map` open, ≥3 protected hard attributes | — | The house is the constraint, not the map | Search several areas deliberately | Do not loosen property criteria to stay in one neighbourhood | That geography is irrelevant | The flexibility they volunteered is in the place, not the house, which is the opposite of how most searches are run | 14.79% |
| 6 | **High personalization + low renovation** | pers ≥ HIGH, reno ≤ LOW | — | Cosmetic yes, construction no | Blandness stops being a filter; function starts | Send plain finished houses; skip pretty houses with bad plans | That they will "fix it up" | Do not pay a premium for finishes this buyer plans to replace — and do not discount a house for lacking them | 13.31% |
| 7 | **High character + high personalization** | character protected or arch ≥ HIGH, pers ≥ HIGH | **Only reachable via `clarify`** | Architecture must arrive; layers get added | A blank new build is not a blank slate | Filter on architecture, not on styling | That staging is character | Cosmetic neutrality alone does not make a useful blank slate for this buyer | **1.19%** |
| 8 | **Outdoor protected + low upkeep tolerance** | `outdoor` protected, upkeep scale ≤ LOW | Requires `daily.upkeep` explicitly | Wants outdoor life, not grounds | Usability, not acreage | Ask what it takes to keep; a pool may be a negative | That they want a big yard | A pool can be a *minus* for a buyer whose outdoor space is a priority — no single answer says that | 2.53% |
| 9 | **Space + function + high renovation** | ≥2 spatial protected, reno ≥ HIGH | — | Requirements firm, route to them open | Separate "must already exist" from "could be created" | Test whether space means square footage or potential | That a small house is fine | The same protected attribute points at two different market segments depending on the second answer | (in 11.66%) |
| 10 | **Space + function + low renovation** | ≥2 spatial protected, reno < HIGH | — | Requirements firm, no route to them | Eliminate on layout and size early | Skip the floor-plan rescue immediately | That they would extend | Bad layout should eliminate *faster* for this buyer than for anyone else | 1.58% |
| 11 | **Everything protected** | ≥5 protected hard attributes | — | No ranking exists yet | Ranking, not more filtering | Show a few very different houses | That they must give up two | Six requirements may narrow enormously; the problem is order, not count | 4.62% |
| 12 | **Logistics-led, low specificity** | ≥2 operational protected, ≤2 hard protected | — | The practical side is the filter | It cannot be searched for, only inspected | Move it to the showing list | That the house is unimportant | The things that will decide this purchase are invisible in every listing | 7.74% |
| 13 | **Refused the trade + low specificity** | `inherit.both`, ≤3 protected | — | Nothing has been ranked | Exposure before filtering | Three deliberately different houses | That they are indecisive | A refusal to rank is data: it means the ranking has to happen in person | (in 11.45%) |
| 14 | **Unresolved conflict** | `wantsFinished` + `willBuild` | Clarification unanswered | Two stated positions collide | Resolve before anything else | Ask the one question | That either position is the real one | The buyer does not know they said both | 18.8% of base paths |
| 15 | **Strong-preference map, no other rule firing** | `map=strongPreference` | — | — | — | — | — | **No map rule exists for this posture.** `narrowByDesign` needs `fixed`, `mapRoomPropertyNot` needs `fewAreas`/`propertyLed`. A strong-preference buyer is only covered if some *non-map* rule happens to fire; where none does, they get no combination and no headline. | **8.85% of all paths** |

## Combinations that *should* exist and do not

| Missing combination | Why it matters | Blocked by |
|---|---|---|
| Strong-preference map + any property profile | The most common real posture in LA; 8.85% of paths get no read | `narrowByDesign` requires `mapTight`, `mapRoomPropertyNot` requires `mapOpen` |
| Character required + will not renovate | "I want personality" + "I want it finished" is a real and common tension | Conflict detector only watches `wantsFinished` × `willBuild` |
| Dealbreaker + the same thing traded away | Buyer contradicts themselves across Q2 and Q4 | Not detected |
| Any price or timeline interaction | The actual lever in every real search | Not modeled at all |
| Separation protected + size not protected | "I need a door, not square footage" is a distinct and useful brief | Both live in the spatial cluster and get merged |

---

# PART 6 — What a real search brief contains

Proposed information architecture. Each block states its evidence bar, so
nothing renders on thin evidence.

| Block | Contains | Evidence bar | Omitted when |
|---|---|---|---|
| **The search in one sentence** | A synthesis of the map posture and the project posture, as one search description | Map established **and** one project band resolved | Either is unset |
| **Non-negotiables** | Only attributes strong enough to actually filter inventory | `protect` state, i.e. direct ≥ 3 | Always shown if any exist |
| **Search levers** | What can move when a house cannot satisfy everything, ranked | Named explicitly: map posture, cosmetic finish, condition, a weak protected attribute | No lever exists → say so, do not invent one |
| **Do not substitute** | Listing substitutions to reject: large yard ≠ usable outdoor space; staged personality ≠ architecture; square footage ≠ functional space; newly renovated ≠ good layout; pool ≠ outdoor life | The corresponding attribute is protected | The attribute was never established |
| **Worth a second look** | Listing types this buyer will reject too fast | Personalization high, renovation high, or a permanent thing lost a tradeoff | No evidence of flexibility. **Never invented** |
| **Probably not worth the time** | Listing types that conflict with strong evidence | A protected attribute the buyer cannot or will not change | No protected attribute |
| **At the showing** | What to test in person, tied to the synthesis | Derived from combinations first, protected attributes second | Never empty; falls back to exposure checks |
| **The tradeoff I expect** | The specific tension these answers will produce in a real house | Two protected attributes that pull against each other, or a protected attribute against the project posture | No tension exists |
| **Still unresolved** | One or two things that would materially change the search | Ranked by leverage, not by count | Nothing material is open |
| **Practical property program** | Work/guest separation, storage, laundry, pantry, parking, access, outdoor usability, stairs. Factual and compact | Any operational attribute with evidence | None established |
| **Map posture** | How geography should function during the search, not just its label | Map established | Never asked |
| **Project posture** | Three separate lines: cosmetic personalization, medium projects, major renovation | Each band resolved independently; `unset` prints as "not established" | — |

**The consumer page and the agent brief are different documents.** The page is
Danielle's read plus the buyer's own result. The brief is the operational
record she works from. Only the brief carries the practical program in full.

---

# PART 7 — Operational brief families

Derived from the enumeration, not invented. These are families of *search*,
not of person.

| Family | Trigger | What makes the search different | Lever | Bad compromise | Worth seeing | Worth skipping | Showing priority | Likely unresolved | Reach |
|---|---|---|---|---|---|---|---|---|---|
| **A. Closed map, finished house** | `fixed` + dayOne high or reno low | Both standard levers closed | A named weak preference | Widening the map quietly | Plain finished houses inside the line | Anything needing work | Dated vs broken | Whether the map was ever tested | 3.3% |
| **B. Closed map, will build** | `fixed` + reno high | Condition is the only currency | Condition | A compromised lot to get a finished house | Houses that show badly | Bad site, any finish | What the work actually costs here | Scope and budget | 8.0% |
| **C. Closed map, undecided project** | `fixed` + reno conditional | The search is blocked on one decision | The project decision itself | Adding filters before deciding | One imperfect house, deliberately | Nothing yet | Whether they would take this on | Renovation appetite | 8.0% |
| **D. Semi-open map, cosmetic only** | `strongPreference`/`fewAreas` + pers high + reno low | Geography is the plausible lever | The map | A project house to stay in the area | Plain, finished, just outside | Pretty houses with bad plans | What is dated vs what is broken | How far outside is acceptable | 13.3% |
| **E. Open map, strict property** | `fewAreas`/`propertyLed` + ≥3 protected | Several deliberate areas, fixed house spec | Area selection | Loosening the house to stay put | Right house, unfamiliar area | Right area, wrong house | The protected attributes, in person | Which areas actually work | 14.8% |
| **F. Property-first renovator** | reno high + site or spatial protected | Condition does no filtering | Condition and area | A compromised site for a finished house | Ugly houses on good sites | Beautiful houses on bad sites | The site, before the house | Whether space must exist already | 11.7% |
| **G. Outdoor-led, low burden** | `outdoor` protected + upkeep low | Usability filter, not size filter | Outdoor scale | A large yard read as outdoor life | Small usable outdoor space | Pools and planted grounds | Who maintains it, and how long | Whether they want any grounds | 2.5% |
| **H. Architecture-led** | `character` protected or arch high | Filters on bones, not styling | Styling | Staged character | Unfashionable but well built | New builds with good finishes | Architecture vs staging | Whether they will also layer | 1.2% |
| **I. Function-led turnkey** | ≥2 spatial protected + reno low | Layout eliminates fast | Cosmetic finish | Assuming a plan can be fixed | Awkward-looking, well-planned | Renovated with a bad plan | Walk it the way they live | How much space is enough | 1.6% |
| **J. Logistics-led** | ≥2 operational protected, ≤2 hard | Cannot be searched for, only inspected | Most property criteria | Filtering on features | Anything meeting the few hard criteria | Nothing on paper | The practical program, in person | Almost everything | 7.7% |
| **K. Needs exposure** | ≤1 protected, or refused the trade | No filter exists yet | Everything | Building a search on nothing | Three deliberately different houses | Nothing | What they notice first | What they would trade | 0.9% |

**Family E is the largest and family D the second largest.** The combination
layer has no rule keyed to `strongPreference`, so half of family D is covered
only incidentally, by rules that happen to fire on the project axis.

---

# PART 8 — Composition, not templates

A brief is assembled, never selected:

```
base family (map posture x project posture)
  + the specific protected attributes, named
  + map posture, as behaviour rather than a label
  + project posture, three separate bands
  + operational flags, factual and compact
  + exactly one expected tradeoff, if two protected things genuinely pull
  + at most one unresolved question, ranked by leverage
  + "do not substitute" lines, only for protected attributes
```

Two buyers in family E, one protecting light and the lot and one protecting
size and separation, get the same *posture* and completely different briefs:
different non-negotiables, different substitutions to refuse, different
showing checks, different expected tradeoff.

---

# PART 9 — The no-shit-sherlock test, applied

Run against what the system currently outputs.

| Current output | Could the buyer write it from memory? | Actionable for Danielle? | Verdict |
|---|---|---|---|
| "Protect these: outdoor space, the kitchen, laundry" | **Yes** | Yes, as a filter | Keep, as the factual record only. Not analysis |
| "Your map: strong preference, not a hard boundary" | **Yes** | Yes | Factual record |
| "Cosmetic changes: Yes / Major renovation: Not really" | **Yes** | Yes | Factual record |
| "You kept coming back to X" | Yes, and often **false** | No | Removed. Now gated on provenance |
| "I'd use the map as the flexible part, not condition" | **No** | Yes | Analysis. Keep |
| "Don't let a pool stand in for somewhere you'd sit on a Tuesday" | **No** | Yes | Analysis. Keep |
| "I'd distrust the square footage number" | **No** | Yes | Analysis. Keep |
| "Not established: view, ceiling height, room to add on, finishes" | No | **No** — these can never be established | **Remove.** Noise in every brief |
| "How much work would you really take on" | No | Yes | Keep, but it is 64% of all briefs |
| "Worth testing against real houses: the lot itself" | No | Marginally | Keep in the brief, not the page |

---

# Contradictions and weak spots

Ordered by how much they cost.

1. **`strongPreference` has no combination rule.** 8.85% of all answer paths
   produce no headline and a fallback hero. The largest single defect.
2. **Four attributes are unreachable.** `view`, `ceilings`, `expansion`,
   `finishes` have no source. They pad every "not established" list and
   `showing.ts` carries dead checks for them.
3. **`convenience` cannot reach protect.** Max 1.5 against a threshold of 3,
   and `tuesday` is its only source.
4. **The `expansion` guard in `figureOutNext` is vacuous.** It tests
   `unknownIds.has('expansion')`, which is always true.
5. **`daily` is a five-concept bottleneck** with two slots, and is the sole
   source of every operational attribute.
6. **Character and personalization are mutually exclusive at the answer
   level**, so the combination that needs both fires on 1.19% of paths and only
   through the conflict branch.
7. **`architecturalRequirement` is one-sided and `bones` under-registers.**
   "If the bones are right, I can add the character" contributes +1 of a
   possible 3 to 4 and reads as *no architectural requirement*.
8. **`dayOneReadiness` needs two questions to cross HIGH.** A single "I want it
   finished" normalises to about 0.43 and reads as conditional.
9. **The conflict detector watches one pattern only.** `wantsFinished` ×
   `willBuild`. It misses character-without-renovation and
   dealbreaker-versus-tradeoff contradictions.
10. **Output diversity is thin where it matters.** Eight distinct hero first
    paragraphs across 345,600 paths, three covering 74%. One open question
    covering 64%.
11. **Two questions resolve the whole project axis** (`kitchen`, `inherit`) and
    `kitchen.depends` is the largest single source of model uncertainty.
12. **No price. No timeline.** Every lever conversation in a real search ends
    at one of those, and neither exists in the model. This is the largest
    product gap, and it is a question-set problem rather than an engine one.

---

# Five sample briefs

Assembled by hand from the proposed architecture, using real scored evidence.
Every conclusion carries its trace. These are specimens for approval, not
generated output.

---

## Sample A — closed map, finished house (family A)

**Answers:** errands / layout / public + separation / renovation / finished / done / fixed

**THE SEARCH IN ONE SENTENCE**
One area, and a house that already works when you walk in.
> *Evidence: `map=fixed`; `dayOneReadiness=1.00` (whitehouse.finished +3, kitchen.done +3, inherit.renovation +2); `renovationTolerance=0.10`.*

**NON-NEGOTIABLES**
Move-in condition · The layout · Somewhere to close a door · Living space that works for how you cook and host
> *Evidence: condition direct 8 from three questions (**repeated**, strong); layout 3 from `dealbreaker`; separation 3 and publicRooms 3 from `daily`.*

**SEARCH LEVERS**
Not the map, and not condition. The one that can move is the kitchen.
> *Evidence: kitchen direct 2 → `scrutinize`, not protect. It is the only named criterion below the protect line and it is a realProject, so it is the cheapest give. Everything else protected is either the map or day-one condition.*

**DO NOT SUBSTITUTE**
Newly renovated ≠ good layout. Square footage ≠ functional space.
> *Evidence: layout protected via an outright dealbreaker AND condition protected. This buyer will be shown renovated houses with bad plans and is at real risk of accepting one.*

**PROBABLY NOT WORTH THE TIME**
Anything needing work before move-in. Any house whose main living space does not work for how they cook and host.
> *Evidence: `renovationTolerance=0.10`; publicRooms protected and classed realProject.*

**AT THE SHOWING**
Separate what is dated from what is broken. Walk it the way they would live in it, not the way it is staged. Find the door they would close.
> *Evidence: condition, layout, separation.*

**THE TRADEOFF I EXPECT**
Condition versus layout, inside one area. The renovated houses in a fixed map are the ones whose plans were compromised to renovate them.
> *Evidence: both protected, both realProject, map fixed. Neither can give without contradicting a protect-level answer.*

**STILL UNRESOLVED**
Whether the map has ever actually been tested.
> *Evidence: `map=fixed` with specificity 4. The map is doing most of the filtering and was never challenged.*

**PRACTICAL PROGRAM** Separation required (a door to close). Nothing else established.
**MAP POSTURE** Closed. Do not present outside it without saying so explicitly.
**PROJECT POSTURE** Cosmetic: not established (0.00, `unset`). Medium: no. Major: no.

---

## Sample B — property-first renovator (family F)

**Answers:** room / outgrow / separation + stairs / lot / personality / fixable / property

**THE SEARCH IN ONE SENTENCE**
The house and the land have to be right; the finish does not.
> *Evidence: `renovationTolerance=1.00`; `map=propertyLed`; lot, size, separation all protected.*

**NON-NEGOTIABLES**
Enough square footage **(confirmed twice)** · Somewhere to close a door **(confirmed twice)** · The lot itself · Stairs and circulation · Character on arrival
> *Evidence: size direct 4 from `tuesday` + `dealbreaker` → **repeated**; separation direct 4 from `tuesday` + `daily` → **repeated**; lot 3 from `inherit` plus a tradeoff win over condition and kitchen; circulation 3 from `daily`; character 3 from `whitehouse`.*

**SEARCH LEVERS**
Condition, and area. Both are genuinely open.
> *Evidence: reno 1.00; map `propertyLed`; condition and kitchen both `flexibilityToTest` after losing the `inherit` trade.*

**DO NOT SUBSTITUTE**
Square footage ≠ functional space. Staged personality ≠ architecture.
> *Evidence: size repeated, and `architecturalRequirement=1.00` from `whitehouse.personality`.*

**WORTH A SECOND LOOK**
Houses that show badly. Dated is not broken, and this buyer said the work is fine.
> *Evidence: reno 1.00, condition not protected.*

**PROBABLY NOT WORTH THE TIME**
A compromised lot, whatever the finish.
> *Evidence: lot protected AND won the only forced trade in the test.*

**AT THE SHOWING**
Walk the property line first. Do the stairs twice, carrying something. Decide whether the character is in the house or in the staging.
> *Evidence: lot, circulation, character.*

**THE TRADEOFF I EXPECT**
Square footage versus the lot. On a good site the existing house is usually smaller than they want, and they have protected both.
> *Evidence: size repeated (realProject) and lot protected (protectAtPurchase). High renovation tolerance makes this resolvable rather than fatal, which is the point.*

**STILL UNRESOLVED**
Whether the house has to be big already, or could get there.
> *Evidence: size protected, reno 1.00. Those two point at different listings and nothing in the test separates them.*

**PRACTICAL PROGRAM** A door to close. Stairs and circulation matter. Storage, parking, upkeep not established.
**MAP POSTURE** Open. Lead with the property; the area follows.
**PROJECT POSTURE** Cosmetic: conditional (0.40). Medium: yes. Major: yes.

---

## Sample C — strong-preference decorator (family D — **the blind spot**)

**Answers:** quiet / outside / utility + parking / renovation / mine / never / strong

**THE SEARCH IN ONE SENTENCE**
A house that already works, in roughly one part of town, that they will style themselves.
> *Evidence: `map=strongPreference`; `personalizationAppetite=1.00`; `renovationTolerance=0.00`.*

**NON-NEGOTIABLES**
Move-in condition · Outdoor space they would actually use · A kitchen they do not have to redo · Laundry, storage and pantry · Parking, garage and charging
> *Evidence: each from exactly one question. condition from `inherit` (direct 3 + a tradeoff win from the **same** click, which is one interaction); outdoor from `dealbreaker`; kitchen from `kitchen`; utility and parking from `daily`, and both are bundled labels from single clicks.*
> **Nothing here is repeated. No recurrence language is permitted for this buyer.**

**SEARCH LEVERS**
The map. It is the only thing with give.
> *Evidence: reno 0.00 and condition protected close the project lever entirely. `strongPreference` is the only posture in the answers that admits movement.*

**DO NOT SUBSTITUTE**
Large yard ≠ usable outdoor space. Newly renovated ≠ good layout.
> *Evidence: outdoor protected via an outright dealbreaker, and layout never established, so a renovated house with a bad plan would pass every filter they have given us.*

**WORTH A SECOND LOOK**
A house with the right space and layout that is cosmetically boring.
> *Evidence: personalization 1.00. Blandness should not cost a viewing.*

**PROBABLY NOT WORTH THE TIME**
Anything needing real work first.
> *Evidence: reno 0.00, kitchen protected, condition protected.*

**AT THE SHOWING**
Whether they could live with this kitchen forever. Where the bags, coats, laundry and pantry actually go. The driveway and the street, not the garage count.
> *Evidence: kitchen, utility, parking.*

**THE TRADEOFF I EXPECT**
Finished condition versus usable outdoor space, inside a tight-ish map. The turnkey stock in most LA pockets has the least usable outdoor space.
> *Evidence: condition protected and outdoor protected, both at protect level, reno 0.00 so neither can be created.*

**STILL UNRESOLVED**
Whether they want outdoor space or a yard to look after.
> *Evidence: `operationalBurdenTolerance` is **unset** — `daily.upkeep` was not chosen, and it is the only option in the test that moves that scale. Silence, not tolerance.*

**PRACTICAL PROGRAM** Laundry, storage and pantry — one bundled signal, not three findings. Parking, garage, driveway or charging — likewise. Privacy and street noise flagged weakly from Q1.
**MAP POSTURE** Semi-open. This is the lever; use it before anything else.
**PROJECT POSTURE** Cosmetic: yes (1.00). Medium: no. Major: no.

> **Audit note, corrected.** This buyer *does* get a rule:
> `decorateNotRenovate`, on personalization and renovation. What has no rule is
> the **map half** of the read. Change one answer so personalization is not
> high (`whitehouse.personality` instead of `mine`) and the same buyer produces
> **no combination at all**. So the lever advice above is generated today only
> because the hero's lever function handles `strongPreference` directly; the
> combination layer that supplies the headline does not.

---

## Sample D — outdoor-led, low burden (family G)

**Answers:** close / outside / outdoor + upkeep / lot / bones / depends / few

**THE SEARCH IN ONE SENTENCE**
Outdoor life on a good lot, across a few areas, with the work still an open question.
> *Evidence: outdoor direct 6 from two questions; lot 3; `map=fewAreas`; reno 0.80.*

**NON-NEGOTIABLES**
Outdoor space they would actually use **(confirmed twice)** · The lot itself · How much property there is to look after
> *Evidence: outdoor from `dealbreaker` AND `daily` → **repeated**, confidence moderate. This is the one buyer of the five where "you kept coming back to this" is true.*

**SEARCH LEVERS**
Condition, and which of the few areas.
> *Evidence: reno 0.80; condition and kitchen both `flexibilityToTest` after losing the `inherit` trade.*

**DO NOT SUBSTITUTE**
Pool ≠ outdoor lifestyle. Large yard ≠ usable outdoor space.
> *Evidence: outdoor protected twice AND `operationalBurdenTolerance=0.00` from `daily.upkeep`. This is the only pattern in the model where a pool is a **negative**.*

**WORTH A SECOND LOOK**
Houses that show badly on a good lot.
> *Evidence: reno 0.80, lot protected, condition unprotected.*

**PROBABLY NOT WORTH THE TIME**
Grounds. Anything whose outdoor space is impressive to look at and a job to keep.
> *Evidence: upkeep protected AND the burden scale at floor.*

**AT THE SHOWING**
Ask who looks after the outside and how long it takes. Walk the property line. Sit in the outdoor space rather than looking at it.
> *Evidence: upkeep, lot, outdoor.*

**THE TRADEOFF I EXPECT**
A good lot usually means more to maintain. They protected both the lot and the absence of maintenance.
> *Evidence: lot protected, upkeep protected, burden scale at 0.00. This is a genuine internal tension and the most useful thing in this brief.*

**STILL UNRESOLVED**
How much work they would really take on.
> *Evidence: `kitchen.depends` only, reno reads 0.80 but from a single soft signal plus the `inherit` trade.*

**PRACTICAL PROGRAM** Low maintenance is a requirement, not a preference. Proximity flagged weakly from Q1. Layout flagged weakly from `whitehouse.bones`.
**MAP POSTURE** Several areas. Choose them deliberately; do not drift.
**PROJECT POSTURE** Cosmetic: yes (0.80). Medium: yes. Major: yes, with the lot as the reason.

---

## Sample E — needs exposure (family K)

**Answers:** errands / none / unsure / both / bones / depends / strong

**THE SEARCH IN ONE SENTENCE**
There is not enough here to search on yet.
> *Evidence: specificity 0. No attribute reached protect. `dealbreaker.none` and `daily.unsure` both record an answered question with zero evidence, and `inherit.both` refuses the only ranking in the test.*

**NON-NEGOTIABLES**
None established.
> *Evidence: highest direct value in the entire result is 1.5 (`convenience`, from the half-weighted Q1), against a protect threshold of 3.*

**SEARCH LEVERS**
Everything, which is the problem rather than the answer.

**WORTH A SECOND LOOK**
A house with the right space and layout that is cosmetically boring.
> *Evidence: `personalizationAppetite=0.80` from `whitehouse.bones`. The only usable signal in the whole result.*

**AT THE SHOWING**
Name the one thing in this house they would not accept. Walk it once without talking, then say what they noticed first.
> *Evidence: none, deliberately. These are exposure checks, not criteria checks.*

**STILL UNRESOLVED**
What they would actually trade. They declined the only forced choice.
> *Evidence: `narrowCriteria` tension from `inherit.both`.*

**PRACTICAL PROGRAM** Nothing established. Twenty of twenty-two attributes are unknown.
**MAP POSTURE** Semi-open, and untested.
**PROJECT POSTURE** Cosmetic: yes (0.80). Medium: conditional (0.60). Major: conditional.

> **Audit note.** This brief is short because the evidence is thin, and that is
> correct behaviour. The failure mode to avoid is padding it to look like the
> others.
