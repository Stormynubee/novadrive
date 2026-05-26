# Changelog

All notable changes to the NovaDrive monorepo (IIT Madras Road Safety Hackathon 2026, RoadSoS).

**Full commit-by-commit history with tags and fork link:** [docs/VERSION_HISTORY.md](docs/VERSION_HISTORY.md)

## [2026-05-26] — Naari Shakti UI & emergency reliability

### Fixed

- **Emergency help** activates on the **first** 2s hold — instant distress HUD, cached/prefetched GPS (`getLastKnownPositionAsync`), hold timer with release grace (no pressOut race).
- Portal bento layout uses column stack so citizen status and nearest safety point text no longer overlap.

### Changed

- **Home dashboard:** `DriveModeCard`, `NaariShaktiPortalButton`, `HomePrimaryStack` — stacked ENTER DRIVE MODE + NAARI SHAKTI (female only); full-width Bystander QR; Map View tile.
- Protocol modal copy: *Unverified female user detected*.
- Sarthi FAB lifted on Home; hidden on `naari-shakti` route.

---

## [2026-05-26] — Naari Shakti women's safety portal

### Added

- **Gender on profile:** `GenderIdentity` on `UserProfile`; required on medical onboarding, optional on auth.
- **Naari Shakti portal:** Home entry (female only), protocol enable modal, full dashboard at `app/naari-shakti.tsx`.
- **Distress engine:** 2s hold-to-activate — GPS, TTS help cue, `expo-audio` emergency recording, SMS to nearest police station, ICE community alert, distress HUD.
- **Quick actions:** SMS nearest station, share live location, women's helpline **181**, safety mode toggle, quick help presets.
- **Tests (6 new suites):** `src/lib/naariShakti/*.test.ts` (57 total mobile unit tests).
- **Docs:** [design spec](docs/superpowers/specs/2026-05-23-naari-shakti-design.md), [plan](docs/superpowers/plans/2026-05-23-naari-shakti.md), [Stitch prompt](docs/design/stitch-prompts/naari-shakti-portal.md).

### Changed

- `app.json` microphone usage string mentions Naari Shakti emergency recording.
- Profile shows gender with link to medical profile editor.

---

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

## [2026-05-25] — Publish & repo hygiene

- Git tags: `v0.1.0-p0` → `v1.2.0-hackathon-publish` (see [VERSION_HISTORY.md](docs/VERSION_HISTORY.md)).
- Removed `.cursor/` from public repo; added to `.gitignore`.

---

## [Earlier] — P0 foundation

- Expo SDK 54 app, START triage FSM, SQLite trauma-tier routing, GHP + QR relay, guest onboarding.
- Monorepo CI (mobile tests, web build, docs site build).
- Team brief site on Vercel.
