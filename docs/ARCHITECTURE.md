# NovaDrive Architecture

## System context

NovaDrive is a **client-heavy** emergency system: medical decisions and routing run on-device; the network is optional enhancement for SMS 108 and future LLM slot-fill.

| Layer | Technology | Role |
|-------|------------|------|
| Mobile (primary) | Expo SDK 56 + Expo Router | APK, sensors, camera, SMS intents |
| Offline POI | `expo-sqlite` | Trauma-tier facility ranking |
| Web mirror | Next.js (`novadrive/`) | Team demos without device |
| Brief site | Static HTML (`docs/site/`) | Vercel-hosted hackathon narrative |
| Auth (future) | Supabase + RLS | Profiles; **Guest mode** bypasses for judges |

## Core modules (`novadrive-mobile/src/lib`)

| Module | Responsibility |
|--------|----------------|
| `startTriageFSM.ts` | START protocol — single medical authority |
| `parseEmergencyText.ts` | Offline keyword → FSM slot prefill |
| `facilitiesDb.ts` | SQLite seed + Haversine + tier filter |
| `ghp.ts` | Packet build, SMS text, lz-string QR, SHA-256 |
| `crashEngine.ts` | Accel + speed fusion; journey-active only |
| `storage.ts` | AsyncStorage profile + SecureStore relay |

## CrashEngine rules

Active only when `journey.status === ACTIVE`:

1. Peak accelerometer above threshold in window  
2. Speed before > 25 km/h  
3. Speed after < 5 km/h  

Output: calm **15s dialog** — user confirms; **no automatic triage or 108** at timer zero.

## Data boundaries

| Data | Storage | Notes |
|------|---------|-------|
| Auth tokens | SecureStore | Never plaintext in AsyncStorage |
| Relay GHP | SecureStore | Bystander handoff |
| Profile / a11y | AsyncStorage | Guest-safe |
| POI DB | SQLite file | Seeded on first launch; refresh via `scripts/ingestCorridors.py` |

## Rejected patterns (scope guard)

Always-on scream ML, auto-dial, background GPS illusion, PWA-only core demo, fake crash APIs, NGO marketplace in P0.

See [NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md](./NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md) §3.
