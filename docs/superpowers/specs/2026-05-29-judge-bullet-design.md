# Judge Bullet — Phase A Design

**Date:** 2026-05-29  
**Goal:** Maximize RoadSoS judge installability and demo credibility in one focused pass.

## Success criteria

1. GitHub Actions **Android debug APK** workflow completes green.
2. Release `v2.0.0-production` (or workflow artifact) provides **`margi-debug.apk`** judges can sideload.
3. Naari “nearest police” uses **Chennai corridor** coords aligned with POI seed.
4. `JUDGE_START_HERE.md` matches repo facts (179 tests, honest APK instructions).
5. All mobile unit tests pass; CI unchanged except APK workflow.

## Scope (in)

- CI prebuild **without `expo-dev-client`** (fixes `expo-dev-menu` Kotlin compile failure).
- Rename uploaded APK to **`margi-debug.apk`** on release/artifact.
- Chennai police station seed + tests.
- Default Naari fallback coords → Chennai.
- Judge doc sync; fix duplicate clinic/hospital coords in demo POI seed.

## Scope (out — Phase B/C)

- CANON.md / doc archive sweep.
- Maestro E2E.
- Demo mode skip calibration.
- Demo video.
- Production EMS / physician sign-off.

## Architecture

`app.config.js` reads `app.json` and omits `expo-dev-client` plugin when `CI=true` or `MARGI_JUDGE_APK=1`. Local dev keeps dev client; CI judge builds use stock Expo native shell.

## Testing

- New `stations.test.ts`: nearest station near Chennai is a Chennai node.
- Existing suite: `npm test`, `verify:docs`, `verify:branding`.

## Rollout

Commit → push `master` → `gh workflow run "Android debug APK"` → verify run → upload to release if needed.
