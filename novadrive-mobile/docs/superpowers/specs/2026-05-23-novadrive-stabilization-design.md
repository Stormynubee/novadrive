# NovaDrive Stabilization Design Spec

**Date:** 2026-05-23  
**Status:** Implemented (phased rollout)  
**Product flow (unchanged):** Home → Trip (Plan Corridor) → Start Driving → Calibration → Live SOS HUD → Journey complete → Home

## Goals

- Fix critical routing, journey lifecycle, voice/mic, and distress-modal bugs without changing product intent.
- Add unit tests and CI gates for safety-critical `src/lib` logic.
- Reduce UI drift via shared Plan Corridor screen and Stitch-aligned copy.

## Phase 1 — Critical correctness

| Area | Behavior |
|------|----------|
| Tab routing | Profile tab uses `/(tabs)/profile`; Trip active state no longer treats `/home` as Trip. |
| Journey end | `endJourney` / `finishJourney` reset to `IDLE`, clear destination, speed, crash/panic engine state. |
| Location | Denied permission shows alert; journey does not enter `ACTIVE`. |
| Calibration cancel | `depart.tsx` uses cancel/mounted refs; cancel calls `endJourney` and ignores late `startJourney`. |
| Profile calibration | `?calibrateOnly=1` runs animation only; no journey start. |
| Voice mic | `shouldEnableVoiceMonitoring(settings)` — not coupled to `a11y.voiceCommand`. |
| Impact alerts | Gated on active journey **and** foreground (same policy as voice). |
| Distress modal | No backdrop/back dismiss; only **I am okay** / **I need help**. |
| SOS from HUD | `triggerSOS` no-op unless journey already `ACTIVE`. |

## Phase 2 — Tests and CI

- Scripts: `typecheck`, `test:watch`, `test:coverage`.
- Jest: modern `transform` config; `*.test.ts` included in `tsc`.
- New suites: `parseEmergencyText`, `ghp`, `storage`, `journeyMonitoring`, expanded `startTriageFSM`, `thresholdsForSensitivity` in `crashEngine`.
- `settings.sosSensitivity` scales crash thresholds via `thresholdsForSensitivity`.
- GitHub Actions: `typecheck && npm test` on push/PR.

## Phase 3 — Structure and polish

- `PlanCorridorScreen` shared by Trip tab (`drive.tsx` wrapper).
- `trip/plan` links to `trip/discover`; empty briefing state links discovery.
- `accessibility?fromProfile=1` returns to profile like medical.
- Device smoke matrix: `docs/DEVICE_SMOKE_MATRIX.md`.

## Stitch references

- Plan Corridor: `plan_corridor_route_planning/code.html`
- Calibration: `nova_drive_centered_route_calibration/code.html`
- Live HUD: `main_app_driving_sos_dashboard/code.html`

## Out of scope

- Real map tiles / routing APIs, backend auth, full RN component test suite.
