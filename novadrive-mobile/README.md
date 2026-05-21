# NovaDrive Mobile (P0)

**Signal drops. The critical minute doesn't.**

Native Expo app for the IIT Madras Road Safety Hackathon 2026 — RoadSoS track.

> Monorepo root: [../README.md](../README.md) · Submission checklist: [../docs/SUBMISSION.md](../docs/SUBMISSION.md)

## Features (P0)

- Splash → Auth (Guest) → Medical → Accessibility onboarding
- Journey HUD with foreground GPS + CrashEngine (simulate for judges)
- Calm 15s crash dialog — **no auto triage or 108 at countdown 0**
- Hold-to-SOS (1.5s) → START triage FSM → trauma-tier SQLite routing
- Offline keyword parser on emergency chat
- Golden Hour Packet (GHP) + lz-string QR + SHA-256 integrity
- Bystander QR scan + SecureStore relay cache + SMS 108 intent

## Run

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npm test
npx expo start
```

### Android APK / device

```bash
npx expo run:android
```

Grant location (journey) and camera (QR scan) when prompted.

## Airplane-mode acceptance test

1. Complete onboarding (Guest is fine).
2. Start journey → capture location → run triage → pick facility → build packet.
3. Enable airplane mode — verify GHP text and QR still display.
4. On a second device, scan QR → relay caches → disable airplane mode → SMS 108.

## POI database

App seeds `emergency_seed.db` on first launch (50+ nodes). To refresh from OSM:

```bash
python scripts/ingestCorridors.py --corridor NH48 --min-pois 50 --out data/emergency_seed.db
```

## Plan

See [docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md](../docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md).
