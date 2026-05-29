# START triage — medical review record

Margi implements the public **START** (Simple Triage and Rapid Treatment) decision tree as a deterministic finite-state machine in [`novadrive-mobile/src/lib/startTriageFSM.ts`](../novadrive-mobile/src/lib/startTriageFSM.ts).

## Status (hackathon build)

| Item | Status |
|------|--------|
| Physician / trauma trainer sign-off | **Pending** — not obtained for v2.0.0 |
| NDRF curriculum crosswalk | **Not performed** |
| ATLS alignment review | **Not performed** |
| In-app medical disclaimer | **Implemented** — triage + activation screens |

## References (public)

- [START triage (Wikipedia)](https://en.wikipedia.org/wiki/START_triage)
- India emergency dial **108** / **112**

## Intended use

Decision support for conscious bystanders and drivers when professional responders are unavailable. **Not** a substitute for trained EMS triage.

## Sign-off (fill when obtained)

| Reviewer | Role | Date | Notes |
|----------|------|------|-------|
| _TBD_ | Emergency physician / certified first-aid trainer | | |

When signed, attach reviewer name to SUBMISSION.md and remove "pending" language from judge docs.
