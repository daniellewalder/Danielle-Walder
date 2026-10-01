# The structured buyer brief

What the eventual Danielle-facing brief contains, before anyone decides how to
phrase it. No copy here, and none in the code: internal field labels only.

    Tuesday Test evidence  +  derived search strategy  +  optional factual handoff
                              -> structured brief
                              -> reader-facing copy (later)

Code: `lib/tuesday/v2/brief.ts`, `lib/tuesday/v2/handoff.ts`.
Scenarios: `lib/tuesday/v2/handoff.fixtures.ts`. Tests: `lib/tuesday/v2/brief.test.ts`.

## 1. The three sources

Every field names its layer, and the layers never merge.

| layer | what it is | where it can appear |
|---|---|---|
| `buyerEvidence` | stated through the Tuesday Test | `nonNegotiables`, the map posture |
| `derived` | concluded by the strategy engine from combinations | every strategic section |
| `handoff` | literal search facts supplied after the result | `searchFacts` only |

A handoff fact never touches a score, a band, an attribute state or the
shareable result. This is enforced, not just intended: one test assembles every
fixture against every handoff and asserts that the brief is byte-identical
outside `searchFacts` and `discrepancies`.

## 2. Schema

```ts
interface StructuredBrief {
  version: 2
  searchPattern: {
    map: MapConstraint | null
    project: 'turnkey' | 'cosmeticOnly' | 'contained' | 'major' | 'undecided' | 'notEstablished'
    personalization: 'wantsToMakeItTheirs' | 'someChanges' | 'prefersItLeftAlone' | 'notEstablished'
    leverState: 'identified' | 'closed' | 'notEstablished'
    sizeRoute: 'existingOnly' | 'additionOkay' | 'reconfigureOkay' | 'propertySpecific' | null
    trace: Record<'map' | 'project' | 'personalization' | 'sizeRoute', Trace>
  }
  nonNegotiables: NonNegotiable[]
  flexOrder: {
    state: 'identified' | 'closed' | 'notEstablished'
    reason: ClosedReason | NotEstablishedReason | null
    candidates: LeverEntry[]
    missing?: string[]              // notEstablished only
  }
  doNotFlex: BriefItem[]
  skipFaster: BriefItem[]
  secondLook: (BriefItem & { doesNotImply: string[] })[]
  showingTests: (BriefItem & { origin: 'buyerEvidence' | 'derived' })[]
  doNotSubstitute: { wanted: string; doNotSubstitute: string; trace: Trace }[]
  expectedTradeoff: ExpectedTradeoffItem | null      // max one
  unresolved: { id: string; leverage: number; trace: Trace }[]
  practicalProgram: BriefItem[]
  searchFacts: Handoff | null
  discrepancies: Discrepancy[]
  conceptIndex: Record<string, { home: string; referencedIn: string[]; attribute: boolean }>
}

interface Trace {
  layer: 'buyerEvidence' | 'derived' | 'handoff'
  because?: string[]   // the facts
  sources?: string[]   // question ids
  rules?: string[]     // which strategy rules produced it
}

interface NonNegotiable {
  attribute: string
  qualifier: string | null
  changeability: Changeability
  direct: number
  directSources: string[]
  statedRank: number | null
  corroboration: string[]
  repeated: boolean
  ordering: { against: string; outcome: 'won' | 'lost' } | null
  trace: Trace
  reinforcedBy?: Trace[]    // derived reasoning folded in, not repeated
}

interface LeverEntry {
  lever: string
  status: 'available' | 'notSelected' | 'vetoed'
  rank?: number             // available only, dense from 1
  veto?: VetoReason         // vetoed only
  trace: Trace
}

interface ExpectedTradeoffItem {
  sideA: string
  sideB: string
  ordering: 'sideAWins' | 'none'
  why: string
  confidence: 'established' | 'toTest'
  trace: Trace
}

interface Discrepancy {
  kind: 'structuredConflict' | 'freeTextMayConflict'
  testEvidence: string
  handoffFact: string
  quote?: string            // verbatim, free text only
  status: 'needsClarification'
  trace: Trace
}
```

Four changes to the shape you proposed, each for a reason:

**`LeverEntry` has three statuses, not two.** `vetoed` is a finding about the
buyer. `notSelected` is a fact about us: it could move, better levers existed,
we do not lead with it. Reporting the second as the first is how our own
ranking starts reading as the buyer's inflexibility.

**`NonNegotiable.reinforcedBy`.** You said do not mirror every non-negotiable
into `doNotFlex`. Some strategy rules independently conclude do-not-flex on
something already protected. The entry is dropped and its trace folded into the
attribute, so the reasoning survives without a second heading.

**`searchPattern.trace`.** A posture is a conclusion, so it names its evidence.

**`searchPattern.sizeRoute` and `conceptIndex[].attribute`.** The route is part
of the operational description of the search, so it sits beside the other three
postures rather than being reassembled from the sections. `attribute` marks
whether a concept has an entry in the taxonomy: a derived concept such as
`sizeRoute` or `cosmeticFinish` can appear in two sections and needs the same
one-home record an attribute gets, but it can never carry buyer evidence of its
own and the renderer has to be able to tell.

## 3. Assembler rules

1. `nonNegotiables` is every `protect`-state attribute, verbatim from the
   evidence, with no derived content and no rule ids.
2. `flexOrder` lists every candidate the lever diagnosis considered. Emitted
   and accepted becomes `available` with a dense rank in the strategy's own
   order; accepted but not emitted becomes `notSelected`; vetoed keeps its
   reason code.
3. `notEstablished` names the question that would settle it, not a mood: "the
   renovation question was never answered, so condition could not be weighed."
4. `showingTests.origin` separates verifying something the buyer named from
   verifying something a combination produced.
5. `expectedTradeoff.confidence` is `established` only when Q8 actually ordered
   that exact pair. Otherwise `toTest` and `ordering: 'none'`.
6. `secondLook.doesNotImply` is explicit per action id. Cosmetic plainness
   never licenses renovation tolerance.
7. `practicalProgram` is every established functional or qualified need, at
   `protect` or `scrutinize`.
8. `searchPattern.sizeRoute` is the answer to the size-route follow-up, or
   null. Never defaulted either way: assuming the space must already exist
   would eliminate listings the buyer never ruled out, and assuming it need not
   would keep candidates they would reject on sight.
9. `conceptIndex` is computed last, over the finished brief, and covers every
   concept the brief mentions rather than only taxonomy attributes.

## 4. Deduplication rules

The old result printed the kitchen four times under four headings. The brief
cannot, because every concept has one home.

- Home priority: `nonNegotiables` > `practicalProgram` > `showingTests` >
  `skipFaster` > `doNotFlex` > `flexOrder` > `secondLook` > `doNotSubstitute`.
  The first section a concept actually appears in is its home; the rest are
  references. `condition` usually has no home but `flexOrder`, and that is
  correct: it reaches most briefs only as a lever.
- A `doNotFlex` whose subject is already in `skipFaster` is dropped. You cannot
  quietly compromise something you are eliminating listings on.
- A `doNotFlex` whose subject is already a non-negotiable is dropped and its
  trace folded into that entry.
- One instruction per subject per section, enforced by test.
- A concept may legitimately appear in several sections when each says
  something different: a non-negotiable means do not compromise it, a program
  item means the house has to have it. What is forbidden is two findings with
  no record of which one describes it, which is what `conceptIndex` prevents.
- **One signal, described twice, is never two signals.** The evidence layer may
  cite only questions that actually touched the attribute, and the repetition
  claim stays gated on two distinct question ids. A derived action is different
  and may cite either side of a combination: a conclusion about outdoor space
  drawn partly from the upkeep answer legitimately names `daily`, because the
  combination is the evidence.

## 5. Discrepancy rules

Conservative by construction. Only an explicit incompatible pair qualifies.

- **Absence is never a contradiction.** A blank handoff field says nothing.
- **A handoff fact the test never covered is not a conflict.**
- **Structured fields are compared directly.** One pair is live today: the
  buyer named pool upkeep as a burden (`upkeep` qualifier `pool`, at an
  established state) and then set `hardFilters.pool = 'required'`.
- **Free text is never parsed for meaning.** Where a note contains a phrase
  that may contradict a settled posture, the brief quotes it verbatim beside
  the evidence, labels it `freeTextMayConflict`, and marks it for
  clarification. That is co-location, not interpretation.
- **Nothing is ever manufactured from a list.** A fixed map plus five areas
  listed in the handoff produces nothing. There is no way to tell from free
  text whether those areas sit inside the fixed map, and guessing would put a
  false statement about her own answers in front of her.
- Nothing about schools is ever produced that the buyer did not type, and a
  school boundary can never become a discrepancy. A boundary is a constraint;
  we have no data to contradict it with and will not invent any.

## 6. Fair housing

`handoff.ts` carries the rule in its header: record the constraint, never the
reason. Bedrooms are a property specification and we do not ask who sleeps in
them. A boundary is a geographic constraint and we do not rate, rank or infer
school quality. A step-free requirement is a property filter and we do not ask
why. Destinations are free text with no categories, because a category picker
would collect things like places of worship.

Tested: the boundary and the destinations survive byte-identical in
`searchFacts`; no destination string appears anywhere else in the brief; no
trace source is anything but a real question id or the literal `handoff`; and
the assembled brief contains no school-quality vocabulary at all.

## 7. The seven questions

Each column is one fixture. An empty cell is an empty section, not a gap.

| | `twoDealbreakers` | `turnkey` | `structuralBuilder` | `t1_strongMapLowRenoCosmetic` | `t3_outdoorPoolConcern` | `t9_rankOneWinsQ8` | `t13_leverNotEstablished` |
|---|---|---|---|---|---|---|---|
| **filter in the search tool** | _empty_ | condition, layout, publicRooms | _empty_ | kitchen, publicRooms | upkeep | kitchen | _empty_ |
| **use as a lever** | 1. geography | _empty_ | 1. condition, 2. sizeRoute | 1. cosmeticFinish, 2. geography | 1. geography | _empty_ | _empty_ |
| **not compromise** | privacy, light | condition, layout, publicRooms, geography | separation, size, site | light, publicRooms, kitchen, condition | outdoor, upkeep | light, outdoor, kitchen, condition, geography | geography |
| **cannot screen, needs a showing** | _empty_ | _empty_ | size, separation, site:land | _empty_ | outdoor, upkeep:pool | _empty_ | exposure |
| **deserves a second look** | _empty_ | _empty_ | _empty_ | cosmeticallyPlain | _empty_ | _empty_ | _empty_ |
| **still unresolved** | _empty_ | whatWouldGive | mustSpaceExistAlready | whatWouldGive | renovationAppetite | the personalization question was never answered, so finish could not be weighed | firstFilter, they said it depends how much work, and the follow-up is still open |
| **needs clarification** | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ |

| | `r5_someChangesOnly` | `r1_sizeExistingOnly` | `r2_sizeAdditionOkay` | `r3_sizeReconfigureOkay` | `r4_sizePropertySpecific` | `r6_siteQualifiers` |
|---|---|---|---|---|---|---|
| **filter in the search tool** | kitchen, publicRooms | size | _empty_ | _empty_ | _empty_ | kitchen |
| **use as a lever** | 1. geography | 1. condition, 2. geography | 1. condition, 2. geography, 3. sizeRoute | 1. condition, 2. geography, 3. sizeRoute | 1. condition, 2. geography, 3. sizeRoute | 1. geography |
| **not compromise** | light, publicRooms, kitchen, condition | size, sizeRoute | size | size | size | site, kitchen, condition |
| **cannot screen, needs a showing** | _empty_ | _empty_ | size | size | size | site:land |
| **deserves a second look** | _empty_ | _empty_ | smallerWithPotential | badlyArrangedNotSmall | _empty_ | _empty_ |
| **still unresolved** | whatWouldGive | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ |
| **needs clarification** | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ |

## 8. One full brief per family

### `twoDealbreakers`
_two full-strength dealbreakers, ranked, from one provenance source_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fewAreas",
    "project": "notEstablished",
    "personalization": "notEstablished",
    "leverState": "identified",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = unset",
          "dayOneReadiness = unset"
        ],
        "sources": [],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = unset"
        ],
        "sources": [],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "privacy",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 4.5,
      "directSources": [
        "tuesday",
        "dealbreaker"
      ],
      "statedRank": 2,
      "corroboration": [
        "tuesday",
        "dealbreaker"
      ],
      "repeated": true,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "tuesday",
          "dealbreaker"
        ]
      }
    },
    {
      "attribute": "light",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "dealbreaker"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "identified",
    "reason": null,
    "candidates": [
      {
        "lever": "geography",
        "status": "available",
        "rank": 1,
        "trace": {
          "layer": "derived",
          "because": [
            "map = fewAreas"
          ],
          "sources": [
            "location"
          ],
          "rules": [
            "geographyLever"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "renovationNotEstablished",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: renovationNotEstablished"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "personalizationNotEstablished",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: personalizationNotEstablished"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "light",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "privacy",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [],
  "skipFaster": [],
  "secondLook": [],
  "showingTests": [],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "privacy": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "light": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": true
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `turnkey`
_turnkey, low renovation tolerance_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fixed",
    "project": "turnkey",
    "personalization": "prefersItLeftAlone",
    "leverState": "closed",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = no",
          "dayOneReadiness = yes"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = no"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "condition",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 4,
      "directSources": [
        "personalization",
        "project"
      ],
      "statedRank": null,
      "corroboration": [
        "personalization",
        "project"
      ],
      "repeated": true,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "personalization",
          "project"
        ]
      }
    },
    {
      "attribute": "layout",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "dealbreaker"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      }
    },
    {
      "attribute": "publicRooms",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 3,
      "directSources": [
        "daily"
      ],
      "statedRank": 1,
      "corroboration": [
        "daily"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "daily"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "closed",
    "reason": "closedByExplicitConstraints",
    "candidates": [
      {
        "lever": "geography",
        "status": "vetoed",
        "veto": "fixedGeography",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: fixedGeography"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "lowRenovation",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: lowRenovation"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "noCosmeticAppetite",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noCosmeticAppetite"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "hardFiltered",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: hardFiltered"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "layout",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "publicRooms",
        "status": "vetoed",
        "veto": "hardFiltered",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: hardFiltered"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [
    {
      "id": "doNotFlex.geography",
      "subject": "geography",
      "trace": {
        "layer": "derived",
        "because": [
          "map = fixed"
        ],
        "sources": [
          "location"
        ],
        "rules": [
          "fixedMap"
        ]
      }
    }
  ],
  "skipFaster": [
    {
      "id": "reject.condition",
      "subject": "condition",
      "trace": {
        "layer": "derived",
        "because": [
          "condition = protect",
          "renovation = no"
        ],
        "sources": [
          "personalization",
          "project",
          "project"
        ],
        "rules": [
          "finishProtectedLowReno"
        ]
      }
    },
    {
      "id": "reject.layout",
      "subject": "layout",
      "trace": {
        "layer": "derived",
        "because": [
          "layout = protect",
          "renovation = no",
          "not correctable without a project"
        ],
        "sources": [
          "dealbreaker",
          "project"
        ],
        "rules": [
          "spatialLowReno"
        ]
      }
    },
    {
      "id": "reject.publicRooms",
      "subject": "publicRooms",
      "trace": {
        "layer": "derived",
        "because": [
          "publicRooms = protect",
          "renovation = no",
          "not correctable without a project"
        ],
        "sources": [
          "daily",
          "project"
        ],
        "rules": [
          "spatialLowReno"
        ]
      }
    }
  ],
  "secondLook": [],
  "showingTests": [],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [
    {
      "id": "whatWouldGive",
      "leverage": 1,
      "trace": {
        "layer": "derived",
        "because": [
          "3 protected criteria",
          "no forced choice answered"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ]
      }
    }
  ],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "condition": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "layout": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "publicRooms": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": false
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `structuralBuilder`
_major structural work, and no expansion attribute is created by it_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "propertyLed",
    "project": "major",
    "personalization": "someChanges",
    "leverState": "identified",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = yes",
          "dayOneReadiness = no",
          "structuralWorkOkay"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = conditional"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "separation",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 4,
      "directSources": [
        "tuesday",
        "daily"
      ],
      "statedRank": 1,
      "corroboration": [
        "tuesday",
        "daily"
      ],
      "repeated": true,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "tuesday",
          "daily"
        ]
      },
      "reinforcedBy": [
        {
          "layer": "derived",
          "because": [
            "map = propertyLed",
            "separation = protect"
          ],
          "sources": [
            "location",
            "tuesday",
            "daily"
          ],
          "rules": [
            "propertyLedStrict"
          ]
        }
      ]
    },
    {
      "attribute": "size",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 4,
      "directSources": [
        "tuesday",
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "tuesday",
        "dealbreaker"
      ],
      "repeated": true,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "tuesday",
          "dealbreaker"
        ]
      },
      "reinforcedBy": [
        {
          "layer": "derived",
          "because": [
            "map = propertyLed",
            "size = protect"
          ],
          "sources": [
            "location",
            "tuesday",
            "dealbreaker"
          ],
          "rules": [
            "propertyLedStrict"
          ]
        }
      ]
    },
    {
      "attribute": "site",
      "qualifier": "land",
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 2,
      "corroboration": [
        "dealbreaker"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      },
      "reinforcedBy": [
        {
          "layer": "derived",
          "because": [
            "map = propertyLed",
            "site = protect"
          ],
          "sources": [
            "location",
            "dealbreaker"
          ],
          "rules": [
            "propertyLedStrict"
          ]
        }
      ]
    }
  ],
  "flexOrder": {
    "state": "identified",
    "reason": null,
    "candidates": [
      {
        "lever": "geography",
        "status": "vetoed",
        "veto": "geographyAlreadyOpen",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: geographyAlreadyOpen"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "available",
        "rank": 1,
        "trace": {
          "layer": "derived",
          "because": [
            "renovation = yes",
            "work is on the table"
          ],
          "sources": [
            "project"
          ],
          "rules": [
            "conditionLever"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "limitedCosmeticAppetite",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: limitedCosmeticAppetite"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "available",
        "rank": 2,
        "trace": {
          "layer": "derived",
          "because": [
            "size = protect",
            "structuralWorkOkay",
            "the route is not settled yet",
            "whether the size must already exist is not yet established"
          ],
          "sources": [
            "tuesday",
            "dealbreaker",
            "project"
          ],
          "rules": [
            "sizeRouteLever"
          ]
        }
      },
      {
        "lever": "separation",
        "status": "notSelected",
        "trace": {
          "layer": "derived",
          "because": [
            "it could move",
            "stronger levers were available, so we do not lead with it"
          ],
          "rules": [
            "leverSelection"
          ]
        }
      },
      {
        "lever": "site",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "size",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [],
  "skipFaster": [],
  "secondLook": [],
  "showingTests": [
    {
      "id": "inspect.expansionFeasibility",
      "subject": "size",
      "trace": {
        "layer": "derived",
        "because": [
          "size = protect",
          "structuralWorkOkay",
          "expansion potential is a property fact, not a buyer priority"
        ],
        "sources": [
          "tuesday",
          "dealbreaker",
          "project"
        ],
        "rules": [
          "sizeRouteUnsettled"
        ]
      },
      "origin": "derived"
    },
    {
      "id": "inspect.separation.correctable",
      "subject": "separation",
      "trace": {
        "layer": "derived",
        "because": [
          "separation = protect",
          "renovation = yes",
          "correctable in principle, so the question is whether it is correctable here"
        ],
        "sources": [
          "tuesday",
          "daily",
          "project"
        ],
        "rules": [
          "spatialHighReno"
        ]
      },
      "origin": "derived"
    },
    {
      "id": "inspect.siteFit",
      "subject": "site",
      "qualifier": "land",
      "trace": {
        "layer": "derived",
        "because": [
          "site = protect",
          "qualifier = land",
          "inspect the slope, the shape and which parts of the land are usable",
          "this needs evaluating in person, and nothing here says a problem exists"
        ],
        "sources": [
          "dealbreaker"
        ],
        "rules": [
          "siteNeedsInspection"
        ]
      },
      "origin": "buyerEvidence"
    }
  ],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [
    {
      "id": "mustSpaceExistAlready",
      "leverage": 1,
      "trace": {
        "layer": "derived",
        "because": [
          "size = protect",
          "structuralWorkOkay",
          "the size route has not been answered"
        ],
        "sources": [
          "dealbreaker",
          "project"
        ]
      }
    }
  ],
  "practicalProgram": [
    {
      "id": "program.site",
      "subject": "site",
      "qualifier": "land",
      "trace": {
        "layer": "derived",
        "because": [
          "site = protect",
          "qualifier = land"
        ],
        "sources": [
          "dealbreaker"
        ],
        "rules": [
          "practicalProgram"
        ]
      }
    }
  ],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "separation": {
      "home": "nonNegotiables",
      "referencedIn": [
        "showingTests",
        "flexOrder"
      ],
      "attribute": true
    },
    "size": {
      "home": "nonNegotiables",
      "referencedIn": [
        "showingTests",
        "flexOrder"
      ],
      "attribute": true
    },
    "site": {
      "home": "nonNegotiables",
      "referencedIn": [
        "practicalProgram",
        "showingTests",
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": true
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `t1_strongMapLowRenoCosmetic`
_strong map + low renovation + cosmetic flexibility_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "strongPreference",
    "project": "cosmeticOnly",
    "personalization": "wantsToMakeItTheirs",
    "leverState": "identified",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = no",
          "dayOneReadiness = no"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = yes"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "light",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "dealbreaker"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      }
    },
    {
      "attribute": "publicRooms",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 3,
      "directSources": [
        "daily"
      ],
      "statedRank": 1,
      "corroboration": [
        "daily"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "daily"
        ]
      }
    },
    {
      "attribute": "kitchen",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 3,
      "directSources": [
        "project"
      ],
      "statedRank": null,
      "corroboration": [
        "project"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "project"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "identified",
    "reason": null,
    "candidates": [
      {
        "lever": "geography",
        "status": "available",
        "rank": 2,
        "trace": {
          "layer": "derived",
          "because": [
            "map = strongPreference"
          ],
          "sources": [
            "location"
          ],
          "rules": [
            "geographyLever"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "lowRenovation",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: lowRenovation"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "available",
        "rank": 1,
        "trace": {
          "layer": "derived",
          "because": [
            "cosmetic = yes",
            "an unstyled house is acceptable",
            "implies nothing about renovation"
          ],
          "sources": [
            "personalization"
          ],
          "rules": [
            "cosmeticFinishLever"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "kitchen",
        "status": "vetoed",
        "veto": "hardFiltered",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: hardFiltered"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "light",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "publicRooms",
        "status": "vetoed",
        "veto": "hardFiltered",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: hardFiltered"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [
    {
      "id": "doNotFlex.condition",
      "subject": "condition",
      "trace": {
        "layer": "derived",
        "because": [
          "map = strongPreference",
          "renovation = no"
        ],
        "sources": [
          "location",
          "project"
        ],
        "rules": [
          "movableMapLowReno"
        ]
      }
    }
  ],
  "skipFaster": [
    {
      "id": "reject.kitchen",
      "subject": "kitchen",
      "trace": {
        "layer": "derived",
        "because": [
          "kitchen = protect",
          "renovation = no"
        ],
        "sources": [
          "project",
          "project"
        ],
        "rules": [
          "finishProtectedLowReno"
        ]
      }
    },
    {
      "id": "reject.publicRooms",
      "subject": "publicRooms",
      "trace": {
        "layer": "derived",
        "because": [
          "publicRooms = protect",
          "renovation = no",
          "not correctable without a project"
        ],
        "sources": [
          "daily",
          "project"
        ],
        "rules": [
          "spatialLowReno"
        ]
      }
    }
  ],
  "secondLook": [
    {
      "id": "secondLook.cosmeticallyPlain",
      "subject": "finishes",
      "trace": {
        "layer": "derived",
        "because": [
          "cosmetic = yes",
          "renovation = no"
        ],
        "sources": [
          "personalization",
          "project"
        ],
        "rules": [
          "persHighRenoLow"
        ]
      },
      "doesNotImply": [
        "renovationTolerance",
        "structuralWork"
      ]
    }
  ],
  "showingTests": [],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [
    {
      "id": "whatWouldGive",
      "leverage": 1,
      "trace": {
        "layer": "derived",
        "because": [
          "3 protected criteria",
          "no forced choice answered"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ]
      }
    }
  ],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "light": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "publicRooms": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "kitchen": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "condition": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "finishes": {
      "home": "secondLook",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `t3_outdoorPoolConcern`
_outdoor protected + pool-specific upkeep concern_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fewAreas",
    "project": "undecided",
    "personalization": "notEstablished",
    "leverState": "identified",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = yes",
          "dayOneReadiness = conditional",
          "the follow-up is still open"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = unset"
        ],
        "sources": [],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "outdoor",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "dealbreaker"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      }
    },
    {
      "attribute": "upkeep",
      "qualifier": "pool",
      "changeability": "verifyPerProperty",
      "direct": 3,
      "directSources": [
        "daily"
      ],
      "statedRank": 1,
      "corroboration": [
        "daily"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "daily"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "identified",
    "reason": null,
    "candidates": [
      {
        "lever": "geography",
        "status": "available",
        "rank": 1,
        "trace": {
          "layer": "derived",
          "because": [
            "map = fewAreas"
          ],
          "sources": [
            "location"
          ],
          "rules": [
            "geographyLever"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "unresolvedProject",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: unresolvedProject"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "personalizationNotEstablished",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: personalizationNotEstablished"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "outdoor",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "upkeep",
        "status": "vetoed",
        "veto": "operational",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: operational"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [],
  "skipFaster": [
    {
      "id": "reject.upkeep.pool",
      "subject": "upkeep",
      "qualifier": "pool",
      "trace": {
        "layer": "derived",
        "because": [
          "upkeep = protect",
          "qualifier = pool"
        ],
        "sources": [
          "daily"
        ],
        "rules": [
          "upkeepProtectedWithQualifier"
        ]
      }
    }
  ],
  "secondLook": [],
  "showingTests": [
    {
      "id": "inspect.outdoorUsability",
      "subject": "outdoor",
      "trace": {
        "layer": "derived",
        "because": [
          "outdoor = protect",
          "upkeep qualifier = pool"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ],
        "rules": [
          "outdoorWithBurden"
        ]
      },
      "origin": "derived"
    },
    {
      "id": "inspect.upkeep",
      "subject": "upkeep",
      "qualifier": "pool",
      "trace": {
        "layer": "derived",
        "because": [
          "upkeep qualifier = pool",
          "outdoor = protect",
          "upkeep = protect",
          "verify per property",
          "qualifier = pool"
        ],
        "sources": [
          "daily",
          "dealbreaker"
        ],
        "rules": [
          "outdoorWithBurden",
          "operationalNeedsInspection"
        ]
      },
      "origin": "buyerEvidence"
    }
  ],
  "doNotSubstitute": [
    {
      "wanted": "outdoor",
      "doNotSubstitute": "largeYard",
      "trace": {
        "layer": "derived",
        "because": [
          "outdoor = protect",
          "upkeep qualifier = pool",
          "extent and usability are different things"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ],
        "rules": [
          "outdoorWithBurden"
        ]
      }
    }
  ],
  "expectedTradeoff": {
    "sideA": "outdoor",
    "sideB": "upkeep",
    "ordering": "none",
    "why": "wantsTheOutsideButNotTheMaintenance",
    "confidence": "toTest",
    "trace": {
      "layer": "derived",
      "because": [
        "outdoor = protect",
        "upkeep qualifier = pool"
      ],
      "sources": [
        "dealbreaker",
        "daily"
      ]
    }
  },
  "unresolved": [
    {
      "id": "renovationAppetite",
      "leverage": 1,
      "trace": {
        "layer": "derived",
        "because": [
          "project = depends",
          "follow-up not answered"
        ],
        "sources": [
          "project"
        ]
      }
    }
  ],
  "practicalProgram": [
    {
      "id": "program.upkeep",
      "subject": "upkeep",
      "qualifier": "pool",
      "trace": {
        "layer": "derived",
        "because": [
          "upkeep = protect",
          "qualifier = pool"
        ],
        "sources": [
          "daily"
        ],
        "rules": [
          "practicalProgram"
        ]
      }
    }
  ],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "outdoor": {
      "home": "nonNegotiables",
      "referencedIn": [
        "showingTests",
        "flexOrder",
        "doNotSubstitute"
      ],
      "attribute": true
    },
    "upkeep": {
      "home": "nonNegotiables",
      "referencedIn": [
        "practicalProgram",
        "showingTests",
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": true
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `t9_rankOneWinsQ8`
_two protected dealbreakers, the FIRST-ranked one wins Q8_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fixed",
    "project": "turnkey",
    "personalization": "notEstablished",
    "leverState": "notEstablished",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = no",
          "dayOneReadiness = conditional"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = unset"
        ],
        "sources": [],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "light",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "dealbreaker",
        "tradeoff"
      ],
      "repeated": true,
      "ordering": {
        "against": "outdoor",
        "outcome": "won"
      },
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      }
    },
    {
      "attribute": "outdoor",
      "qualifier": null,
      "changeability": "protectAtPurchase",
      "direct": 3,
      "directSources": [
        "dealbreaker"
      ],
      "statedRank": 2,
      "corroboration": [
        "dealbreaker",
        "tradeoff"
      ],
      "repeated": true,
      "ordering": {
        "against": "light",
        "outcome": "lost"
      },
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "dealbreaker"
        ]
      },
      "reinforcedBy": [
        {
          "layer": "derived",
          "because": [
            "outdoor = protect",
            "lost a forced choice but stayed protected"
          ],
          "sources": [
            "tradeoff",
            "dealbreaker"
          ],
          "rules": [
            "tradeoffBothProtected"
          ]
        }
      ]
    },
    {
      "attribute": "kitchen",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 3,
      "directSources": [
        "project"
      ],
      "statedRank": null,
      "corroboration": [
        "project"
      ],
      "repeated": false,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "project"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "notEstablished",
    "reason": "noSecondaryPreferenceEstablished",
    "candidates": [
      {
        "lever": "geography",
        "status": "vetoed",
        "veto": "fixedGeography",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: fixedGeography"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "lowRenovation",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: lowRenovation"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "personalizationNotEstablished",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: personalizationNotEstablished"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "kitchen",
        "status": "vetoed",
        "veto": "hardFiltered",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: hardFiltered"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "light",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "outdoor",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ],
    "missing": [
      "the personalization question was never answered, so finish could not be weighed"
    ]
  },
  "doNotFlex": [
    {
      "id": "doNotFlex.condition",
      "subject": "condition",
      "trace": {
        "layer": "derived",
        "because": [
          "map = fixed",
          "renovation = no"
        ],
        "sources": [
          "location",
          "project"
        ],
        "rules": [
          "fixedMapLowReno"
        ]
      }
    },
    {
      "id": "doNotFlex.geography",
      "subject": "geography",
      "trace": {
        "layer": "derived",
        "because": [
          "map = fixed"
        ],
        "sources": [
          "location"
        ],
        "rules": [
          "fixedMap"
        ]
      }
    }
  ],
  "skipFaster": [
    {
      "id": "reject.kitchen",
      "subject": "kitchen",
      "trace": {
        "layer": "derived",
        "because": [
          "kitchen = protect",
          "renovation = no"
        ],
        "sources": [
          "project",
          "project"
        ],
        "rules": [
          "finishProtectedLowReno"
        ]
      }
    }
  ],
  "secondLook": [],
  "showingTests": [],
  "doNotSubstitute": [],
  "expectedTradeoff": {
    "sideA": "light",
    "sideB": "outdoor",
    "ordering": "sideAWins",
    "why": "bothProtectedAndOrderedByForcedChoice",
    "confidence": "established",
    "trace": {
      "layer": "derived",
      "because": [
        "light = protect",
        "outdoor = protect",
        "forced choice: light over outdoor"
      ],
      "sources": [
        "tradeoff",
        "dealbreaker"
      ]
    }
  },
  "unresolved": [],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "light": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "outdoor": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "kitchen": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ],
      "attribute": true
    },
    "condition": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": true
    },
    "geography": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": false
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `t13_leverNotEstablished`
_fixed map and nothing else established: we never found what could move_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fixed",
    "project": "undecided",
    "personalization": "prefersItLeftAlone",
    "leverState": "notEstablished",
    "sizeRoute": null,
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = yes",
          "dayOneReadiness = no",
          "the follow-up is still open"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = no"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": []
      }
    }
  },
  "nonNegotiables": [],
  "flexOrder": {
    "state": "notEstablished",
    "reason": "insufficientEvidence",
    "candidates": [
      {
        "lever": "geography",
        "status": "vetoed",
        "veto": "fixedGeography",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: fixedGeography"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "vetoed",
        "veto": "unresolvedProject",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: unresolvedProject"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "noCosmeticAppetite",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noCosmeticAppetite"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "vetoed",
        "veto": "noStructuralRoute",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: noStructuralRoute"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ],
    "missing": [
      "they said it depends how much work, and the follow-up is still open"
    ]
  },
  "doNotFlex": [
    {
      "id": "doNotFlex.geography",
      "subject": "geography",
      "trace": {
        "layer": "derived",
        "because": [
          "map = fixed"
        ],
        "sources": [
          "location"
        ],
        "rules": [
          "fixedMap"
        ]
      }
    }
  ],
  "skipFaster": [],
  "secondLook": [],
  "showingTests": [
    {
      "id": "inspect.firstRejection",
      "subject": "exposure",
      "trace": {
        "layer": "derived",
        "because": [
          "no protected criterion",
          "a filter does not exist yet"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ],
        "rules": [
          "lowInformation"
        ]
      },
      "origin": "derived"
    }
  ],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [
    {
      "id": "firstFilter",
      "leverage": 1,
      "trace": {
        "layer": "derived",
        "because": [
          "no protected criterion established"
        ],
        "sources": [
          "dealbreaker",
          "daily"
        ]
      }
    }
  ],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "exposure": {
      "home": "showingTests",
      "referencedIn": [],
      "attribute": false
    },
    "geography": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ],
      "attribute": false
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": true
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

### `r2_sizeAdditionOkay`
_the same buyer, willing to add on if the property makes sense_

```json
{
  "version": 2,
  "searchPattern": {
    "map": "fewAreas",
    "project": "major",
    "personalization": "someChanges",
    "leverState": "identified",
    "sizeRoute": "additionOkay",
    "trace": {
      "map": {
        "layer": "buyerEvidence",
        "sources": [
          "location"
        ]
      },
      "project": {
        "layer": "derived",
        "because": [
          "renovationTolerance = yes",
          "dayOneReadiness = no",
          "structuralWorkOkay"
        ],
        "sources": [
          "project"
        ],
        "rules": [
          "projectPosture"
        ]
      },
      "personalization": {
        "layer": "derived",
        "because": [
          "personalizationAppetite = conditional"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
      },
      "sizeRoute": {
        "layer": "buyerEvidence",
        "sources": [
          "sizeRoute"
        ]
      }
    }
  },
  "nonNegotiables": [
    {
      "attribute": "size",
      "qualifier": null,
      "changeability": "realProject",
      "direct": 4,
      "directSources": [
        "tuesday",
        "dealbreaker"
      ],
      "statedRank": 1,
      "corroboration": [
        "tuesday",
        "dealbreaker"
      ],
      "repeated": true,
      "ordering": null,
      "trace": {
        "layer": "buyerEvidence",
        "sources": [
          "tuesday",
          "dealbreaker"
        ]
      }
    }
  ],
  "flexOrder": {
    "state": "identified",
    "reason": null,
    "candidates": [
      {
        "lever": "geography",
        "status": "available",
        "rank": 2,
        "trace": {
          "layer": "derived",
          "because": [
            "map = fewAreas"
          ],
          "sources": [
            "location"
          ],
          "rules": [
            "geographyLever"
          ]
        }
      },
      {
        "lever": "condition",
        "status": "available",
        "rank": 1,
        "trace": {
          "layer": "derived",
          "because": [
            "renovation = yes",
            "work is on the table"
          ],
          "sources": [
            "project"
          ],
          "rules": [
            "conditionLever"
          ]
        }
      },
      {
        "lever": "cosmeticFinish",
        "status": "vetoed",
        "veto": "limitedCosmeticAppetite",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: limitedCosmeticAppetite"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      },
      {
        "lever": "sizeRoute",
        "status": "available",
        "rank": 3,
        "trace": {
          "layer": "derived",
          "because": [
            "size = protect",
            "structuralWorkOkay",
            "sizeRoute = additionOkay",
            "the size may be created by adding on, subject to the property"
          ],
          "sources": [
            "tuesday",
            "dealbreaker",
            "project",
            "sizeRoute"
          ],
          "rules": [
            "sizeRouteLever"
          ]
        }
      },
      {
        "lever": "size",
        "status": "vetoed",
        "veto": "isDealbreaker",
        "trace": {
          "layer": "derived",
          "because": [
            "vetoed: isDealbreaker"
          ],
          "rules": [
            "leverDiagnosis"
          ]
        }
      }
    ]
  },
  "doNotFlex": [],
  "skipFaster": [],
  "secondLook": [
    {
      "id": "secondLook.smallerWithPotential",
      "subject": "size",
      "trace": {
        "layer": "derived",
        "because": [
          "size = protect",
          "sizeRoute = additionOkay",
          "undersized may still be a candidate"
        ],
        "sources": [
          "tuesday",
          "dealbreaker",
          "sizeRoute"
        ],
        "rules": [
          "sizeAdditionOkay"
        ]
      },
      "doesNotImply": [
        "sizeIsNegotiable",
        "expansionIsFeasibleHere"
      ]
    }
  ],
  "showingTests": [
    {
      "id": "inspect.expansionFeasibility",
      "subject": "size",
      "trace": {
        "layer": "derived",
        "because": [
          "sizeRoute = additionOkay",
          "feasibility is a property fact, not an appetite"
        ],
        "sources": [
          "tuesday",
          "dealbreaker",
          "sizeRoute"
        ],
        "rules": [
          "sizeAdditionOkay"
        ]
      },
      "origin": "derived"
    }
  ],
  "doNotSubstitute": [],
  "expectedTradeoff": null,
  "unresolved": [],
  "practicalProgram": [],
  "searchFacts": null,
  "discrepancies": [],
  "conceptIndex": {
    "size": {
      "home": "nonNegotiables",
      "referencedIn": [
        "showingTests",
        "flexOrder",
        "secondLook"
      ],
      "attribute": true
    },
    "geography": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": true
    },
    "cosmeticFinish": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    },
    "sizeRoute": {
      "home": "flexOrder",
      "referencedIn": [],
      "attribute": false
    }
  }
}
```

## 9. The seven handoff scenarios

### `A_fullySpecified` on `t1_strongMapLowRenoCosmetic`
_a fully specified active buyer: every field populated, no contradiction_

```json
{
  "searchFacts": {
    "price": {
      "targetMin": 1600000,
      "targetMax": 2100000,
      "hardCeiling": 2250000
    },
    "timing": {
      "posture": "active",
      "note": "Lease ends in March and we would rather not renew."
    },
    "geography": {
      "considering": [
        "Mar Vista",
        "Culver City",
        "Playa del Rey"
      ],
      "ruledOut": [
        "anything east of La Brea"
      ]
    },
    "destinations": [
      "my office in El Segundo"
    ],
    "propertyBasics": {
      "types": [
        "single family"
      ],
      "minBeds": 3,
      "minBaths": 2,
      "minSqft": 1600
    },
    "hardFilters": {
      "parking": "required",
      "stairs": "preferMinimal",
      "pool": "noPreference",
      "ev": "preferred"
    },
    "buyerNote": "We have looked at about fifteen houses in person already."
  },
  "discrepancies": []
}
```

### `B_schoolBoundary` on `fixedMap`
_a school boundary, recorded verbatim, with no reason asked and none inferable_

```json
{
  "searchFacts": {
    "schoolBoundary": "Needs to stay inside the Westwood Charter attendance boundary.",
    "geography": {
      "considering": [
        "Westwood",
        "Century City adjacent"
      ]
    }
  },
  "discrepancies": []
}
```

### `C_regularDestination` on `fewAreasMap`
_a regular destination as free text, with no category and no reason_

```json
{
  "searchFacts": {
    "destinations": [
      "the dialysis centre on Sawtelle",
      "my mother in Sherman Oaks"
    ],
    "timing": {
      "posture": "thisYear"
    }
  },
  "discrepancies": []
}
```

### `D_poolDiscrepancy` on `t3_outdoorPoolConcern`
_named pool upkeep as a burden in the test, then required a pool here_

```json
{
  "searchFacts": {
    "hardFilters": {
      "pool": "required"
    },
    "propertyBasics": {
      "minBeds": 4
    }
  },
  "discrepancies": [
    {
      "kind": "structuredConflict",
      "testEvidence": "upkeep qualifier = pool",
      "handoffFact": "hardFilters.pool = required",
      "status": "needsClarification",
      "trace": {
        "layer": "derived",
        "because": [
          "upkeep = protect",
          "qualifier = pool"
        ],
        "sources": [
          "daily",
          "handoff"
        ]
      }
    }
  ]
}
```

### `E_silentOnPool` on `t3_outdoorPoolConcern`
_the same test answers with the handoff silent on pools: absence is never a conflict_

```json
{
  "searchFacts": {
    "propertyBasics": {
      "minBeds": 4
    },
    "hardFilters": {
      "pool": "noPreference"
    }
  },
  "discrepancies": []
}
```

### `F_severalAreas` on `fixedMap`
_a fixed map in the test and several areas listed here: NOT a discrepancy_

```json
{
  "searchFacts": {
    "geography": {
      "considering": [
        "Silver Lake",
        "Los Feliz",
        "Atwater Village",
        "Echo Park",
        "Highland Park"
      ]
    }
  },
  "discrepancies": []
}
```

### `G_projectNote` on `turnkey`
_a settled no-renovation posture and a note that explicitly mentions gutting it_

```json
{
  "searchFacts": {
    "buyerNote": "Honestly if the price were right we would consider gutting the kitchen.",
    "timing": {
      "posture": "casual"
    }
  },
  "discrepancies": [
    {
      "kind": "freeTextMayConflict",
      "testEvidence": "renovationTolerance = no",
      "handoffFact": "buyer note mentions major work",
      "quote": "Honestly if the price were right we would consider gutting the kitchen.",
      "status": "needsClarification",
      "trace": {
        "layer": "derived",
        "because": [
          "renovation = no",
          "note contains \"gut\"",
          "free text, quoted rather than interpreted"
        ],
        "sources": [
          "project",
          "handoff"
        ]
      }
    }
  ]
}
```


## 10. The three approved corrections

### Q5 personalization: the middle band

The deltas are now +3 / 0 / -2 / -3. Against the scale's own range of [-3, +3]:

| answer | delta | normalised | band | posture |
|---|---|---|---|---|
| All of it. Paint, paper, lighting, the lot. | +3 | 1.000 | `yes` | `wantsToMakeItTheirs` |
| Some. I'd change what bothers me and live with the rest. | 0 | 0.500 | `conditional` | `someChanges` |
| Not much. If it's done well I'd rather leave it alone. | -2 | 0.167 | `no` | `prefersItLeftAlone` |
| I'd rather buy it finished and not think about it. | -3 | 0.000 | `no` | `prefersItLeftAlone` |

Thresholds are 0.62 and 0.38, so all three bands are now reachable and "some"
sits in the middle rather than reading as the maximum.

What `conditional` does NOT produce, enforced by test: the cosmetic-finish
lever, a second look on a cosmetically plain house, or any do-not-flex on
finish. The lever is vetoed with a new reason, `limitedCosmeticAppetite`, kept
separate from `noCosmeticAppetite` because "I'd change what bothers me" is a
real position and not a refusal.

`low` still establishes nothing about renovation: neither low answer touches
the renovation scale, and a test asserts the band stays `unset` when the
project question was not answered.

Across 844,800 fully answered paths the posture now splits 25% / 25% / 50%,
where before "some" and "all of it" were one bucket of 50%.

### The size-route conditional

Asked only when `size` is protect-level AND `structuralWorkOkay` is true. Not
on general renovation tolerance: `project: fixable` gives a high renovation
band without accepting structural work, and a buyer who never protected size
is never asked how they would reach a size they did not ask for. Live on 3.64%
of fully answered paths. The `depends` follow-up keeps precedence, though the
two cannot both be live since `further` and `depends` are different answers to
one question.

The four options carry **no attribute weight and no scale delta**. They set one
stance each and nothing else, so `size` stays protected at exactly the same
strength, from the same sources, at the same stated rank, on every route. No
option creates an `expansion` attribute, and `expansion` is still absent from
the taxonomy. Tests assert all of this per route.

| route | filter | lever | second look | showing test |
|---|---|---|---|---|
| unanswered | none | `sizeRoute` available, route unsettled | none | `inspect.expansionFeasibility` |
| `existingOnly` | `reject.undersized` on `size` | vetoed: `sizeMustExistAlready` | none | none |
| `additionOkay` | none | available | `secondLook.smallerWithPotential` | `inspect.expansionFeasibility` |
| `reconfigureOkay` | none | available | `secondLook.badlyArrangedNotSmall` | `inspect.areaCanBeRearranged` |
| `propertySpecific` | none | available | none | `inspect.sizeSolvableHere` |

The guardrails are carried in `doesNotImply`, not in prose:
`smallerWithPotential` does not imply `expansionIsFeasibleHere` (appetite is
established, feasibility is a property fact), and `badlyArrangedNotSmall` does
not imply `insufficientAreaIsAcceptable`. Neither implies `sizeIsNegotiable`.
`existingOnly` additionally carries `hold.sizeRoute`: never kept as a candidate
on the assumption it can be enlarged later.

One behaviour change worth noting. Before the conditional existed,
`secondLook.smallerWithPotential` fired for every size-plus-structural buyer.
It no longer does while the route is unsettled, because keeping an undersized
house in play assumes they would add on, which is the thing the follow-up
establishes rather than guesses. `structuralBuilder` lost that second look as a
result, and `mustSpaceExistAlready` remains its unresolved item until it is
answered.

`sizeMustExistAlready` is the one new veto that counts towards `closed`,
because it can only ever come from an answered question.

### Site showing tests

`site` is protect-at-purchase and had no in-person check at all, which was the
gap reported last round. Now `inspect.siteFit`, exactly one finding per result,
on every qualifier and with none.

The repo's qualifier ids differ slightly from the ones in your note. The
meanings are identical and the ids are kept because they are already in the
serialization:

| your note | repo id | what to inspect |
|---|---|---|
| `site:land` | `site:land` | the slope, the shape and which parts of the land are usable |
| `site:siting` | `site:sits` | how the house actually sits on the property |
| `site:neighbors` | `site:neighbours` | the physical relationship to the neighbouring structures |
| `site:access` | `site:access` | the arrival, the driveway and how the property is entered |
| `site:all` | `site:whole` | the site as one thing, not as four separate checks |
| no qualifier | none | the overall site fit |

`whole` stays one finding. A test asserts it never names any of the four
specifics, because the buyer gave one answer and splitting it would turn one
signal into four separate concerns.

What the evidence licenses is "this has to be looked at", and the action says so
outright: every one carries the fact "this needs evaluating in person, and
nothing here says a problem exists". A test scans every string the brief
produces for assertive language (bad, poor, steep, difficult, too close, wrong,
unusable, compromised and the rest) and fails on any of it. The origin is
`buyerEvidence`, because the buyer named the site themselves.

## 11. Partial completions still cannot generate a veto

Kept and extended. Four veto reasons assert a position, and each is now mapped
to the question that must have been answered for it to exist:

| veto | requires an answer to |
|---|---|
| `lowRenovation` | `project` |
| `noCosmeticAppetite` | `personalization` |
| `limitedCosmeticAppetite` | `personalization` |
| `sizeMustExistAlready` | `sizeRoute` |

The test brute-forces 1,200 partial-completion paths and fails if any of those
reasons appears without its question. A second test asserts that `BUYER_CLOSED`
and the measurement-gap list stay disjoint, so a reason can never both mean the
buyer closed a route and be reachable by never asking.

`unset` still produces `renovationNotEstablished` and
`personalizationNotEstablished`, neither of which can contribute to `closed`,
and `closed` still requires every route to have been measured.

## 12. Distribution after the changes

844,800 fully answered paths:

| lever state | before | after |
|---|---|---|
| `identified` | 87.92% | 81.88% |
| `closed` | 10.00% | 15.00% |
| `notEstablished` | 2.08% | 3.13% |

The shift is the personalization fix. Buyers who said "some" were previously
handed the cosmetic-finish lever they had not licensed; those results now fall
through to whatever else is eligible. The closure is still attributed only to
earned vetoes, since `limitedCosmeticAppetite` is deliberately not in
`BUYER_CLOSED`.

## 13. Test count

383, up from 342 at the start of this round and 298 before the brief contract.
All passing, with lint, typecheck and build clean.

| file | tests | new this round |
|---|---|---|
| `lib/tuesday/v2/sizeroute.test.ts` | 21 | 21 |
| `lib/tuesday/v2/site.test.ts` | 10 | 10 |
| `lib/tuesday/v2/bands.test.ts` | 7 | 7 |
| `lib/tuesday/v2/brief.test.ts` | 42 | 2 |
| `lib/tuesday/v2/strategy.test.ts` | 42 | 1 |
| rest of `lib/tuesday/v2/` | 100 | unchanged |
| `lib/tuesday/` (V1) | 75 | unchanged |
| rest of `lib/` | 86 | unchanged |
| **total** | **383** | **+41** |

Eight fixtures were added: the four size routes, the personalization middle
band, and three site cases (a specific qualifier, the bundled whole, and the
qualifier skipped).

## 14. V1 is untouched

`git diff` against `lib/tuesday/model.ts`, `score.ts`, `questions.ts`,
`interpret.ts`, `read.ts`, `showing.ts`, `brief.ts`, `encode.ts`, `hero.ts`,
and against `components/`, `app/`, `lib/essays/`, `lib/config.ts` and
`lib/content/`, is empty for the whole of the V2 work. Every shared V1 link
still reads through the V1 interpreter.

**One thing to be aware of for the future.** The personalization change alters
what an existing V2 payload means: a link carrying `p.some` now scores
differently than it would have yesterday. That is safe only because V2 has
never been on screen, so no V2 link exists anywhere. Once the V2 instrument
ships, a scoring change of this kind requires a version bump rather than an
edit, for exactly the reason the versioning exists.

## 15. Frozen

As of this change, frozen: the V2 instrument, V2 scoring and evidence,
provenance, the adaptive tradeoff, the strategy layer, and this brief contract.

Changes to these layers from here need a genuine correctness bug, not a copy
preference. If the reader-facing brief wants something the structure does not
carry, the answer is a renderer that composes what is here, or a documented
defect, not a quiet re-tune.
