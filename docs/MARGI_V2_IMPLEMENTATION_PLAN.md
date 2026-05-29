# Margi V2 — RoadSoS Hackathon Implementation Plan

> **Status:** Approved for build (team ideation May 2026)  
> **Deadline:** May 31, 2026, 11:59 PM IST  
> **Track:** RoadSoS — AI emergency chatbot + location-based services  

---

## 1. Executive summary

**Margi V2** is a **native-first** road safety companion (Expo React Native → Android + iOS) with a **calm, large-touch UI**. It combines:

1. **Journey mode** (private trip or public bus) with corridor intelligence  
2. **Crash detection** (sensor fusion + platform hooks where allowed) + **manual SOS**  
3. **START triage** + **trauma-tier routing** + **Golden Hour Packet (GHP)**  
4. **QR sneakernet relay** when offline  
5. **Good Samaritan (Rah-Veer / MoRTH)** education + bystander relay credits in-app  
6. **Trauma center / ambulance** alerting via **SMS ≤800 bytes** compressed payload  

**Honest platform note (critical for judges):**  
Apple **Crash Detection** and Android **Personal Safety** crash features are **OS-level**. Third-party access on iOS requires Apple entitlement `com.apple.developer.severe-vehicular-crash-event` (approval not guaranteed before hackathon). **Our guaranteed path:** journey-scoped **accelerometer + GPS fusion** with tiered confidence + user confirm before dispatch. We document OS integration as Phase 2 if entitlement granted.

---

## 2. RoadSoS alignment matrix

| Judge criterion | Margi V2 feature | Proof in demo |
|-----------------|------------------------|---------------|
| Valid emergency contacts | SQLite POI + verified phones | Show hospital call/SMS |
| Geographic accuracy | OSM ingest + single GPS snapshot + NH km | Map + coords on GHP |
| Offline capability | sql.js/SQLite pack + QR relay + offline FSM | Airplane mode |
| AI chatbot | LLM slot-fill + START FSM spine | Voice/text triage |
| Innovation | Journey intelligence + crash tier + Good Samaritan flow | End-to-end script |
| Open source | OSM, OSRM optional, Ollama/Groq, Expo | README + stack slide |

---

## 3. Architecture decision

### Recommended stack (hackathon + Android visibility)

| Layer | Choice | Why |
|-------|--------|-----|
| **Mobile app** | **Expo SDK 52 + React Native** | Real Android APK, iOS, fast iteration, sensors/location/speech |
| **Web demo / judges** | Keep `novadrive/` Next.js as optional mirror | Same GHP schema |
| **Auth** | **Supabase Auth** (phone OTP or email) + **RLS** | No home-grown password crypto |
| **Health profile DB** | **Supabase Postgres** (encrypted at rest) + **local SQLite cache** offline | Safe, auditable |
| **POI / corridors** | **SQLite** `emergency_seed.db` bundled per corridor | Offline routing |
| **Maps** | **OpenStreetMap** tiles + Leaflet/native map; Google optional online | Hackathon OSS preference |
| **Crash detect** | `expo-sensors` + `expo-location` during **active journey only** | Works both platforms |
| **Voice** | `expo-speech` (narrator) + platform STT | Accessibility + slot fill |
| **QR** | `react-native-qrcode-svg` + camera scanner | Bystander relay |
| **SMS payload** | `lz-string` compress GHP ≤800 bytes | RoadSoS dispatch brief |

### Rejected for V1 (document why on slide)

- Always-on microphone / scream ML (FP + privacy) → **optional manual “I need help” shout button** only  
- Ultrasonic / BLE mesh  
- Fake “connected to Apple Crash API” without entitlement  

---

## 4. User flows (complete)

### 4.1 Cold start

```
Splash (2s, Reanimated fade)
  → Auth (Supabase OTP / guest demo mode for judges)
  → Medical profile (blood type, conditions, allergies) — required once
  → Accessibility (narrator, large text, high contrast, voice commands lang)
  → Home hub
```

### 4.2 Start journey (two modes)

**Mode A — Private (Uber-like)**  
- Pickup + destination (geocode or map pin)  
- “Start journey” → location permission → **Happy Journey** screen  
- Background: corridor tips, low-network zones, trauma POIs along route  

**Mode B — Public bus**  
- Route ID / operator optional  
- **Expected checkpoints** (time + geo fence)  
- If bus misses checkpoint window → **auto SOS candidate** (tier 2, user confirm)  

**Government employee**  
- Toggle on profile → badge on journey → priority fields in GHP (org ID, not PII leak)  

### 4.3 Crash / SOS pipeline

```
Tier 0  Normal journey
Tier 1  Sensor bump logged
Tier 2  Crash candidate (accel + speed drop + journey active)
Tier 3  Full-screen calm prompt: "Possible incident — Are you OK?" [I'm OK] [Need help]
Tier 4  Manual SOS button (always visible, min 48dp)
Tier 5  START triage chat (FSM + optional LLM)
Tier 6  Trauma-tier facility list (SQLite)
Tier 7  GHP + integrity hash
Tier 8  Online: SMS/Call 108 | Offline: QR for bystander
Tier 9  Trauma center dashboard (web) receives packet ID + SMS payload (demo)
```

### 4.4 Good Samaritan (MoRTH)

- In-app **scheme explainer** (Rs 25,000 award, legal protection — cite MoRTH / PIB)  
- Bystander scan QR → relay → when online, prompt to **file Good Samaritan** checklist (link to state portal — no fake govt API)  
- **NGO / ambulance volunteer** registration → stored as `volunteer_providers` table (name, phone, service area, verified flag)  

---

## 5. Crash detection — implementation spec (must work)

### 5.1 Journey-gated monitoring

Only run when `journey.status === 'ACTIVE'`:

```typescript
// Every 200ms: accel magnitude | Every 5s: GPS speed
const ACCEL_THRESHOLD = 35; // m/s² equivalent scaled — calibrate on device
const SPEED_DROP_KMH = 25;
const PRE_SPEED_MIN_KMH = 20;
const STILLNESS_MS = 45000;
```

**Candidate rule (all required within 8s window):**  
1. `peakAccel > threshold`  
2. `speedBefore > PRE_SPEED_MIN` AND `speedAfter < 5`  
3. Stillness variance low for 45s (optional, reduces FP on hard brake in traffic jam)

### 5.2 iOS enhancement (Phase 2)

- Apply for `com.apple.developer.severe-vehicular-crash-event`  
- If granted: subscribe to severe vehicular crash events → jump to Tier 3  

### 5.3 Android enhancement

- `ActivityRecognition` + accelerometer fusion  
- Optional: integrate open SDK (DriveQuant trial) if time — not blocking  

### 5.4 Scream / distress audio

**Do not** run always-on scream detection for hackathon.  
**Do:** “Distress hold” button (hold 2s) + optional **one-shot** sound level check with user consent → triggers Tier 3. Document FP tradeoff in slides.

### 5.5 Bus geo-fence failure

- Checkpoint `expectedAt` + `radiusM`  
- No ping within `graceMinutes` → Tier 2 bus SOS candidate  

---

## 6. Security & database (non-negotiable)

| Data | Storage | Protection |
|------|---------|------------|
| Auth tokens | SecureStore | OS keychain |
| Passwords | Never stored | Supabase only |
| Blood type, allergies | Postgres + local cache | RLS `user_id = auth.uid()` |
| GHP in transit | QR compressed | Integrity SHA-256 |
| Location history | Journey record only | Delete after 30d policy |

**No:** plaintext medical data in logs, public buckets, or SMS beyond GHP spec.

---

## 7. GHP & 800-byte SMS

```typescript
interface GHPCompact {
  id: string;       // 8 char
  t: 'R'|'Y'|'G'|'B';
  lat: number;      // 5 decimals
  lng: number;
  bt?: string;      // blood type
  fac: string;      // facility code
  ph: string;       // phone
  h: string;        // hash 8 char
}
```

Compress with `lz-string` → if still >800 bytes, send **minimal**: `{id,t,lat,lng,h}` + full GHP on screen/QR.

---

## 8. UI / UX principles (calm safety)

- **Palette:** deep navy `#0B1220`, surface `#151D2E`, sage accent `#6EE7B7` (safe), amber `#FBBF24` (action), coral `#FB7185` (urgent, sparingly)  
- **Typography:** DM Sans / Manrope — large default 18px base  
- **Motion:** 300ms ease, no flashing red; urgent = firm border + icon + label  
- **Narrator:** reads each question; respects system TTS rate  
- **Navigation:** max 3 taps to SOS from anywhere during journey  

---

## 9. Repo layout

```
roadsafetyhackathon/
├── docs/MARGI_V2_IMPLEMENTATION_PLAN.md   ← this file
├── novadrive-mobile/                          ← Expo (PRIMARY)
├── novadrive/                                 ← Next.js mirror / trauma dashboard
├── scripts/ingestCorridors.py
├── data/emergency_seed.db
└── supabase/migrations/
```

---

## 10. Four-week execution schedule

| Week | Deliverable |
|------|-------------|
| **W1** | Expo shell: splash, auth, profile, accessibility; Supabase schema; POI ingest |
| **W2** | Journey mode + crash monitor + manual SOS; START FSM; facility routing |
| **W3** | GHP + QR + SMS; trip info corridor; Good Samaritan screens; bus mode |
| **W4** | Polish, airplane demo, 7 slides, Word doc, bug bash, Play internal APK |

---

## 11. Demo script (90s)

1. Login → profile shows blood type  
2. Start journey NH48 → Happy Journey + tip card  
3. Enable airplane mode → manual SOS → RED triage  
4. Trauma center + GHP + QR  
5. Phone B scan → SMS 108  
6. Mention Good Samaritan Rs 25,000 explainer  
7. Show crash detection log from simulated bump (dev menu)  

---

## 12. Risk register

| Risk | Mitigation |
|------|------------|
| Apple crash API denied | Sensor fusion + manual SOS |
| Scream FP | Hold-to-distress only |
| Scope explosion | Bus mode + scream = P1 if timeboxed |
| Supabase offline | Local SQLite mirror on journey start |
| Judge asks “dummy?” | Every button navigates to real logic |

---

## 13. What we build first (this session)

**`novadrive-mobile/`** working APK path:

- [x] Implementation plan  
- [ ] Splash → Auth → Medical → Accessibility → Home  
- [ ] Start journey + location + active monitor  
- [ ] SOS → Triage → GHP → QR  
- [ ] Trip info + Good Samaritan screens  
- [ ] README: `npx expo run:android`  

---

*Margi V2 — built for RoadSoS. Calm UI, real logic, honest about platform limits.*
