# Changelog

All notable changes to the NovaDrive monorepo (IIT Madras Road Safety Hackathon 2026, RoadSoS).

## [2026-05-23] — Stabilization & GovTech UI

### Added

- **GovTech mobile shell:** Home, Trip (Plan Corridor), Community, Profile tabs with navy/saffron design tokens.
- **Drive flow screens:** Plan Corridor map + route cards, route calibration (`journey/depart`), live SOS HUD (`journey`) aligned to Stitch references.
- **Shared** [`PlanCorridorScreen`](novadrive-mobile/src/components/PlanCorridorScreen.tsx) for Trip tab; offline briefing deep link at `trip/plan` and `trip/discover`.
- **Safety:** `JourneyVoiceMonitor`, `SafetyMonitorBridge`, panic voice engine, journey logging.
- **Tests (32):** `parseEmergencyText`, `ghp`, `storage`, `journeyMonitoring`, `crashEngine`, `panicVoiceEngine`, `startTriageFSM`.
- **Scripts:** `npm run typecheck`, `test:watch`, `test:coverage` in `novadrive-mobile`.
- **Docs:** stabilization design spec, implementation plan, [device smoke matrix](novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md).

### Fixed

- Profile tab routing (`/(tabs)/profile`); settings gear opens `/settings` (not Profile).
- Journey end resets to `IDLE`, clears planned destination, speed, crash/panic engine state.
- Location permission denial shows alert; journey does not enter `ACTIVE`.
- Calibration cancel race: `mountedRef` / `cancelledRef`; cancel calls `endJourney`.
- Profile motion calibration uses `?calibrateOnly=1` (no journey start).
- Voice mic gated by `settings.voiceCrashDetection` only (not default `voiceCommand`).
- Impact alerts require active journey **and** app foreground.
- Distress modal: no backdrop/back dismiss; explicit **I am okay** / **I need help** only.
- `triggerSOS` no-op unless journey already `ACTIVE`.
- `settings.sosSensitivity` scales crash detection thresholds.

### Changed

- Home **ENTER DRIVE MODE** → Trip Plan Corridor (journey starts on **Start Driving** only).
- Journey complete thank-you copy points to Home.

---

## [Earlier] — P0 foundation

- Expo SDK 54 app, START triage FSM, SQLite trauma-tier routing, GHP + QR relay, guest onboarding.
- Monorepo CI (mobile tests, web build, docs site build).
- Team brief site on Vercel.
