# The language pass

A copy-only pass on `lib/tuesday/v2/render/`. The V2 instrument, the evidence
model, the strategy rules, `StructuredBrief`, section eligibility, the
deduplication logic and the market guards are all untouched. `git diff` against
every one of those files is empty.

## What changed

**The contrast template is gone.** "X has room in it, Y does not" was the
opening of nine of the fifteen briefs. It read like a strategy memo and made
every buyer sound alike. The opening is now keyed on which pair of search
dimensions is actually in play, so each pair gets the sentence Danielle would
say. Ten keyed openings, and a bare-lever fallback.

**The four size routes now lead their own snapshot**, because what a buyer will
do about a house that is too small changes more about the search than anything
else they told us. All four read differently, and none of them claims that
adding on is realistic.

**Abstract vocabulary is out of reader-facing copy.** A test fails the build on
`soft give`, `has room in it`, `the lever`, `spend the map`, `this dimension`,
`property posture`, `route is closed`, `constraint set`, `widen anything about
the house`, `posture`, `use the map before`, `second thing to try` and `the
give`, across both renderings and every strategic section. The unresolved line
also lost the word "give": "What they would give on when a house makes them
choose" is now "What they would actually bend on when a house forces the
choice." The buyer headings lost it too: "Where I have room" is now "Where I
can move".

**Slogan endings are out, and tested for.** `Fewer, better showings`, `That
route is closed`, `Use the map before the house`, `Spend the geography`, `The
property wins` and `showings are the instrument` all fail the build now.

**The flex section and the snapshot stopped saying the same thing.** The
snapshot is prose and carries the instruction. The flex section is a scannable
label with the reason attached: "Finishes. Paint, paper and lighting they are
changing anyway."

**Geography is phrased by situation.** One geography sentence appeared in
eleven of fifteen. It now varies on the map posture and whether it is the first
or second thing to try, which the engine already knows: a preferred line with
the right house just past it is a different instruction from a set of
neighbourhoods that already work. And the formulaic geography clause was
dropped from all four size-route snapshots, where it added nothing.

## The fifteen fixtures, re-rendered

Snapshot, flex or no-lever, second look, skip and tradeoff only.

## 1. fixed map + low renovation + closed lever
```
AGENT SNAPSHOT
Nothing obvious should move here. I would keep the search narrow rather than loosen one of these just to create more options.

NO OBVIOUS LEVER
- The map does not move, renovation is out and the rest are outright dealbreakers.
```

## 2. strong-preference map + low renovation + high personalization
```
AGENT SNAPSHOT
I would not rule out a house because the paint, the lighting or the finishes are boring. Anything that needs real work is a different conversation. If that still does not open enough up, the area is the next thing I would test.

USE THIS AS THE FLEX
- Finishes. Paint, paper and lighting they are changing anyway.
- Area. If nothing else opens it up, a few streets past the preferred line.

WORTH A SECOND LOOK
- Plain inside but right everywhere else. They're repainting regardless.
```

## 3. property-led major renovator
```
AGENT SNAPSHOT
They are open to doing work. Decorating is not the draw, so a house that needs something structural will land better than one that just needs painting. I would search for the house first and treat the area as the wider field.

USE THIS AS THE FLEX
- Condition. Work on the house is on the table.
- How the square footage arrives, not how much of it they need.
```

## 4. outdoor + pool upkeep concern
```
AGENT SNAPSHOT
Everything else they named is a hard stop, so the area is the only part I would push on. Look for the usable version of the outside, not the biggest one.

USE THIS AS THE FLEX
- Area. More than one neighbourhood already works, so stretch inside that set before anything else.

PROBABLY NOT WORTH THE TIME
- Houses with a pool to look after.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. Watch which way they lean when a real house makes them pick between the two.
```

## 5. outdoor + planting upkeep concern
```
AGENT SNAPSHOT
Everything else they named is a hard stop, so the area is the only part I would push on. Look for the usable version of the outside, not the biggest one.

USE THIS AS THE FLEX
- Area. More than one neighbourhood already works, so stretch inside that set before anything else.

PROBABLY NOT WORTH THE TIME
- Properties with planting that needs managing.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. Watch which way they lean when a real house makes them pick between the two.
```

## 6. architecture high + personalization high
```
AGENT SNAPSHOT
I would not rule out a house because the paint, the lighting or the finishes are boring. If that is not enough, houses that need real work are the next thing to put in front of them. The character has to come with the house. The finishes they can do themselves.

USE THIS AS THE FLEX
- Finishes. Paint, paper and lighting they are changing anyway.
- Condition. If the finishes alone are not enough, real work is on the table too.

WORTH A SECOND LOOK
- Good bones, bad styling. The architecture is what has to be there.
- Dated, as long as the plan and the site are good. That part is fixable.

PROBABLY NOT WORTH THE TIME
- Houses with no architectural character. Staging will not supply it.
```

## 7. size protected + existingOnly
```
AGENT SNAPSHOT
They are open to work, just not as a way to create the square footage. I would look at houses that need updating, but I would not keep an undersized house in play hoping it can grow.

USE THIS AS THE FLEX
- Condition. Work on the house is on the table.
- Area. If nothing else opens it up, the neighbourhoods that already work can stretch.

PROBABLY NOT WORTH THE TIME
- Anything under the target size. It has to be there on day one.
```

## 8. size protected + additionOkay
```
AGENT SNAPSHOT
The house does not have to be big enough today. If the property is otherwise right, I would keep a smaller one in play long enough to find out whether adding on is realistic.

USE THIS AS THE FLEX
- Condition. Work on the house is on the table.
- Area. If nothing else opens it up, the neighbourhoods that already work can stretch.

WORTH A SECOND LOOK
- Smaller than the target, where adding on looks genuinely possible.
```

## 9. size protected + reconfigureOkay
```
AGENT SNAPSHOT
I would not chase more square footage just because the plan is bad. If the area is there, a badly arranged house is still worth looking at.

USE THIS AS THE FLEX
- Condition. Work on the house is on the table.
- Area. If nothing else opens it up, the neighbourhoods that already work can stretch.

WORTH A SECOND LOOK
- Badly arranged rather than actually too small. The area may be fine once the plan changes.
```

## 10. size protected + propertySpecific
```
AGENT SNAPSHOT
I would not make the size call from the listing. This is one they have to stand in to know whether the house could work.

USE THIS AS THE FLEX
- Condition. Work on the house is on the table.
- Area. If nothing else opens it up, the neighbourhoods that already work can stretch.
```

## 11. pantry-specific practical need
```
AGENT SNAPSHOT
I would look a little outside the preferred area before taking on a house that needs real work.

USE THIS AS THE FLEX
- Area. They have a line they prefer. The right house just past it should still get shown.
```

## 12. EV-specific practical need
```
AGENT SNAPSHOT
Nothing has come out softer than the hard requirements, so I cannot say yet what they would move on. That is a question we did not ask, not a buyer digging in. Worth asking before narrowing anything.

LEVER NOT ESTABLISHED YET
- The personalization question was never answered, so finish could not be weighed.
```

## 13. low-information buyer
```
AGENT SNAPSHOT
I would look a little outside the preferred area. A house that just looks plain is not the compromise they want. Nothing they said is narrow enough to search on yet. A few very different houses will tell us more than another question would.

USE THIS AS THE FLEX
- Area. They have a line they prefer. The right house just past it should still get shown.
```

## 14. explicit discrepancy
```
AGENT SNAPSHOT
Everything else they named is a hard stop, so the area is the only part I would push on. Look for the usable version of the outside, not the biggest one.

USE THIS AS THE FLEX
- Area. More than one neighbourhood already works, so stretch inside that set before anything else.

PROBABLY NOT WORTH THE TIME
- Houses with a pool to look after.

THE TRADEOFF TO WATCH
- Outdoor space they'd actually use against upkeep they can live with. Watch which way they lean when a real house makes them pick between the two.
```

## 15. fully specified handoff
```
AGENT SNAPSHOT
I would not rule out a house because the paint, the lighting or the finishes are boring. Anything that needs real work is a different conversation. If that still does not open enough up, the area is the next thing I would test.

USE THIS AS THE FLEX
- Finishes. Paint, paper and lighting they are changing anyway.
- Area. If nothing else opens it up, a few streets past the preferred line.

WORTH A SECOND LOOK
- Plain inside but right everywhere else. They're repainting regardless.
```

# The analysis you asked for

## 1. Exact sentences appearing in more than three of the fifteen

| times | sentence | fixtures |
|---|---|---|
| 5 | Work on the house is on the table. | 3 property-led major, 7 existingOnly, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |
| 4 | If nothing else opens it up, the neighbourhoods that already work can stretch. | 7 existingOnly, 8 additionOkay, 9 reconfigureOkay, 10 propertySpecific |

Two, down from five. Both are the same instruction for the same situation, and
neither is padding.

Fixtures 7 to 10 are one buyer with four different size routes, so their map
posture and their renovation appetite are identical by construction. The
sentences that differ between them are the ones that should: the snapshot, the
second look, and the skip list. "Work on the house is on the table" also
reaches fixture 3, which is a genuinely different buyer who also accepted
structural work.

I did not break these up with synonyms. Two buyers in the same situation should
get the same instruction, and varying the words to flatten a count would make
the brief less trustworthy, not more.

One-word list labels are excluded from this count. "Area." and "Condition."
head eleven and six of the flex lists, which is what a scannable list looks
like; the sentence after the label is what varies.

For reference, everything appearing in exactly two or three:

| times | sentence | fixtures |
|---|---|---|
| 3 | Living space that works for how they cook and host | 1 closed, 2 strong map + cosmetic, 15 full handoff |
| 3 | What they would actually bend on when a house forces the choice. | 1 closed, 2 strong map + cosmetic, 15 full handoff |
| 3 | Nothing has settled that yet. | 1 closed, 2 strong map + cosmetic, 15 full handoff |
| 3 | I would not rule out a house because the paint, the lighting or the finishes are boring. | 2 strong map + cosmetic, 6 character, 15 full handoff |
| 3 | Real natural light | 2 strong map + cosmetic, 6 character, 15 full handoff |
| 3 | A kitchen they don't have to redo | 2 strong map + cosmetic, 11 pantry, 15 full handoff |
| 3 | Paint, paper and lighting they are changing anyway. | 2 strong map + cosmetic, 6 character, 15 full handoff |
| 3 | Everything else they named is a hard stop, so the area is the only part I would push on. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Look for the usable version of the outside, not the biggest one. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Outdoor space they'd actually use | 4 pool, 5 planting, 14 discrepancy |
| 3 | More than one neighbourhood already works, so stretch inside that set before anything else. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Is there somewhere they'd actually use, or just square footage? | 4 pool, 5 planting, 14 discrepancy |
| 3 | A big yard is not usable outdoor space. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Square footage outside is not the same as somewhere to sit. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Outdoor space they'd actually use against upkeep they can live with. | 4 pool, 5 planting, 14 discrepancy |
| 3 | Watch which way they lean when a real house makes them pick between the two. | 4 pool, 5 planting, 14 discrepancy |
| 3 | How much work they would really take on. | 4 pool, 5 planting, 14 discrepancy |
| 3 | It changes what is worth showing. | 4 pool, 5 planting, 14 discrepancy |
| 2 | A layout that works as built | 1 closed, 11 pantry |
| 2 | Anything that needs real work is a different conversation. | 2 strong map + cosmetic, 15 full handoff |
| 2 | If that still does not open enough up, the area is the next thing I would test. | 2 strong map + cosmetic, 15 full handoff |
| 2 | If nothing else opens it up, a few streets past the preferred line. | 2 strong map + cosmetic, 15 full handoff |
| 2 | Plain inside but right everywhere else. | 2 strong map + cosmetic, 15 full handoff |
| 2 | They're repainting regardless. | 2 strong map + cosmetic, 15 full handoff |
| 2 | If it is small, find out what adding on would actually involve here. | 3 property-led major, 8 additionOkay |
| 2 | Houses with a pool to look after. | 4 pool, 14 discrepancy |
| 2 | Find out what the pool actually costs to run before anyone falls in love with it. | 4 pool, 14 discrepancy |
| 2 | They have a line they prefer. | 11 pantry, 13 low information |
| 2 | The right house just past it should still get shown. | 11 pantry, 13 low information |

## 2. Strategic sentences containing an abstract engine term

None.

## 3. Sentences removed for lack of evidence

Nine, across this pass and the one before it. None of them was replaced by a
model change.

| removed | why |
|---|---|
| "Fewer, better showings." | A slogan. It ended the closed-lever snapshot because the paragraph felt unfinished, not because it said anything. |
| "That route is closed." | Same. The sentence before it already said not to keep a small house in play. |
| "The showings are the instrument." | Same. Replaced with what to actually do: a few very different houses will tell us more than another question would. |
| "They are open to doing work, and the area stays where it is." | Two facts the buyer clicked, with no instruction attached. Replaced with what to put in front of them inside a boundary that is not moving. |
| "They want the outside and they do not want to look after it." | A recap of two answers. The instruction half of that line was kept. |
| "Every criterion left is one they named outright." | True, and it duplicated the no-lever section, which lists the actual constraints. |
| The geography clause on all four size-route snapshots | Formulaic. It made the same sentence the ending of all four routes while adding nothing to any of them. |
| "a long way behind", on the second lever | The contract records which lever is second. It does not record how far behind, and inventing a distance to make the sentence land would be exactly the thing we are not doing. |
| "the work that usually comes attached", on the outdoor tradeoff | A claim about houses in general. We have no market layer, so the sentence went rather than the guard. |

**And one snapshot that is deliberately a single sentence.**
`twoDealbreakers` establishes a movable map and two hard stops. There is no
second honest thing to say about that buyer, so the brief says one thing. The
test that used to require two sentences now allows one, with the reason in a
comment, because the alternative is a line added for rhythm.

## 4. Test count

413, up from 412. Lint, typecheck and build clean.

One test replaced and two added. The replaced one checked that the contrast
template named two search dimensions rather than a dealbreaker; the template is
gone, so it is now a scan for abstract engine language across both renderings
and every strategic section. The two new ones are the slogan check and the
relaxed sentence count. Four existing tests were updated for the new wording:
the instruction forms the snapshot is allowed to use, the closed-lever
instruction, and the two buyer-heading names.

## What this pass did not touch

No UI. No mailto. No model change of any kind: the only files that moved are
`lib/tuesday/v2/render/phrases.ts`, `compose.ts`, `index.ts` and
`render.test.ts`.

---

# The three corrections, and the freeze

## 1. Permission is not preference

`structuralWorkOkay` and a high renovation reading mean a real project is
acceptable. They do not mean the buyer wants one, and a low personalization
reading does not mean they would rather move a wall than paint a room. The
`condition|cosmeticFinish` opening said a structural project "will land better
than one that just needs painting", which claimed exactly that.

It now reads: **"They are open to real work, but a blank cosmetic canvas is not
the reason to buy the house."** Permission, plus what the low personalization
reading actually says, and no claim about what they would rather do. The
property-led sentence that follows it is unchanged.

Two regression tests. One fails the build on twelve preference phrasings
anywhere in the strategic copy (`rather do the work`, `prefers a project`,
`will land better`, `suits them better`, `looking for a project`, `wants a
renovation`, `the draw`, `enjoys the work`, `eager`, `keen to`, `excited`, `the
more work the better`, `ideally`). A second asserts the positive half: where a
real project is acceptable and it reaches the snapshot, the sentence has to be
about it being allowed.

## 2. The outdoor burden, as they named it

One shared line discarded the qualifier we deliberately collected. The
instruction now uses it, with the specific cases taking precedence over the
general one:

| qualifier | instruction |
|---|---|
| `upkeep:pool` | A pool does not automatically count as the outdoor space. The outside still has to be somewhere they would sit. |
| `upkeep:planting` | They want the outdoor space, but not if using it comes with a landscaping job. |
| anything else | They want outdoor space, not another job. |

This needed one mechanical change in the renderer: the implication matcher now
sees both the bare action id and the qualified one, so a rule can key on the
part of the upkeep the buyer named while the general case still covers the
qualifiers that have no specific line.

None of the three says they dislike pools, refuse landscaping, want a smaller
yard, or that more property is worse. A test asserts all four, asserts the two
fixtures no longer share a strategic line, and asserts the planting fixture
never mentions a pool.

## 3. Plainly, and without a word about the buyer

The missing-lever opening said "not a buyer digging in", which frames them as
resistant in the act of denying it, and apologised for the instrument on the
way past. It now reads: **"We do not know yet what they would trade first. The
test did not establish it, so I would ask before narrowing the search."**

A test fails the build on fourteen adversarial framings and five apologetic
ones, across both renderings.

## What else changed

Twenty of fifty-nine rendered rows, every one of them an intended propagation
and nothing else:

| fix | rows | fixtures |
|---|---|---|
| Permission is not preference | 2 | `structuralBuilder`, `t8_sizeAndStructural` |
| The outdoor qualifier | 9 | `t3_outdoorPoolConcern` and its seven handoff pairings, `t4_outdoorPlantingConcern` |
| Plain missing-lever wording | 9 | `fixedMap`, `projectUnresolved`, `protectedLoser`, `t5_evQualifier`, `t9_rankOneWinsQ8`, `t10_rankTwoWinsQ8`, `t11_declinedTradeoff`, `t13_leverNotEstablished`, `tradeoffTwoProperties` |

Checked by rendering all thirty fixtures and twenty-one handoff pairings before
and after, and classifying every difference. Unexplained differences: none.

No phrase-frequency work was done in this pass, and no correct repeated
sentence was varied to make outputs look more distinct.

## Frozen

The renderer is frozen as of this change, alongside the V2 instrument, V2
scoring and evidence, provenance, the adaptive tradeoff, the strategy layer and
the structured brief contract.

417 tests. Lint, typecheck and build clean. `git diff` against every frozen
file, against V1, and against `components/` and `app/`, is empty.
