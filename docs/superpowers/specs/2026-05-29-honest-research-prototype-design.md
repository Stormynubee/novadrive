# Honest Research Prototype — Phase B Design

**Date:** 2026-05-29  
**Goal:** One canonical truth narrative for Margi as a **research / hackathon prototype**, not overstated production medical software.

## Success criteria

1. **`docs/CANON.md`** is the single entry point for architecture, scope, and honesty boundaries.
2. Key public docs (`README`, `SUBMISSION`, `JUDGE_START_HERE`, `PHASE3_SETUP`) use **research prototype** language — not “production medical” framing.
3. **`MARGI_MASTER_BRIEF.md`** carries a visible banner: PWA/sql.js sections are **historical planning**, superseded by native Expo app per CANON.
4. **`docs/archive/README.md`** indexes aspirational / duplicate docs without mass file moves.
5. **`facilitiesDb.test.ts`** covers triage-tier filtering and demo seed metadata (TDD).
6. **Five Maestro smoke flows** checked in under `novadrive-mobile/.maestro/` with runbook `docs/MAESTRO_SMOKE.md` (local device/emulator; not CI-blocking).

## Out of scope (Phase C)

- Physician sign-off, real POI ingest, EMS integration, iOS ship, legal review.

## Architecture

CANON is the hub; judge entry (`JUDGE_START_HERE`) and submission checklist link to it. Historical briefs remain for team context but are labeled archived. Tests extend lib coverage; Maestro documents device smoke paths already in `DEVICE_SMOKE_MATRIX.md`.

## Testing

- Jest: new `facilitiesDb.test.ts`; full `npm test` + `verify:docs` + `verify:branding`.
- Maestro: manual `maestro test .maestro/` when APK installed (documented, not CI).
