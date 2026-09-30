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
    trace: Record<'map' | 'project' | 'personalization', Trace>
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
  conceptIndex: Record<string, { home: string; referencedIn: string[] }>
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

Three changes to the shape you proposed, each for a reason:

**`LeverEntry` has three statuses, not two.** `vetoed` is a finding about the
buyer. `notSelected` is a fact about us: it could move, better levers existed,
we do not lead with it. Reporting the second as the first is how our own
ranking starts reading as the buyer's inflexibility.

**`NonNegotiable.reinforcedBy`.** You said do not mirror every non-negotiable
into `doNotFlex`. Some strategy rules independently conclude do-not-flex on
something already protected. The entry is dropped and its trace folded into the
attribute, so the reasoning survives without a second heading.

**`searchPattern.trace`.** A posture is a conclusion, so it names its evidence.

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
8. `conceptIndex` is computed last, over the finished brief.

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
  no record of which one describes it.

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

| | `twoDealbreakers` | `turnkey` | `structuralBuilder` | `t1_strongMapLowRenoCosmetic` | `t3_outdoorPoolConcern` | `t9_rankOneWinsQ8` | `t13_leverNotEstablished` |
|---|---|---|---|---|---|---|---|
| **filter in the search tool** | _empty_ | condition, layout, publicRooms | _empty_ | kitchen, publicRooms | upkeep | kitchen | _empty_ |
| **use as a lever** | 1. geography | _empty_ | 1. cosmeticFinish, 2. condition, 3. sizeRoute | 1. cosmeticFinish, 2. geography | 1. geography | _empty_ | _empty_ |
| **not compromise** | privacy, light | condition, layout, publicRooms, geography | separation, size, site | light, publicRooms, kitchen, condition | outdoor, upkeep | light, outdoor, kitchen, condition, geography | geography |
| **cannot screen, needs a showing** | _empty_ | _empty_ | size, separation | _empty_ | outdoor, upkeep:pool | _empty_ | exposure |
| **deserves a second look** | _empty_ | _empty_ | datedButSound, smallerWithPotential | cosmeticallyPlain | _empty_ | _empty_ | _empty_ |
| **still unresolved** | _empty_ | whatWouldGive | mustSpaceExistAlready | whatWouldGive | renovationAppetite | the personalization question was never answered, so finish could not be weighed | firstFilter, they said it depends how much work, and the follow-up is still open |
| **needs clarification** | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ | _empty_ |

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
      ]
    },
    "light": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ]
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": []
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
      ]
    },
    "layout": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ]
    },
    "publicRooms": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ]
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
    "personalization": "wantsToMakeItTheirs",
    "leverState": "identified",
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
          "personalizationAppetite = yes"
        ],
        "sources": [
          "personalization"
        ],
        "rules": [
          "personalizationPosture"
        ]
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
        "rank": 2,
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
        "status": "available",
        "rank": 3,
        "trace": {
          "layer": "derived",
          "because": [
            "size = protect",
            "structuralWorkOkay",
            "the size may be created rather than found"
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
  "secondLook": [
    {
      "id": "secondLook.datedButSound",
      "subject": "condition",
      "trace": {
        "layer": "derived",
        "because": [
          "cosmetic = yes",
          "renovation = yes"
        ],
        "sources": [
          "personalization",
          "project"
        ],
        "rules": [
          "persHighRenoHigh"
        ]
      },
      "doesNotImply": [
        "acceptingABadPlan",
        "acceptingACompromisedSite"
      ]
    },
    {
      "id": "secondLook.smallerWithPotential",
      "subject": "size",
      "trace": {
        "layer": "derived",
        "because": [
          "size = protect",
          "structuralWorkOkay"
        ],
        "sources": [
          "tuesday",
          "dealbreaker",
          "project"
        ],
        "rules": [
          "sizeStructural"
        ]
      },
      "doesNotImply": [
        "sizeIsNegotiable"
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
          "sizeStructural"
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
          "structuralWorkOkay"
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
      ]
    },
    "size": {
      "home": "nonNegotiables",
      "referencedIn": [
        "showingTests",
        "flexOrder",
        "secondLook"
      ]
    },
    "site": {
      "home": "nonNegotiables",
      "referencedIn": [
        "practicalProgram",
        "flexOrder"
      ]
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": [
        "secondLook"
      ]
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
      ]
    },
    "publicRooms": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ]
    },
    "kitchen": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ]
    },
    "condition": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ]
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
      ]
    },
    "upkeep": {
      "home": "nonNegotiables",
      "referencedIn": [
        "practicalProgram",
        "showingTests",
        "skipFaster",
        "flexOrder"
      ]
    },
    "condition": {
      "home": "flexOrder",
      "referencedIn": []
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
      ]
    },
    "outdoor": {
      "home": "nonNegotiables",
      "referencedIn": [
        "flexOrder"
      ]
    },
    "kitchen": {
      "home": "nonNegotiables",
      "referencedIn": [
        "skipFaster",
        "flexOrder"
      ]
    },
    "condition": {
      "home": "doNotFlex",
      "referencedIn": [
        "flexOrder"
      ]
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
    "condition": {
      "home": "flexOrder",
      "referencedIn": []
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

## 10. What this phase found

Building the brief exposed four defects in layers that were otherwise frozen.
All four are fixed and covered by regression tests. The first is the serious
one.

### A gap in our questioning was being reported as the buyer refusing

`closed` is supposed to mean the buyer's own answers shut every route.
`diagnoseLever` reached it whenever ANY route was closed by an answer, even
with other routes never measured at all. Two things fed it:

- an unanswered renovation question produced the veto `lowRenovation`
- an unanswered personalization question produced `noCosmeticAppetite`

Both are claims about a buyer who was never asked. Both counted towards
`closed`. So a buyer who named two dealbreakers and a fixed map, and then
stopped, was reported as having closed the search.

Fixed three ways: two new veto reasons, `renovationNotEstablished` and
`personalizationNotEstablished`, that say what is true; a `NOT_MEASURED` list
that can never contribute to `closed`; and `closed` now requiring that every
route was actually measured.

Measured over 33,000 paths that include partial completions, **13.19% of all
paths carried a no-lever result mislabelled as `closed`**. It lands wherever
the project or personalization question is unanswered. The fully answered space
is unchanged: 87.92% `identified`, 10.00% `closed`, 2.08% `notEstablished` over
844,800 paths, and `turnkey` remains the one fixture legitimately `closed`.

This is the exact conflation the three-state model was built to end. The
earlier lever audit missed it because it measured whether a lever was *found*,
never whether a veto was *earned*.

### A strategy rule contradicted the diagnosis it is checked against

`geographyLever` offered geography as a lever for a `propertyLed` buyer.
`diagnoseLever` vetoes that same case as `geographyAlreadyOpen`. The two
disagreed silently because the only test was that an `identified` diagnosis
produced *some* lever.

The diagnosis is right: a property-led buyer already told us the area is open,
so "give on geography first" is their own answer read back, with no constraint
left to trade. The rule now excludes `propertyLed`, and a new test asserts that
no rule ever offers a lever the diagnosis vetoed.

### `practicalProgram` dropped the signals it exists to carry

It was sourced from protect-level attributes only, so in
`twoBundledQualifiers` it printed protected `utility` while dropping
`upkeep:pool` at scrutinize level, which is precisely the one-off practical
signal the section is for. Now sourced from every established functional or
qualified need.

### Levers we simply did not lead with were reported as vetoed

`separation` was eligible in two fixtures and never offered, because three
better levers existed. The brief called it `vetoed`, which reads as the buyer
ruling it out. Hence the third status.

## 11. One defect left open, for your decision

I have not touched this, because fixing it means re-tuning a scale you
approved.

**The personalization band's middle value is arithmetically unreachable.**
`personalizationAppetite` is moved by one question with four options:

| answer | delta | normalised | band |
|---|---|---|---|
| All of it. Paint, paper, lighting, the lot. | +3 | 1.000 | `yes` |
| Some. I'd change what bothers me and live with the rest. | +1 | 0.667 | `yes` |
| Not much. If it's done well I'd rather leave it alone. | -2 | 0.167 | `no` |
| I'd rather buy it finished and not think about it. | -3 | 0.000 | `no` |

The thresholds are 0.62 and 0.38, so nothing can land between them.
`conditional` never occurs, and "some" is scored identically to "all of it".
Every rule that fires on personalization high, including offering cosmetic
finish as the first lever, treats those two buyers as the same person.

Verified by brute force over the whole answer space. `renovationTolerance`
reaches `conditional` legitimately; `personalizationAppetite` cannot.

Three ways out, in order of how much they disturb what you approved:

1. **Re-space the deltas** to +3 / 0 / -2 / -3, which puts "some" at 0.5 and
   inside `conditional`. One line, no wording change, no new question.
2. **Leave the scale and stop the overclaim downstream** by treating band `yes`
   as "will change things" without letting it alone select cosmetic finish as
   the first lever.
3. **Leave it.** Defensible if you think "I'd change what bothers me" really
   does mean finish is the first thing to give.

I would take 1.

The brief already refuses to overclaim on its own account: the posture is named
`wantsToMakeItTheirs`, not `high`, and its trace records the band and the
question, so nothing downstream can quietly upgrade "some" into a magnitude the
evidence cannot support.

## 12. What the Tuesday Test cannot supply, and the brief clearly needs

Ranked by how much each one changes the search. None of these is guessable, and
none should be inferred.

1. **Price, and the difference between a target and a ceiling.** Nothing else
   determines what is worth showing. Handoff field, already in the schema.
2. **Actual geography.** `fewAreas` and `strongPreference` are postures. The
   areas themselves are only ever the buyer's own words. Handoff field.
3. **Timing.** "Active" and "casual" run completely different searches and the
   test never asks. Handoff field.
4. **Minimum bedrooms, baths, square footage, property type.** The test
   measures what matters about a house, not its specification. Handoff field.
5. **Whether the protected size has to exist now.** `mustSpaceExistAlready`
   surfaces in `unresolved` for the structural buyers; nothing in the test
   settles it, and the answer changes which listings are even candidates.
   Not a handoff field. Would need either a question or Danielle asking.
6. **Market facts of any kind.** Layer C is empty and must stay empty until a
   real data source exists. The brief asserts nothing about rarity, value,
   inventory or what a kind of house "tends" to have, and a test enforces that
   against the whole assembled JSON.
7. **Anything a photograph cannot carry.** `showingTests` names these but
   cannot resolve them. That is the section working correctly.

Two gaps in what the *instrument* establishes, distinct from the above:

- **The renovation and personalization questions are skippable**, and skipping
  them is what produced the mislabelling in section 10. The brief now reports
  the gap honestly. Whether those two questions should be required is a
  product decision, not a code one.
- **`site` has no showing test.** It is protected in two fixtures, described
  only as a non-negotiable, and how a house sits on its lot is close to the
  definition of something you cannot screen from a listing.

## 13. Test count

342, up from 298. All passing, with lint, typecheck and build clean.

| file | tests | new |
|---|---|---|
| `lib/tuesday/v2/brief.test.ts` | 40 | 40: layers, traces, dedup, fair housing, discrepancies, the flex order |
| `lib/tuesday/v2/strategy.test.ts` | 41 | 4: rule/diagnosis agreement, silence never blames the buyer, `closed` requires measurement |
| rest of `lib/tuesday/v2/` | 100 | unchanged |
| `lib/tuesday/` (V1) | 75 | unchanged |
| rest of `lib/` | 86 | unchanged |
| **total** | **342** | **+44** |

V1 is untouched. `git diff` against every V1 file, `components/` and `app/` is
empty, so every shared V1 link still reads through the V1 interpreter.
