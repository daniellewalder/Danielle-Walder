# The Danielle-facing buyer brief

What sits behind Copy my brief and Send Danielle my brief. Two renderings of
one `StructuredBrief`, nothing wired to the UI, no mailto.

Code: `lib/tuesday/v2/render/`. `phrases.ts` holds every word the brief can
say; `compose.ts` decides what to say; `index.ts` serializes the two
renderings. Tests: `render.test.ts`.

**Nothing in the frozen layers changed.** The renderer reads `StructuredBrief`
and nothing else: no answers, no scores, no bands.

## How it is built

One composition, two serializations. `compose()` decides everything once and
each line carries both registers, so the agent brief and the buyer copy cannot
drift into disagreeing about what this search is. The buyer copy is a shorter
selection of the same lines in the first person, never a second reading.

All copy lives in `phrases.ts`, keyed by the engine's own ids. Three
consequences worth stating:

- Changing the voice never means touching a frozen layer.
- A new engine id shows up as a **missing phrase**, which a test fails on,
  rather than as prose that silently disappeared.
- A phrase nothing can reach is **dead copy**, which a second test fails on.
  Both tests sweep a broad slice of the answer space rather than trusting the
  fixtures.

The result URL is a parameter the caller supplies. Nothing here guesses a
hostname.

## The two dedup rules that do the real work

**Filter on these takes the criteria a search can filter on. Practical program
takes the ones it cannot.** The split is `changeability` from the contract: a
`verifyPerProperty` attribute like pantry function cannot eliminate inventory,
so it is a requirement to carry to the house, not a search field. That is what
stops "pantry" appearing under both headings.

**Probably not worth the time carries kinds of house, not criteria.** Where a
skip would only restate something already in the filter list, it is dropped. An
allowlist of six ids survives anyway, because "anything under the target size"
is an instruction about listings while "enough space" is a search field.

# The fifteen fixtures
## 1. fixed map + low renovation + closed lever
`turnkey`

**Structured input**

```
map fixed · project turnkey · personalization prefersItLeftAlone
lever closed (closedByExplicitConstraints) · sizeRoute n/a
protect      condition, layout, publicRooms
levers       none
skipFaster   reject.condition, reject.layout, reject.publicRooms
secondLook   none
showingTests none
doNotSub     none
unresolved   whatWouldGive
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
There is no soft give here. I would not loosen one on paper just to get more listings on the page. Fewer, better showings.

FILTER ON THESE
- Move-in condition
- A layout that works as built
- Living space that works for how they cook and host

NO OBVIOUS LEVER
- The map does not move, renovation is out and the rest are outright dealbreakers.

STILL TO SETTLE
- What they would give on when a house makes them choose. Nothing has settled it yet.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
There is no soft give on my list. I'd rather see fewer houses than loosen one of these to pad the list.

Has to have
- Move-in condition
- A layout that works as built
- Living space that works for how I cook and host

Where I do not have room
- The map does not move, I'm not renovating and the rest are my dealbreakers.

One thing I have not settled
- What I'd give on when a house makes me choose.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- Use this as the flex: the buyer closed every route
- Lever not established yet: the routes were measured and closed
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: every skip repeated a criterion already in the filter list (reject.condition, reject.layout, reject.publicRooms)
- At the showing: nothing needs checking in person that is specific to this buyer
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 2. strong-preference map + low renovation + high personalization
`t1_strongMapLowRenoCosmetic`

**Structured input**

```
map strongPreference · project cosmeticOnly · personalization wantsToMakeItTheirs
lever identified · sizeRoute n/a
protect      light, publicRooms, kitchen
levers       1. cosmeticFinish  2. geography
skipFaster   reject.kitchen, reject.publicRooms
secondLook   secondLook.cosmeticallyPlain
showingTests none
doNotSub     none
unresolved   whatWouldGive
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The finish has room in it. A renovation does not. I would look at plain houses before asking them to take on a renovation. The map is the second thing to try, not the first.

FILTER ON THESE
- Real natural light
- Living space that works for how they cook and host
- A kitchen they don't have to redo

USE THIS AS THE FLEX
- The finish. Paint, paper and lighting are theirs to change anyway.
- Widen the area before you widen anything about the house.

WORTH A SECOND LOOK
- Plain inside but right everywhere else. They're repainting regardless.

STILL TO SETTLE
- What they would give on when a house makes them choose. Nothing has settled it yet.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The finish has room in it. A renovation doesn't. I'd rather look at plain houses than take on a renovation. After that, the map.

Has to have
- Real natural light
- Living space that works for how I cook and host
- A kitchen I don't have to redo

Where I have room
- The finish. Paint, paper and lighting I'll change anyway.
- The area. I have more room on where than on what.

One thing I have not settled
- What I'd give on when a house makes me choose.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Probably not worth the time: every skip repeated a criterion already in the filter list (reject.kitchen, reject.publicRooms)
- At the showing: nothing needs checking in person that is specific to this buyer
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 3. property-led major renovator
`structuralBuilder`

**Structured input**

```
map propertyLed · project major · personalization someChanges
lever identified · sizeRoute n/a
protect      separation, size, site:land
levers       1. condition  2. sizeRoute
skipFaster   none
secondLook   none
showingTests inspect.expansionFeasibility, inspect.separation.correctable, inspect.siteFit~land
doNotSub     none
unresolved   mustSpaceExistAlready
program      site:land
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
A renovation has room in it. The finish does not. I would look at houses that need work before offering a plain house as the compromise. How the space gets there is the second thing to try, not the first.

FILTER ON THESE
- Somewhere to close a door
- Enough space
- The land itself, slope and usable ground

USE THIS AS THE FLEX
- A house that needs work is fair game. The work is on the table.
- How the space gets there, not how much of it there is. The amount stays fixed.

AT THE SHOWING
- Walk the lot. Slope, shape, and which parts are actually usable.
- If it is small, find out what adding on would actually involve here.
- Could a door go in where they need one, or is it open by construction?

STILL TO SETTLE
- Whether the space has to exist now or could be created. It decides what even counts as a candidate.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
A renovation has room in it. The finish doesn't. I'd rather look at houses that need work than settle for a plain house. After that, how the space gets there.

Has to have
- Somewhere to close a door
- Enough space
- The land itself, slope and usable ground

Where I have room
- A house that needs work is fine by me.
- How I get the space, not how much of it I need.

Worth checking when we see something
- Walk the lot. Slope, shape, and what I could actually use.
- If it is small, find out what adding on would involve.
- Could a door go in where I need one?

One thing I have not settled
- Whether the space has to be there already, or could be added.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: nothing is firm enough to eliminate listings on
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 4. outdoor + pool upkeep concern
`t3_outdoorPoolConcern`

**Structured input**

```
map fewAreas · project undecided · personalization notEstablished
lever identified · sizeRoute n/a
protect      outdoor, upkeep:pool
levers       1. geography
skipFaster   reject.upkeep.pool
secondLook   none
showingTests inspect.outdoorUsability, inspect.upkeep~pool
doNotSub     outdoor/largeYard
unresolved   renovationAppetite
program      upkeep:pool
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The map is the thing with room in it. Nothing else they named has give in it, so I would widen the map rather than soften one of the rest.

FILTER ON THESE
- Outdoor space they'd actually use

USE THIS AS THE FLEX
- Widen the area before you widen anything about the house.

PROBABLY NOT WORTH THE TIME
- Houses with a pool to look after.

AT THE SHOWING
- Sit outside. Is there somewhere they'd actually use, or just square footage?
- Find out what the pool actually costs to run before anyone falls in love with it.

DO NOT SUBSTITUTE
- A big yard is not usable outdoor space. Square footage outside is not the same as somewhere to sit.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. They want the outside and they do not want to look after it. Watch which way they lean when a real house makes them pick.

STILL TO SETTLE
- How much work they would really take on. It changes what is worth showing.

PRACTICAL PROGRAM
- Pool upkeep

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The map is where I have room. Nothing else on my list has give in it, so I'd rather widen the map than soften one of the rest.

Has to have
- Outdoor space I'd actually use

Where I have room
- The area. I have more room on where than on what.

Worth checking when we see something
- Sit outside. Is there somewhere I'd actually use, or just square footage?
- Find out what the pool really costs to run.

One thing I have not settled
- How much work I'd really take on.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Needs clarification: the test and the search facts do not contradict each other

## 5. outdoor + planting upkeep concern
`t4_outdoorPlantingConcern`

**Structured input**

```
map fewAreas · project undecided · personalization notEstablished
lever identified · sizeRoute n/a
protect      outdoor, upkeep:planting
levers       1. geography
skipFaster   reject.upkeep.planting
secondLook   none
showingTests inspect.outdoorUsability, inspect.upkeep~planting
doNotSub     outdoor/largeYard
unresolved   renovationAppetite
program      upkeep:planting
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The map is the thing with room in it. Nothing else they named has give in it, so I would widen the map rather than soften one of the rest.

FILTER ON THESE
- Outdoor space they'd actually use

USE THIS AS THE FLEX
- Widen the area before you widen anything about the house.

PROBABLY NOT WORTH THE TIME
- Properties with planting that needs managing.

AT THE SHOWING
- Sit outside. Is there somewhere they'd actually use, or just square footage?
- Ask what the planting needs. Who cuts it, and how often.

DO NOT SUBSTITUTE
- A big yard is not usable outdoor space. Square footage outside is not the same as somewhere to sit.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. They want the outside and they do not want to look after it. Watch which way they lean when a real house makes them pick.

STILL TO SETTLE
- How much work they would really take on. It changes what is worth showing.

PRACTICAL PROGRAM
- Planting and landscape upkeep

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The map is where I have room. Nothing else on my list has give in it, so I'd rather widen the map than soften one of the rest.

Has to have
- Outdoor space I'd actually use

Where I have room
- The area. I have more room on where than on what.

Worth checking when we see something
- Sit outside. Is there somewhere I'd actually use, or just square footage?
- Ask what the planting needs, and who cuts it.

One thing I have not settled
- How much work I'd really take on.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Needs clarification: the test and the search facts do not contradict each other

## 6. architecture high + personalization high
`t7_characterAndPersonalization`

**Structured input**

```
map fewAreas · project major · personalization wantsToMakeItTheirs
lever identified · sizeRoute n/a
protect      light, architecturalCharacter
levers       1. cosmeticFinish  2. condition  3. geography
skipFaster   reject.lacksArchitecturalCharacter
secondLook   secondLook.architecturalButUnstyled, secondLook.datedButSound
showingTests inspect.characterIsStructural
doNotSub     architecturalCharacter/staging
unresolved   none
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The finish is the thing with room in it. A renovation is the second thing to try, not the first. The character has to arrive with the house. The finish does not.

FILTER ON THESE
- Real natural light
- Architectural character

USE THIS AS THE FLEX
- The finish. Paint, paper and lighting are theirs to change anyway.
- A house that needs work is fair game. The work is on the table.

WORTH A SECOND LOOK
- Good bones, bad styling. The architecture is what has to be there.
- Dated, as long as the plan and the site are good. That part is fixable.

PROBABLY NOT WORTH THE TIME
- Houses with no architectural character. Staging will not supply it.

AT THE SHOWING
- Check the character is in the building, not in the furniture.

DO NOT SUBSTITUTE
- Staging is not character. If it would leave with the furniture, it does not count.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The finish is where I have room. After that, a renovation. The character has to come with the house. The finish I can do.

Has to have
- Real natural light
- Architectural character

Where I have room
- The finish. Paint, paper and lighting I'll change anyway.
- A house that needs work is fine by me.

Worth checking when we see something
- Check the character is in the building, not the furniture.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 7. size protected + existingOnly
`r1_sizeExistingOnly`

**Structured input**

```
map fewAreas · project major · personalization someChanges
lever identified · sizeRoute existingOnly
protect      size
levers       1. condition  2. geography
skipFaster   reject.undersized
secondLook   none
showingTests none
doNotSub     none
unresolved   none
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
A renovation has room in it. How the space gets there does not. I would look at houses that need work before assuming the space can be created later. The map is the second thing to try, not the first. Do not keep a small house in play hoping it can grow. That route is closed.

FILTER ON THESE
- Enough space

USE THIS AS THE FLEX
- A house that needs work is fair game. The work is on the table.
- Widen the area before you widen anything about the house.

PROBABLY NOT WORTH THE TIME
- Anything under the target size. It has to be there on day one.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
A renovation has room in it. How the space gets there doesn't. I'd rather look at houses that need work than assume I can add the space later. After that, the map. Don't keep a small house in play hoping it can grow.

Has to have
- Enough space

Where I have room
- A house that needs work is fine by me.
- The area. I have more room on where than on what.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- At the showing: nothing needs checking in person that is specific to this buyer
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 8. size protected + additionOkay
`r2_sizeAdditionOkay`

**Structured input**

```
map fewAreas · project major · personalization someChanges
lever identified · sizeRoute additionOkay
protect      size
levers       1. condition  2. geography  3. sizeRoute
skipFaster   none
secondLook   secondLook.smallerWithPotential
showingTests inspect.expansionFeasibility
doNotSub     none
unresolved   none
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
A renovation has room in it. The finish does not. I would look at houses that need work before offering a plain house as the compromise. The map is the second thing to try, not the first. A smaller house can work, but only where adding on is actually possible here.

FILTER ON THESE
- Enough space

USE THIS AS THE FLEX
- A house that needs work is fair game. The work is on the table.
- Widen the area before you widen anything about the house.

WORTH A SECOND LOOK
- Smaller than the target, where adding on looks genuinely possible.

AT THE SHOWING
- If it is small, find out what adding on would actually involve here.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
A renovation has room in it. The finish doesn't. I'd rather look at houses that need work than settle for a plain house. After that, the map. A smaller house can work if adding on is actually possible.

Has to have
- Enough space

Where I have room
- A house that needs work is fine by me.
- The area. I have more room on where than on what.

Worth checking when we see something
- If it is small, find out what adding on would involve.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Probably not worth the time: nothing is firm enough to eliminate listings on
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 9. size protected + reconfigureOkay
`r3_sizeReconfigureOkay`

**Structured input**

```
map fewAreas · project major · personalization someChanges
lever identified · sizeRoute reconfigureOkay
protect      size
levers       1. condition  2. geography  3. sizeRoute
skipFaster   none
secondLook   secondLook.badlyArrangedNotSmall
showingTests inspect.areaCanBeRearranged
doNotSub     none
unresolved   none
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
A renovation has room in it. The finish does not. I would look at houses that need work before offering a plain house as the compromise. The map is the second thing to try, not the first. The area may well be enough. The plan is the thing that has to change.

FILTER ON THESE
- Enough space

USE THIS AS THE FLEX
- A house that needs work is fair game. The work is on the table.
- Widen the area before you widen anything about the house.

WORTH A SECOND LOOK
- Badly arranged rather than actually too small. The area may be fine once the plan changes.

AT THE SHOWING
- Where are the walls that matter? Work out whether the plan can change without an addition.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
A renovation has room in it. The finish doesn't. I'd rather look at houses that need work than settle for a plain house. After that, the map. The area is probably enough. The plan is the problem.

Has to have
- Enough space

Where I have room
- A house that needs work is fine by me.
- The area. I have more room on where than on what.

Worth checking when we see something
- Can the plan change without adding on?

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Probably not worth the time: nothing is firm enough to eliminate listings on
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 10. size protected + propertySpecific
`r4_sizePropertySpecific`

**Structured input**

```
map fewAreas · project major · personalization someChanges
lever identified · sizeRoute propertySpecific
protect      size
levers       1. condition  2. geography  3. sizeRoute
skipFaster   none
secondLook   none
showingTests inspect.sizeSolvableHere
doNotSub     none
unresolved   none
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
A renovation has room in it. The finish does not. I would look at houses that need work before offering a plain house as the compromise. The map is the second thing to try, not the first. The size question gets answered in the house, not on the listing.

FILTER ON THESE
- Enough space

USE THIS AS THE FLEX
- A house that needs work is fair game. The work is on the table.
- Widen the area before you widen anything about the house.

AT THE SHOWING
- Decide the size question in the house, not on the listing.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
A renovation has room in it. The finish doesn't. I'd rather look at houses that need work than settle for a plain house. After that, the map. I'd answer the size question in the house, not on the listing.

Has to have
- Enough space

Where I have room
- A house that needs work is fine by me.
- The area. I have more room on where than on what.

Worth checking when we see something
- I'd want to decide the size question in the house, not on the listing.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: nothing is firm enough to eliminate listings on
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 11. pantry-specific practical need
`t6_pantryQualifier`

**Structured input**

```
map strongPreference · project turnkey · personalization notEstablished
lever identified · sizeRoute n/a
protect      layout, utility:pantry, kitchen
levers       1. geography
skipFaster   reject.kitchen, reject.layout
secondLook   none
showingTests inspect.utility~pantry
doNotSub     none
unresolved   none
program      utility:pantry
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The map has room in it. A renovation does not. I would widen the map before asking them to take on a renovation. Nothing else they named has give in it, so I would widen the map rather than soften one of the rest.

FILTER ON THESE
- A layout that works as built
- A kitchen they don't have to redo

USE THIS AS THE FLEX
- Widen the area before you widen anything about the house.

AT THE SHOWING
- Where does the pantry overflow go? Look for the second place to put things.

PRACTICAL PROGRAM
- A pantry that works

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The map has room in it. A renovation doesn't. I'd rather widen the map than take on a renovation. Nothing else on my list has give in it, so I'd rather widen the map than soften one of the rest.

Has to have
- A layout that works as built
- A kitchen I don't have to redo

Where I have room
- The area. I have more room on where than on what.

Worth checking when we see something
- Where does the pantry overflow go?

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: every skip repeated a criterion already in the filter list (reject.kitchen, reject.layout)
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Needs clarification: the test and the search facts do not contradict each other

## 12. EV-specific practical need
`t5_evQualifier`

**Structured input**

```
map fixed · project turnkey · personalization notEstablished
lever notEstablished (noSecondaryPreferenceEstablished) · sizeRoute n/a
protect      convenience, parking:charging, condition
levers       none
skipFaster   reject.condition
secondLook   none
showingTests inspect.parking~charging
doNotSub     none
unresolved   none
program      parking:charging
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
Nothing softer than the hard constraints has come out yet, so there is no give to name. That is a gap in what we asked, not a buyer digging in. I would ask before narrowing anything.

FILTER ON THESE
- Everyday convenience
- Move-in condition

LEVER NOT ESTABLISHED YET
- The personalization question was never answered, so finish could not be weighed.

AT THE SHOWING
- Check whether a charger can actually go in. Panel, run, and where the car sits.

PRACTICAL PROGRAM
- EV charging

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
I haven't worked out what I'd give on yet. Worth asking me before we narrow anything.

Has to have
- Everyday convenience
- Move-in condition

Still working out
- The personalization question was never answered, so finish could not be weighed.

Worth checking when we see something
- Check whether a charger can actually go in.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- Use this as the flex: no lever was established
- No obvious lever: this is our gap, not the buyer being inflexible
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: every skip repeated a criterion already in the filter list (reject.condition)
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Still to settle: nothing open would materially change the search
- Needs clarification: the test and the search facts do not contradict each other

## 13. low-information buyer
`lowInformation`

**Structured input**

```
map strongPreference · project undecided · personalization someChanges
lever identified · sizeRoute n/a
protect      none
levers       1. geography
skipFaster   none
secondLook   none
showingTests inspect.firstRejection
doNotSub     none
unresolved   firstFilter
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The map has room in it. The finish does not. I would widen the map before offering a plain house as the compromise. Nothing else they named has give in it, so I would widen the map rather than soften one of the rest. There is nothing narrow enough to search on yet. The showings are the instrument.

USE THIS AS THE FLEX
- Widen the area before you widen anything about the house.

AT THE SHOWING
- Take them to two or three very different houses and watch what they rule out.

STILL TO SETTLE
- What the first real filter is. Nothing narrow enough has come out yet.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The map has room in it. The finish doesn't. I'd rather widen the map than settle for a plain house. Nothing else on my list has give in it, so I'd rather widen the map than soften one of the rest. I don't have a filter yet. Seeing houses is how I get one.

Where I have room
- The area. I have more room on where than on what.

Worth checking when we see something
- Show me a few very different houses. I'll learn what I don't want faster that way.

One thing I have not settled
- What my first real filter is.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- Search facts: no handoff was supplied
- Filter on these: nothing reached protect level that a search can filter on
- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play
- Probably not worth the time: nothing is firm enough to eliminate listings on
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other

## 14. explicit discrepancy
`t3_outdoorPoolConcern` + `D_poolDiscrepancy`

**Structured input**

```
map fewAreas · project undecided · personalization notEstablished
lever identified · sizeRoute n/a
protect      outdoor, upkeep:pool
levers       1. geography
skipFaster   reject.upkeep.pool
secondLook   none
showingTests inspect.outdoorUsability, inspect.upkeep~pool
doNotSub     outdoor/largeYard
unresolved   renovationAppetite
program      upkeep:pool
discrepancy  structuredConflict
```

**Agent brief**

```
SEARCH SNAPSHOT
The map is the thing with room in it. Nothing else they named has give in it, so I would widen the map rather than soften one of the rest.

SEARCH FACTS
Minimum bedrooms: 4
Pool: required

FILTER ON THESE
- Outdoor space they'd actually use

USE THIS AS THE FLEX
- Widen the area before you widen anything about the house.

PROBABLY NOT WORTH THE TIME
- Houses with a pool to look after.

AT THE SHOWING
- Sit outside. Is there somewhere they'd actually use, or just square footage?
- Find out what the pool actually costs to run before anyone falls in love with it.

DO NOT SUBSTITUTE
- A big yard is not usable outdoor space. Square footage outside is not the same as somewhere to sit.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. They want the outside and they do not want to look after it. Watch which way they lean when a real house makes them pick.

STILL TO SETTLE
- How much work they would really take on. It changes what is worth showing.

PRACTICAL PROGRAM
- Pool upkeep

NEEDS CLARIFICATION
- The test has pool upkeep down as a burden. The search facts say a pool is required. Worth one question.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The map is where I have room. Nothing else on my list has give in it, so I'd rather widen the map than soften one of the rest.

What I am looking for
Minimum bedrooms: 4
Pool: required

Has to have
- Outdoor space I'd actually use

Where I have room
- The area. I have more room on where than on what.

Worth checking when we see something
- Sit outside. Is there somewhere I'd actually use, or just square footage?
- Find out what the pool really costs to run.

One thing I have not settled
- How much work I'd really take on.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Worth a second look: nothing in the evidence licenses keeping a listing in play

## 15. fully specified handoff
`t1_strongMapLowRenoCosmetic` + `A_fullySpecified`

**Structured input**

```
map strongPreference · project cosmeticOnly · personalization wantsToMakeItTheirs
lever identified · sizeRoute n/a
protect      light, publicRooms, kitchen
levers       1. cosmeticFinish  2. geography
skipFaster   reject.kitchen, reject.publicRooms
secondLook   secondLook.cosmeticallyPlain
showingTests none
doNotSub     none
unresolved   whatWouldGive
program      none
discrepancy  none
```

**Agent brief**

```
SEARCH SNAPSHOT
The finish has room in it. A renovation does not. I would look at plain houses before asking them to take on a renovation. The map is the second thing to try, not the first.

SEARCH FACTS
Budget: $1.6m to $2.1m
Hard ceiling: $2.25m
Timing: actively looking now
Note: Lease ends in March and we would rather not renew.
Looking at: Mar Vista, Culver City, Playa del Rey
Ruled out: anything east of La Brea
Needs reasonable access to: my office in El Segundo
Property type: single family
Minimum bedrooms: 3
Minimum bathrooms: 2
Minimum square footage: 1,600 sq ft
Parking: required
Stairs: prefers minimal stairs
EV charging: preferred
Note: We have looked at about fifteen houses in person already.

FILTER ON THESE
- Real natural light
- Living space that works for how they cook and host
- A kitchen they don't have to redo

USE THIS AS THE FLEX
- The finish. Paint, paper and lighting are theirs to change anyway.
- Widen the area before you widen anything about the house.

WORTH A SECOND LOOK
- Plain inside but right everywhere else. They're repainting regardless.

STILL TO SETTLE
- What they would give on when a house makes them choose. Nothing has settled it yet.

Full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Buyer copy**

```
The finish has room in it. A renovation doesn't. I'd rather look at plain houses than take on a renovation. After that, the map.

What I am looking for
Budget: $1.6m to $2.1m
Hard ceiling: $2.25m
Timing: actively looking now
Note: Lease ends in March and we would rather not renew.
Looking at: Mar Vista, Culver City, Playa del Rey
Ruled out: anything east of La Brea
Needs reasonable access to: my office in El Segundo
Property type: single family
Minimum bedrooms: 3
Minimum bathrooms: 2
Minimum square footage: 1,600 sq ft
Parking: required
Stairs: prefers minimal stairs
EV charging: preferred
Note: We have looked at about fifteen houses in person already.

Has to have
- Real natural light
- Living space that works for how I cook and host
- A kitchen I don't have to redo

Where I have room
- The finish. Paint, paper and lighting I'll change anyway.
- The area. I have more room on where than on what.

One thing I have not settled
- What I'd give on when a house makes me choose.

My full result: https://example.test/tuesday-test?r=v.2_d.dark_j.never_l.strong
```

**Omitted**

- No obvious lever: a lever exists
- Lever not established yet: a lever exists
- Probably not worth the time: every skip repeated a criterion already in the filter list (reject.kitchen, reject.publicRooms)
- At the showing: nothing needs checking in person that is specific to this buyer
- Do not substitute: no false equivalence is established by the evidence
- The tradeoff to watch: no tension is established by the evidence
- Practical program: no functional requirement was established
- Needs clarification: the test and the search facts do not contradict each other


# The analysis you asked for

## 1. Sentences appearing in more than one of the 15

| times | sentence | fixtures |
|---|---|---|
| 11 | Widen the area before you widen anything about the house. | 2 strong map + cosmetic, 4 pool upkeep, 5 planting upkeep, 7 existingOnly, 8 additionOkay, 9 reconfigureOkay … |
| 6 | The map is the second thing to try, not the first. | 2 strong map + cosmetic, 7 existingOnly, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific, 15 full handoff |
| 6 | A house that needs work is fair game. The work is on the table. | 3 property-led major, 6 character + personalization, 7 existingOnly, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |
| 5 | Enough space | 3 property-led major, 7 existingOnly, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |
| 5 | Nothing else they named has give in it, so I would widen the map rather than soften one of the rest. | 4 pool upkeep, 5 planting upkeep, 11 pantry, 13 low information, 14 discrepancy |
| 4 | A renovation has room in it. The finish does not. | 3 property-led major, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |
| 4 | I would look at houses that need work before offering a plain house as the compromise. | 3 property-led major, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |
| 3 | Living space that works for how they cook and host | 1 closed lever, 2 strong map + cosmetic, 15 full handoff |
| 3 | What they would give on when a house makes them choose. Nothing has settled it yet. | 1 closed lever, 2 strong map + cosmetic, 15 full handoff |
| 3 | Real natural light | 2 strong map + cosmetic, 6 character + personalization, 15 full handoff |
| 3 | A kitchen they don't have to redo | 2 strong map + cosmetic, 11 pantry, 15 full handoff |
| 3 | The finish. Paint, paper and lighting are theirs to change anyway. | 2 strong map + cosmetic, 6 character + personalization, 15 full handoff |
| 3 | The map is the thing with room in it. | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 3 | Outdoor space they'd actually use | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 3 | Sit outside. Is there somewhere they'd actually use, or just square footage? | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 3 | A big yard is not usable outdoor space. Square footage outside is not the same as somewhere to sit. | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 3 | Outdoor space they'd actually use against upkeep they can live with. They want the outside and they do not want to look after it. Watch which way they lean when a real house makes them pick. | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 3 | How much work they would really take on. It changes what is worth showing. | 4 pool upkeep, 5 planting upkeep, 14 discrepancy |
| 2 | Move-in condition | 1 closed lever, 12 EV |
| 2 | A layout that works as built | 1 closed lever, 11 pantry |
| 2 | The finish has room in it. A renovation does not. | 2 strong map + cosmetic, 15 full handoff |
| 2 | I would look at plain houses before asking them to take on a renovation. | 2 strong map + cosmetic, 15 full handoff |
| 2 | Plain inside but right everywhere else. They're repainting regardless. | 2 strong map + cosmetic, 15 full handoff |
| 2 | If it is small, find out what adding on would actually involve here. | 3 property-led major, 8 additionOkay |
| 2 | Houses with a pool to look after. | 4 pool upkeep, 14 discrepancy |
| 2 | Find out what the pool actually costs to run before anyone falls in love with it. | 4 pool upkeep, 14 discrepancy |
| 2 | Pool upkeep | 4 pool upkeep, 14 discrepancy |

### How often each section appears across the fifteen

| section | appears in | lines total |
|---|---|---|
| Filter on these | 14/15 | 25 |
| Use this as the flex | 13/15 | 21 |
| At the showing | 11/15 | 16 |
| Still to settle | 8/15 | 8 |
| Worth a second look | 5/15 | 6 |
| Probably not worth the time | 5/15 | 5 |
| Practical program | 5/15 | 5 |
| Do not substitute | 4/15 | 4 |
| The tradeoff to watch | 3/15 | 3 |
| Search facts | 2/15 | 17 |
| No obvious lever | 1/15 | 1 |
| Lever not established yet | 1/15 | 1 |
| Needs clarification | 1/15 | 1 |


## 2. Sections that feel useless in practice

None are useless, but three are thin enough to flag.

**No obvious lever and Lever not established yet fire once each in fifteen.**
That is correct, not a problem: both are one line, and both exist precisely
because the alternative is faking a lever. Worth knowing they are rare.

**Needs clarification fires once.** Also correct. A discrepancy needs an
explicit incompatible pair, and the contract is deliberately conservative.

**The tradeoff to watch is the weakest section.** It appears three times, and
all three are the same tension (outdoor against upkeep). The only other why
code needs a Q8 answer, which none of the fifteen has. It renders correctly
when one exists: on `t9_rankOneWinsQ8` it reads "Real natural light against
outdoor space they'd actually use. Forced to choose once, they kept real
natural light. Both still matter." That is the behaviour you asked for, where
the loser does not stop mattering. But with two why codes in the whole engine,
this section will repeat itself across buyers more than any other.

**Practical program is now genuinely factual**, after one correction. It was
rendering "A pool is a maintenance question, not a feature", which is analysis
wearing a checklist's clothes. It now says "Pool upkeep".

## 3. Where the renderer had to suppress duplication

Six places. Each one was a real repeat that the structured contract permits on
purpose, because the two sections serve different functional views.

| suppressed | why |
|---|---|
| The snapshot's constraint list, when the lever is closed | It was the No obvious lever section verbatim. The snapshot now carries only the consequence: fewer, better showings. |
| The snapshot's implication, when it restates the tradeoff | "They want the outside without the maintenance" was arriving in both places in slightly different words. The tradeoff section is more specific, so it wins. |
| A skip that restates a filter criterion | `turnkey` filters on condition, layout and public rooms and skips the same three. All three skips are dropped, which empties the section for that buyer, which is correct. |
| A program entry already in the filter list | `site` reaches `practicalProgram` in the contract and is a filter criterion in the rendering. |
| "Worth asking before narrowing anything" per missing-lever line | Three gaps produced the same instruction three times. It is in the snapshot once instead. |
| Any line printed twice anywhere | A blanket test, not a rule: no two lines in one brief may be identical. |

What is **not** suppressed, because the second appearance is a different
instruction: "Outdoor space they'd actually use" in the filter list and "Sit
outside. Is there somewhere they'd actually use, or just square footage?" at
the showing. That is your own example, and it holds.

## 4. Contract fields that never reached the page

The honest audit. Everything the composer reads is `discrepancies`,
`doNotFlex`, `doNotSubstitute`, `expectedTradeoff` (`sideA`, `sideB`, `why`,
`ordering`), `flexOrder` (`state`, `missing`, `candidates[].status`,
`.lever`, `.rank`, `.veto`), `nonNegotiables[]` (`attribute`, `qualifier`,
`changeability`), `practicalProgram`, `searchFacts`, `secondLook`,
`showingTests`, `skipFaster` and `unresolved[].id`.

Everything else did not reach a rendered sentence:

| field | why not |
|---|---|
| `version` | Not reader-facing. Correct to omit. |
| every `trace`, `because`, `sources`, `rules` | Audit apparatus. Correct to omit; this is what makes the brief checkable without printing it. |
| `nonNegotiables[].direct`, `.directSources`, `.statedRank`, `.corroboration`, `.repeated`, `.ordering` | Deliberate. These are how strongly and how often something was said, and saying it out loud is the recap failure. They earned their place by deciding what reached protect level. |
| `nonNegotiables[].reinforcedBy` | Nothing to say with it that the criterion does not already say. |
| `searchPattern.map`, `.project`, `.personalization` | **Genuinely unused.** Every one of them is something the buyer clicked, so printing it is a recap. They reach the page only through their consequences: the map through the geography lever, the project posture through what can skip and flex. |
| `searchPattern.sizeRoute` | Same. It reaches the page as four different searches, never as a label. |
| `searchPattern.leverState` | Duplicate of `flexOrder.state`, which is what the composer reads. |
| `flexOrder.reason` | The reason codes are engine vocabulary. The three lever states already pick the section. |
| `secondLook[].doesNotImply` | **Not read, and this one deserves attention.** The guardrails are written into the catalogue phrases instead, which risks the two drifting. A test now asserts that no second-look phrase says the thing its `doesNotImply` forbids, so a new guardrail with no matching check fails the build. |
| `showingTests[].origin` | Could change the phrasing of a stated need versus a derived one. It does not today. |
| `expectedTradeoff.confidence` | Redundant with `ordering`, which the composer reads instead. Same information. |
| `unresolved[].leverage` | Always 1 in practice. |
| `discrepancies[].kind`, `.status`, `.quote` | The section is one line and does not vary by kind yet. `kind` would be the natural hook if you want the free-text case styled differently. |
| `conceptIndex` | **Did not drive the renderer, and I want to be straight about why.** The renderer splits one structured section, `nonNegotiables`, across two rendered sections, and the index cannot express that. So the dedup rules are the renderer's own. The index is now used as a cross-check instead: a test asserts that any concept printed in two rendered sections is one the contract records as shared. |

Nothing in this table is a reason to change the frozen model. Most of these
fields are doing their job by deciding what reaches the page, not by appearing
on it.

## 5. Buyer-copy length as a mailto body

Percent-encoded, which is what counts. Practical ceiling is about 1,800 characters for the whole URL.

| fixture | characters | url-encoded | |
|---|---|---|---|
| 1. fixed map + low renovation + closed lever | 481 | 679 | fine |
| 2. strong-preference map + low renovation + high personalization | 536 | 754 | fine |
| 3. property-led major renovator | 737 | 1055 | fine |
| 4. outdoor + pool upkeep concern | 550 | 778 | fine |
| 5. outdoor + planting upkeep concern | 552 | 782 | fine |
| 6. architecture high + personalization high | 481 | 665 | fine |
| 7. size protected + existingOnly | 437 | 615 | fine |
| 8. size protected + additionOkay | 517 | 725 | fine |
| 9. size protected + reconfigureOkay | 495 | 693 | fine |
| 10. size protected + propertySpecific | 536 | 754 | fine |
| 11. pantry-specific practical need | 498 | 704 | fine |
| 12. EV-specific practical need | 408 | 550 | fine |
| 13. low-information buyer | 592 | 834 | fine |
| 14. explicit discrepancy | 608 | 862 | fine |
| 15. fully specified handoff | 1069 | 1507 | fine |

## 6. Test count

412, up from 383. Lint, typecheck and build clean.

| file | tests |
|---|---|
| `lib/tuesday/v2/render/render.test.ts` | 29 (new) |
| everything else | 383 (unchanged) |

What the 29 cover: no em dash and none of the banned phrasings; no market
claim; no engine id leaking into either rendering; the two renderings agreeing
about whether a lever exists; the buyer copy carrying its sections in the email
order with a link back; every buyer copy fitting a mailto; the snapshot being
two to four sentences and always carrying an instruction from a closed list of
instruction forms; the snapshot contrasting two search dimensions rather than a
dealbreaker; a missing lever never reading as inflexibility; a closed lever
reading as strategy; six duplication guards; a discrepancy being flagged and
never resolved; search facts reproduced without interpretation; a school
boundary and a destination reproduced exactly with nothing added; every engine
id having a phrase; no phrase being dead copy.

## Two things I did not do

**No UI, no mailto, no Copy my brief.** As asked.

**No new inference to solve a copy problem.** Two sentences I wanted were cut
instead of being supported with invented data: "a long way behind" on the
second lever, because rank ordering says which is second and not how far
behind; and the original tradeoff line, which said outdoor space comes with
work "that usually comes attached", which is a claim about houses in general
and therefore market invention.
