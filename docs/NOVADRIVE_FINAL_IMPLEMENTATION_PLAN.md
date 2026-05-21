# NovaDrive — Final Implementation Plan (RoadSoS Hackathon 2026)

> **Product:** NovaDrive  
> **Track:** RoadSoS — AI-powered emergency chatbot + location-based services  
> **Organizer:** CoERS & RBG Labs, IIT Madras (MoRTH)  
> **Deadline:** May 31, 2026, 11:59 PM IST  
> **Status:** Planning locked — P0 build authorized  
> **Primary deliverable:** `novadrive-mobile/` (Expo React Native → Android APK)

This document is the **single source of truth** for implementation. It merges team ideation, RoadSoS requirements, architecture audits, and the finalized Anti-Gravity blueprint.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What We Are Building](#2-what-we-are-building)
3. [What We Rejected](#3-what-we-rejected)
4. [Platform & Stack](#4-platform--stack)
5. [Security & Data](#5-security--data)
6. [Application Architecture](#6-application-architecture)
7. [CrashEngine Specification](#7-crashengine-specification)
8. [START Triage FSM](#8-start-triage-fsm)
9. [Golden Hour Packet (GHP)](#9-golden-hour-packet-ghp)
10. [Offline POI & Maps](#10-offline-poi--maps)
11. [UI / UX — Night-Highway HUD](#11-ui--ux--night-highway-hud)
12. [Accessibility](#12-accessibility)
13. [Repository Layout](#13-repository-layout)
14. [P0 Execution Checklist](#14-p0-execution-checklist)
15. [P1 & P2 Scope](#15-p1--p2-scope)
16. [Submission & Acceptance Tests](#16-submission--acceptance-tests)
17. [90-Second Demo Script](#17-90-second-demo-script)
18. [Four-Week Schedule](#18-four-week-schedule)
19. [Risk Register](#19-risk-register)
20. [Slide Talking Points](#20-slide-talking-points)

---

## 1. Executive Summary

**NovaDrive** is a calm, native mobile co-pilot for road emergencies. When signal fails on Indian highways, victims and bystanders still get:

- **START medical triage** (deterministic, offline-safe)
- **Trauma-tier routing** (not “nearest pin”)
- A **Golden Hour Packet (GHP)** — human-readable brief for 108
- **QR human relay** — bystander carries the packet until any phone gets network

**Tagline:** *Signal drops. The critical minute doesn't.*

**Hackathon MVP scope:** Not “production-ready.” A **verifiable P0** that passes an **airplane-mode demo** on a real Android APK.

---

## 2. What We Are Building

| Capability | P0? | Description |
|------------|-----|-------------|
| Splash → Auth → Medical profile → Accessibility | Yes | Onboarding gate |
| Guest/Demo mode | Yes | Judges can use app without Supabase |
| Start Journey + foreground GPS HUD | Yes | “Happy journey” + Hold-to-SOS |
| CrashEngine (sensor fusion) | Yes | Journey-active only; simulate for judges |
| Calm crash candidate dialog | Yes | 15s UI emphasis; **zero auto-action at 0s** |
| Manual SOS | Yes | Always reachable during journey |
| START triage FSM | Yes | Medical spine |
| AI chatbot UI | Yes | Text field + **offline keyword parser** on Send |
| SQLite POI routing | Yes | `emergency_seed.db` via `expo-sqlite` |
| GHP + lz-string QR + SHA-256 | Yes | `expo-crypto` |
| Bystander QR scan + relay cache | Yes | Camera + AsyncStorage/SecureStore |
| SMS 108 (human-readable) | Yes | Native `sms:` intent when online |
| Trip info / bus / Rah-Veer / NGO registry | P1/P2 | See §15 |

---

## 3. What We Rejected

| Idea | Why killed |
|------|------------|
| PWA-only for core demo | Cannot reliably access sensors, SMS, camera for hackathon proof |
| Always-on scream / impact mic ML | Battery, privacy, false positives |
| 10s blaring alarm on crash | Panic UX; violates “calm and surrounded” goal |
| Auto-dial / auto-navigate to triage at countdown 0 | Legal + false alarm risk |
| Background GPS “like Uber” | iOS restrictions; demo risk — **foreground journey only** |
| Ultrasonic V2V, BLE mesh, Wi-Fi Direct | Not available / unreliable in mobile web/native demo |
| Base64-only SMS to 108 | Operators cannot decode |
| Claiming Apple/Google OS crash API without entitlement | Dishonest — sensor fusion is our P0 path |
| NGO ambulance marketplace | P2 — scope guard |
| Dummy buttons / fake screens | Disqualifies demo credibility |

---

## 4. Platform & Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Mobile (primary)** | Expo SDK 52 + Expo Router | `npx expo run:android` for APK |
| **UI motion** | `react-native-reanimated` | No `react-native-paper` as primary theme |
| **Auth** | Supabase Auth + RLS | Guest mode bypass required |
| **Medical profile** | Supabase Postgres + local cache | Never log plaintext PHI |
| **Session / relay** | `expo-secure-store` + AsyncStorage | Not IndexedDB (web-only term) |
| **Offline POI** | `expo-sqlite` + bundled `emergency_seed.db` | Asset in `novadrive-mobile/assets/` |
| **Maps** | OpenStreetMap (MapLibre or `react-native-maps` offline tiles) | Google Maps optional P1 enrich only |
| **Location** | `expo-location` | Foreground during active journey |
| **Sensors** | `expo-sensors` (Accelerometer) | CrashEngine only when journey ACTIVE |
| **QR** | `react-native-qrcode-svg` + `expo-camera` | Real scan/decode in P0 |
| **Compression** | `lz-string` | QR payload size |
| **Integrity** | `expo-crypto` SHA-256 | Tamper check |
| **TTS (accessibility)** | `expo-speech` | P1 narrator; P0 toggle stub OK |
| **Optional LLM** | Groq/Ollama slot-fill | Online only; FSM decides triage |
| **Web mirror (optional)** | `novadrive/` Next.js | Team brief site; not judge-critical |
| **POI ingest** | `scripts/ingestCorridors.py` | OSM Overpass → SQLite |

---

## 5. Security & Data

| Data | Where | Rule |
|------|-------|------|
| Auth tokens | SecureStore | Never in AsyncStorage plaintext |
| Passwords | — | Never stored client-side |
| Blood type, allergies, conditions | Supabase + RLS `auth.uid()` | Sync to local only for GHP if user consents |
| Journey GPS | Local journey record | Minimal retention |
| GHP on QR | Compressed JSON + hash | **No blood type in QR unless explicit consent** |
| SMS to 108 | Human-readable text | ≤800 bytes; truncate to minimal `{id,t,lat,lng,h}` if needed |
| Bystander relay log | SecureStore / SQLite | For Rah-Veer evidence (P1) |
| Logs | — | No PHI in console/logcat in release demo |

**Guest mode:** Pre-seeded demo profile in local SQLite — no network required.

---

## 6. Application Architecture

### 6.1 Navigation map (Expo Router)

```
app/
  index.tsx                 → Splash → redirect
  (auth)/
    login.tsx
    medical.tsx
    accessibility.tsx
  (tabs)/
    home.tsx                → Start Journey | Scan QR | Settings
  journey/
    start.tsx               → permissions + route intent
    active.tsx              → HUD + CrashEngine + Hold SOS
  sos/
    confirm.tsx             → crash candidate calm dialog
    triage.tsx              → FSM + chat input + pills
    route.tsx               → facility list from SQLite
    packet.tsx              → GHP dispatch card
    relay.tsx               → QR + SMS
  scan.tsx                  → bystander camera
  settings.tsx
```

### 6.2 State machine (incident)

```
JOURNEY_ACTIVE
  → CRASH_CANDIDATE (optional) → CALM_DIALOG (15s UI only)
  → USER_TAP_SOS
  → TRIAGE_FSM (START)
  → ROUTE_SQLITE (trauma-tier filter)
  → BUILD_GHP
  → RELAY (QR offline | SMS online)
```

**Invariant:** No transition to `TRIAGE_FSM` or `sms:108` without **explicit user tap**.

### 6.3 Crash candidate dialog (zero-action at 0s)

- Show: *“Possible incident detected”*
- Buttons: **I'm OK** | **Need help**
- 15s timer: intensify color/haptic only
- **At 0 seconds:** UI emphasis only — **no navigation, no dial, no triage start**

---

## 7. CrashEngine Specification

### 7.1 When it runs

```typescript
journey.status === 'ACTIVE'  // only
```

### 7.2 Inputs

| Source | Interval | Purpose |
|--------|----------|---------|
| Accelerometer | ~200ms | Peak magnitude |
| GPS speed | ~5s | Pre-speed gate + post-stop |

### 7.3 Thresholds (calibrate on device)

```typescript
export const CRASH_CONFIG = {
  PRE_SPEED_MIN_KMH: 25,
  SPEED_AFTER_MAX_KMH: 5,
  ACCEL_PEAK_THRESHOLD: 35,      // scaled; tune on highway test
  STILLNESS_WINDOW_MS: 45_000,  // optional FP reducer
  COOLDOWN_MS: 600_000,         // 10 min between candidates
  CANDIDATE_WINDOW_MS: 8_000,
};
```

### 7.4 Candidate rule (all required)

1. Peak accel > threshold within window  
2. Speed before incident > `PRE_SPEED_MIN_KMH`  
3. Speed after < `SPEED_AFTER_MAX_KMH`  
4. (Optional) Low accel variance for `STILLNESS_WINDOW_MS`

### 7.5 Outputs

| Event | Action |
|-------|--------|
| `BUMP_LOGGED` | Dev log only |
| `CRASH_CANDIDATE` | Open calm dialog — user must confirm |
| `SIMULATE_CRASH` | Dev/judge button — same dialog |

### 7.6 Platform honesty (slides)

- **P0:** Custom sensor fusion + manual SOS  
- **P2:** Apple `severe-vehicular-crash-event` entitlement if approved  
- **Do not** claim OS crash detection in APK unless integrated and tested  

---

## 8. START Triage FSM

### 8.1 States

`AMBULATORY` → `BREATHING_CHECK` → `AIRWAY_REPOSITION` → `RESPIRATORY_RATE` → `PERFUSION_CHECK` → `MENTAL_STATUS` → `TAGGED`

### 8.2 Critical medical rules (do not simplify)

| Condition | Result |
|-----------|--------|
| Can walk | **GREEN** → done |
| Not breathing, airway fails | **BLACK** → done |
| Not breathing → airway succeeds | → **RESPIRATORY_RATE** (NOT instant RED) |
| RR > 30 | **RED** |
| No radial pulse / cap refill ≥ 2s | **RED** |
| Cannot follow commands | **RED** |
| All checks pass, non-ambulatory | **YELLOW** |

### 8.3 Implementation files

- Port from `novadrive/src/lib/startTriageFSM.ts` → `novadrive-mobile/src/lib/startTriageFSM.ts`
- **Unit tests required:** `startTriageFSM.test.ts`

### 8.4 AI chatbot UI (P0)

- Text field: *“Describe the emergency”*
- On **Send**, run `parseEmergencyText(text)` → fills ≥1 FSM slot offline

```typescript
// Minimum keyword map (extend as needed)
const KEYWORDS = [
  { re: /can'?t walk|unable to walk|not walking/i, slots: { canWalk: false } },
  { re: /not breathing|no breathing/i, slots: { breathing: false } },
  { re: /breathing fast|gasping|rr high/i, slots: { respiratoryRateOver30: true } },
  { re: /unconscious|not responding/i, slots: { followsCommands: false } },
];
```

- Show toast: *“Understood — we'll use this in triage”* and pre-select or skip matching FSM step
- Slide note: *“LLM slot-fill when online; FSM makes all medical decisions”*

### 8.5 Trauma-tier routing

| Triage | Route to | `trauma_tier` |
|--------|----------|---------------|
| RED | Trauma center | 1, 2 |
| YELLOW | Hospital with ER | 2, 3 |
| GREEN | Clinic / minor | 3 |
| BLACK | Notify 108/police | No hospital routing |

Query: `expo-sqlite` bbox + Haversine sort on `emergency_seed.db`.

---

## 9. Golden Hour Packet (GHP)

### 9.1 Full schema (app internal)

```typescript
interface GoldenHourPacket {
  id: string;
  createdAt: string;
  triage: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  location: { lat: number; lng: number; landmark?: string; nhCode?: string; nhKm?: number };
  victims: { count: number; canWalk: boolean; breathing: boolean; /* ... */ };
  routing: { facilityName: string; facilityType: string; phone: string; etaMinutes: number; distanceKm: number };
  emergency: { dial: string; state: string; language: 'en' | 'hi' | 'ta' };
  integrity: string;
}
```

### 9.2 SMS (human-readable, ≤800 bytes)

```
NOVADRIVE GHP
Triage: RED
Location: NH48 km 87 (13.08270, 80.27070)
Facility: Apollo Highway Trauma (~12km, ~18min)
Phone: 108
Hash: nd-a3f2c891
```

### 9.3 QR (compressed)

1. Build minimal JSON `{ id, triage, lat, lng, victims?, routing?, integrity }`  
2. Compress with `lz-string.compressToEncodedURIComponent`  
3. If QR > ~2KB visible size, QR carries only `{ id, triage, lat, lng, integrity }` — full GHP on screen  

### 9.4 Bystander flow

1. Scan QR → decode → verify SHA-256  
2. Save to SecureStore + show readable GHP  
3. On `online` event → `sms:108?body=...`  
4. P1: log bystander GPS/timestamp for Rah-Veer claim evidence  

---

## 10. Offline POI & Maps

### 10.1 Build `emergency_seed.db`

```bash
python scripts/ingestCorridors.py --corridor NH48 --min-pois 50 --out data/emergency_seed.db
```

Bundle into `novadrive-mobile/assets/emergency_seed.db`.

### 10.2 Minimum tables

```sql
CREATE TABLE emergency_nodes (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,           -- trauma | hospital | clinic | police
  trauma_tier INTEGER, -- 1-3
  phone TEXT,
  lat REAL,
  lng REAL,
  verified INTEGER DEFAULT 0
);
```

### 10.3 Maps

- P0: Facility **list** + optional static map thumbnail  
- P1: OSM offline tiles along corridor  
- Do not block P0 on map polish  

---

## 11. UI / UX — Night-Highway HUD

### 11.1 Design tokens

```css
--nova-bg: #0B1220;
--nova-surface: #151D2E;
--nova-surface-2: #1C2636;
--nova-border: #2A3A52;
--nova-text: #E8EDF4;
--nova-muted: #8B9BB0;
--nova-amber: #FBBF24;      /* primary action */
--nova-cyan: #22D3EE;       /* online / relay */
--nova-safe: #6EE7B7;       /* OK states */
--nova-urgent: #FB7185;     /* RED — use sparingly */
```

### 11.2 Components

| Component | Purpose |
|-----------|---------|
| `NovaButton` | primary / secondary / ghost |
| `SeverityChip` | RED/YELLOW/GREEN/BLACK + text label |
| `ProgressRail` | Locate → Triage → Route → Packet → Relay |
| `DispatchCard` | monospace GHP display |
| `FacilityCard` | routing list |
| `HoldSOSButton` | press-and-hold 1.5s to trigger SOS |
| `CrashCandidateModal` | calm 15s dialog |

### 11.3 UX rules

- Min touch target **48dp**  
- Severity always **color + text** (never color alone)  
- Max **3 taps** to SOS from journey HUD  
- No fullscreen flashing red loops  

---

## 12. Accessibility

| Feature | P0 | Implementation |
|---------|-----|----------------|
| Large text (+15%) | Yes | `fontScale` multiplier |
| High contrast | Yes | CSS variables toggle |
| TTS narrator | Stub/P1 | `expo-speech` reads FSM questions |
| Voice input | P1 | Push-to-talk only |
| `accessibilityLabel` on all buttons | Yes | Required |
| Hindi labels on FSM | Yes | Under English on same screen |

---

## 13. Repository Layout

```
roadsafetyhackathon/
├── docs/
│   ├── NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md   ← THIS FILE
│   ├── NOVADRIVE_V2_IMPLEMENTATION_PLAN.md      ← archive / appendix
│   └── NOVADRIVE_MASTER_BRIEF.md                ← product context
├── novadrive-mobile/                            ← PRIMARY (Expo)
│   ├── app/                                     ← Expo Router screens
│   ├── src/lib/                                 ← FSM, CrashEngine, GHP, parser
│   ├── assets/emergency_seed.db
│   └── README.md                                ← APK build instructions
├── novadrive/                                   ← Next.js (optional mirror)
├── scripts/ingestCorridors.py
├── data/emergency_seed.db
└── supabase/migrations/                           ← auth + profiles RLS
```

---

## 14. P0 Execution Checklist

Copy this into sprint tracking. **Do not start P1 until all P0 boxes pass airplane test.**

### Setup
- [ ] `npx create-expo-app` → `novadrive-mobile/` with Expo Router
- [ ] Theme: Reanimated + Night-Highway tokens
- [ ] Supabase client + **Guest/Demo** bypass

### Onboarding
- [ ] Splash (2s fade)
- [ ] Auth screen
- [ ] Medical profile → persisted
- [ ] Accessibility toggles

### Journey
- [ ] Start Journey + location permission
- [ ] Happy Journey HUD (ETA placeholder OK if SQLite loaded)
- [ ] Foreground GPS polling
- [ ] Hold-to-SOS (1.5s hold)
- [ ] CrashEngine + **Simulate Crash** button
- [ ] Calm candidate dialog (15s, **0s = UI only**)

### Triage & routing
- [ ] Text input + **offline keyword parser** on Send
- [ ] `startTriageFSM.ts` + unit tests
- [ ] `ingestCorridors.py` → 50+ POIs → bundle `emergency_seed.db`
- [ ] `expo-sqlite` trauma-tier routing

### GHP & relay
- [ ] Human-readable SMS formatter
- [ ] `lz-string` + `expo-crypto` QR
- [ ] QR generator screen
- [ ] Camera QR scan + hash verify
- [ ] SecureStore relay cache
- [ ] `sms:108` intent on online

### Acceptance
- [ ] **Airplane mode test passes** (see §16)
- [ ] `npx expo run:android` documented
- [ ] 7 slides + Word doc + 90s script

---

## 15. P1 & P2 Scope

### P1 — build only after P0 passes

- Trip Info Cards (accident-prone zones, low-network warnings on HUD)
- Good Samaritan / Rah-Veer explainer + local claim ticket log (₹25,000 MoRTH — link to official portal, **no fake govt API**)
- Public bus checkpoint mode
- TTS narrator full flow
- Government employee flag on profile/GHP
- Hold-to-distress audio (optional)
- OSM offline map tiles

### P2 — do not build for hackathon

- NGO / ambulance provider registry in Supabase
- Always-on acoustic scream ML
- Apple SafetyKit / severe vehicular crash entitlement integration
- Trauma center live web dashboard (unless trivial mock)
- Volunteer marketplace payments

---

## 16. Submission & Acceptance Tests

### Non-code (Unstop)

1. GitHub repo with `novadrive-mobile/`  
2. `emergency_seed.db` in repo or release assets  
3. **7-slide deck**  
4. **Word doc** (stack, assumptions, START simplification notes)  
5. **90-second demo script** (§17)

### Airplane mode test (core proof)

| Step | Device A | Expected |
|------|----------|----------|
| 1 | Enable airplane mode | Offline chip visible |
| 2 | Guest login → Start Journey | GPS cached or manual NH km |
| 3 | Hold SOS | Opens triage |
| 4 | Type “can't walk, not breathing” → Send | Parser fills slots |
| 5 | Complete FSM → RED | Severity chip |
| 6 | Pick trauma facility | From SQLite |
| 7 | Generate GHP + QR | QR visible |
| 8 | Device B Scan QR | Decode + verify hash |
| 9 | Disable airplane on B | SMS 108 prefilled |

**Pass criteria:** No crash, no blank screens, no network error blocking triage/QR.

### Android APK

```bash
cd novadrive-mobile
npm install
npx expo run:android
```

Document JDK path, USB debugging, and EAS optional cloud build in `novadrive-mobile/README.md`.

---

## 17. 90-Second Demo Script

| Time | Action | Say |
|------|--------|-----|
| 0:00 | Show offline / airplane on Phone A | “NH48 — zero signal is normal.” |
| 0:08 | Guest login → medical profile flash | “Health context travels with the packet.” |
| 0:15 | Start Journey → HUD | “Foreground companion — not surveillance.” |
| 0:22 | Tap Simulate Crash → I'm OK, then Hold SOS | “Auto-detect suggests; human confirms.” |
| 0:30 | Type “can't walk, bleeding” → Send | “Offline AI UI — parser feeds START FSM.” |
| 0:40 | FSM → RED | “Trauma tier, not nearest clinic.” |
| 0:48 | Facility + GHP | “108-ready brief, not chat logs.” |
| 0:55 | Show QR | “Victim offline — bystander carries packet.” |
| 1:05 | Phone B scan → online → SMS | “Relay completes the golden hour.” |
| 1:15 | Mention Rah-Veer ₹25k (P1 card) | “Bystander protection under Indian law.” |
| 1:25 | Architecture slide | “Open source OSM, Expo, SQLite, FSM spine.” |

---

## 18. Four-Week Schedule

| Week | Focus | Exit criteria |
|------|-------|---------------|
| **W1** (now) | Expo scaffold, auth, profile, SQLite ingest | APK opens; guest mode works |
| **W2** | Journey HUD, CrashEngine, FSM, parser | Simulate crash → RED triage |
| **W3** | GHP, QR, scan, SMS, airplane test | P0 acceptance passes |
| **W4** | P1 polish, slides, Word doc, bug bash | Unstop submission ready |

---

## 19. Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Supabase down on demo day | Medium | Guest mode + local profile |
| False crash during demo | Medium | Simulate button + I'm OK |
| SQLite empty | High if ignored | ingest script in CI checklist |
| QR too dense | Medium | lz-string + minimal fallback payload |
| Judge says “not AI” | Medium | Show text parser + explain FSM spine |
| Scope creep (bus, NGO) | High | P2 list — PM enforces |
| iOS crash entitlement denied | High | Already on P2 |

---

## 20. Slide Talking Points

1. **Problem:** Golden hour lost to dead zones + unclear triage + wrong hospital tier  
2. **Solution:** NovaDrive — journey companion + START + GHP + QR relay  
3. **Offline proof:** Airplane mode live demo  
4. **AI:** Parser/LLM fills slots; FSM decides medicine  
5. **Data:** OSM SQLite, 50+ verified POIs, human SMS  
6. **Innovation:** Calm crash candidate + bystander relay + Rah-Veer alignment  
7. **Ask:** RoadSoS fit — emergency chatbot that works when towers don't  

---

## Appendix A — Supabase schema (minimal)

```sql
-- profiles (RLS enabled)
create table profiles (
  id uuid primary key references auth.users(id),
  blood_type text,
  allergies text,
  conditions text,
  language text default 'en',
  large_text boolean default false,
  high_contrast boolean default false,
  created_at timestamptz default now()
);
```

## Appendix B — Copy from existing code

Reusable logic already exists in `novadrive/` (Next.js):

- `src/lib/startTriageFSM.ts`
- `src/lib/ghp.ts`
- `src/lib/facilities.ts` (mock → replace with SQLite)

Port to `novadrive-mobile/src/lib/` in Week 1.

---

**Planning status:** Complete.  
**Next action:** Scaffold `novadrive-mobile` against §14 P0 only.  
**Do not merge P1/P2 until §16 airplane test passes.**

*NovaDrive — IIT Madras Road Safety Hackathon 2026 · RoadSoS*
