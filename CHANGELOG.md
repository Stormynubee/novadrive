# Changelog

All notable changes to the Margi monorepo (IIT Madras Road Safety Hackathon 2026, RoadSoS).  
Product was previously shipped as **NovaDrive**; rebrand to **Margi** in v1.5.0.

**Full commit-by-commit history with tags and fork link:** [docs/VERSION_HISTORY.md](docs/VERSION_HISTORY.md)

## [2026-05-28] — Phase 3 Production Integrations (v2.0.0)

### Added

- **Supabase:** `profiles`, `volunteer_providers`, `dispatch_events` migration + email/password auth tabs.
- **NGO registry:** `/ngo` register and list screens; alternate transport queries verified volunteers.
- **OSRM routing:** Nominatim geocode + OSRM driving route; GeoJSON polyline on Trip map; extended trip plan cache.
- **Sarthi BFF:** `GET /api/sarthi/health`; mobile connection status chip.
- **HTTP dispatch:** `dispatchOrchestrator` with auto mode POST, `autoDispatchMedical` in body, Supabase audit trail.
- **Native crash layer:** `nativeCrashAdapter` + `crashOrchestrator` (Android dev build); source badge on calm dialog.

### Changed

- `novadrive-mobile` package version **2.0.0**; requires `expo-dev-client` for native crash hooks.
- Removed placeholder voice/mic alerts on Sarthi; remediated fake-button CTAs on profile/settings/response.

---

## [2026-05-28] — Phase 2 P1 (v1.7.0)

### Added

- **Drive HUD v1.6 layout:** `DrivingHudLayout`, SOS top strip (`hudTop`), 168px speedometer, fixed chrome, dev-gated demo pills.
- **Rah-Veer:** Good Samaritan screens, local claim log (`rahveer_claims`), relay chain in SecureStore, scan round-trip via `packetFromQrDecoded`.
- **Trip intelligence:** DB-backed corridor hazards, `nd_last_trip_plan` cache, collapsible briefing on Trip tab.
- **Journey debrief:** Scroll sections on complete, `summary_json` on journey logs, Settings → Journey history.
- **TTS narrator:** `src/lib/tts/narrator.ts` for START FSM on `/emergency/triage` when accessibility TTS is on.

### Changed

- `novadrive-mobile` package version **1.7.0** (includes v1.6.0 HUD work).
- Manual emergency activation routes through START triage before trauma response.

---

## [2026-05-28] — Margi rebrand (Care Path)

### Added

- **Margi** product identity: Care Path design tokens (`#0056b3` / `#ff8c00`), `src/lib/brand.ts`, `MargiLogo`, `Margi*` UI components.
- Native IDs: `com.margi.app`, deep link scheme `margi://`.
- Design spec: [docs/superpowers/specs/2026-05-28-margi-rebrand-design.md](docs/superpowers/specs/2026-05-28-margi-rebrand-design.md).

### Changed

- GHP SMS header `MARGI GHP`, integrity hash prefix `mg-` (QR envelope `ND1:` unchanged).
- Splash, onboarding, and tab chrome use Margi branding.
- See [novadrive-mobile/assets/MARGI_ASSETS.md](novadrive-mobile/assets/MARGI_ASSETS.md) for store icon regeneration after adding `margi-logo-source.png`.

---

## [2026-05-28] — Distress voice detection hardening

### Added

- **Distress voice pipeline** under `novadrive-mobile/src/lib/voice/`: lifecycle policy (navigation, TTS, recorder warm-up), spectral feature extraction, two-stage classifier with golden fixtures, optional YAMNet scoring hook.
- **Profile setting:** `voiceDistressSensitivity` (low / medium / high) under Voice Crash Detection.
- **Docs:** [design spec](novadrive-mobile/docs/superpowers/specs/2026-05-28-distress-voice-detection-design.md), [plan index](docs/superpowers/plans/2026-05-28-distress-voice-detection.md), ONNX export notes in `novadrive-mobile/scripts/export-yamnet-distress-onnx.md`.
- **Device smoke matrix** rows 23–26 (navigation / notification false-positive regression, yell confirmation, Naari-only idle).
- **README guard:** `npm run verify:docs` keeps mobile README unit-test count in sync with `src/**/*.test.ts`.

### Fixed

- False “Distress signal detected” popups during tab navigation, app TTS, and recorder restarts.
- Voice monitor now mounts when `canDetectDistressVoice` (active journey **or** Naari safety mode), not journey-only.
- Removed debug ingest calls to `127.0.0.1:7773` from emergency and journey flows.

### Changed

- `panicVoiceEngine` is a loudness pre-filter only; final decision is `distressVoiceClassifier`.
- **135** mobile unit tests (includes `src/lib/voice/*` and `readmeStats`).

**Shipped:** `7370f90` · Tag: **`v1.4.0-distress-voice`**

---

## [2026-05-28] — Safety brief screens & activation splash

### Added

- Institutional **Protocol Alpha** and **Regional Alert** detail screens with acknowledgment storage (`safetyBriefExperience`, `SafetyBriefExperienceScreen`).

### Changed

- Emergency activation splash enforces **10s** minimum dwell before auto-navigation to trauma response (`ACTIVATION_SPLASH_SECONDS`).

**Commits:** `f3f2222`, `5008608`

---

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
