# README & GitHub documentation refresh

**Date:** 2026-05-26  
**Status:** Approved for implementation  
**Scope:** Documentation only — no app code changes

## Audience

Balanced presentation:

- **Judges (first fold):** What NovaDrive does, two safety lanes (Golden Hour drive flow vs Naari Shakti), honest demo limits, quick paths to run the app and optional Naari beat.
- **Developers (below):** Monorepo layout, commands, architecture links, contributing pointers.

## Messaging pillars

1. **Offline Golden Hour** — START triage, trauma-tier routing, GHP, QR relay when signal fails on NH corridors.
2. **Naari Shakti (parallel lane)** — Gender-gated women's safety portal; silent SMS, live location, helpline 181, hold-to-activate distress. **Not** a replacement for START/GHP or Quick SOS.
3. **Honest scope** — Self-reported gender (unverified in P0); SMS opens OS composer (user taps Send); no auto-dial at crash countdown zero; sensor fusion crash detection, not OS crash APIs.

## Source of truth (code)

| Topic | Files |
|-------|--------|
| Home stack | `novadrive-mobile/src/components/home/HomePrimaryStack.tsx`, `explore.tsx` |
| Protocol copy | `NaariShaktiProtocolModal.tsx` — "Unverified female user detected" |
| Emergency activation | `NaariEmergencyButton.tsx`, `NaariShaktiContext.tsx` |
| Eligibility | `src/lib/naariShakti/eligibility.ts` |

## Files to update

| File | Changes |
|------|---------|
| `README.md` | Two-lane diagram; Naari home stack; recent commits; monorepo tree |
| `novadrive-mobile/README.md` | Features, Naari flow, quick test, demo notes |
| `CHANGELOG.md` | `c828e90` UI + emergency reliability section |
| `docs/VERSION_HISTORY.md` | Commits `d900ab5`, `f8f6dce`, `c828e90`; tag `v1.3.0-naari-shakti` |
| `docs/SUBMISSION.md` | Naari deliverable; optional demo beat; Home → Trip wording |
| `novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md` | Rows 13–15 Naari flows |

**Out of scope:** PR/issue templates, new Stitch prompts, `banner-light.svg` encoding, `git push`.

## Acceptance criteria

- Judge understands Naari vs Golden Hour in under 30 seconds from root README.
- Mobile README quick test matches shipped behavior (Safety Mode ON, single 2s hold).
- CHANGELOG and VERSION_HISTORY reference commit `c828e90`.
- SUBMISSION and smoke matrix include Naari paths.
- Terminology: **unverified / self-reported** female user — not "verified".

## Release tag (documented, optional local create)

```bash
git tag -a v1.3.0-naari-shakti -m "Naari Shakti portal + home stack + emergency activation fix"
```

Tip commit: `c828e90`.
