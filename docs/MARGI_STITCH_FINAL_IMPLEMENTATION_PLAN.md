# Margi — Stitch UI + Refinement Final Implementation Plan

> **For agentic workers:** Implement task-by-task after product owner says **`proceed`** or **`go`**. Use checkbox (`- [ ]`) tracking. Do **not** start coding until then.
>
> **Status:** Implemented — May 2026  
> **Inputs merged:** Stitch export (`stitch_nova_drive_mobile_interface`), P0 app (`novadrive-mobile/`), `MARGI_REFINEMENT_PLAN.md`, `MARGI_FINAL_IMPLEMENTATION_PLAN.md`  
> **Design source of truth:** `night_highway_hud/DESIGN.md` (not `nova_drive/DESIGN.md`)

**Goal:** Ship a judge-ready Expo SDK 54 app where every screen matches the Stitch Night-Highway HUD designs, P0 medical spine stays intact, and refinement phases R1–R9 land in one coordinated sprint.

**Architecture:** Keep existing libs (`startTriageFSM`, `ghp`, `facilitiesDb`, `crashEngine`, `AppContext`). Replace presentation layer: theme tokens, shared HUD components, screen layouts from Stitch HTML. Add missing routes (`/journey/depart`, `/trip/plan`). Fix R7 data bugs before visual polish.

**Tech stack:** Expo SDK 54, Expo Router, Reanimated, expo-google-fonts (Sora, DM Sans, JetBrains Mono), react-native-svg, existing SQLite/GPS/sensors.

---

## 0. Executive summary

You designed **15 Stitch screens** by voice. P0 already implements the **medical spine** (START FSM, trauma routing, GHP, QR relay, journey crash engine). This plan **does not rebuild logic** — it **skins and completes flows** to match Stitch, while folding in the refinement plan (real GPS, trip A→B, transitions, auth slider).

**Single design system:** Night-Highway HUD — navy `#0c1321` / `#0B1220`, amber `#fbbf24`, cyan `#5de6ff` / `#22D3EE`, glass panels, Sora + DM Sans + JetBrains Mono.

**Reject for this sprint:** `nova_drive` blue/purple palette on splash (Stitch `splash_screen` used wrong token set). Always-on scream ML. Production Supabase. Auto-actions at crash countdown zero.

**Say `go`** — full plan (includes R6 Trip Info). **`go slim`** — skip R6 (`route_discovery`), ship R1–R5 + R7–R9 only.

---

## 1. Stitch inventory → app mapping

| # | Stitch folder | Screen title | Expo route (target) | Current P0 | Refinement |
|---|---------------|--------------|---------------------|--------------|------------|
| 1 | `splash_screen` | Splash | `app/splash.tsx` | Text-only | **R1** — logo animation, tagline, subline |
| 2 | `sign_in` | Secure Sign-In | `app/auth.tsx` | Guest + optional email | **R2** — required email, Guest demo |
| 3 | `medical_profile` | Medical Profile | `app/medical.tsx` | 4 fields work | Restyle + wire fields into GHP |
| 4 | `accessibility_settings` | Accessibility HUD | `app/accessibility.tsx` | Toggles only | **R3** — **slider 80–150%**, live preview |
| 5 | `drive_dashboard` | Drive Dashboard | `app/home.tsx` | Plain home | **R4** — hero card, Start Journey, SOS row |
| 6 | `route_discovery` | Initialize Route | `app/trip/plan.tsx` **NEW** | Not built | **R6** — A→B + briefing cards |
| 7 | `journey_departure_transition_1` | Journey Departure | `app/journey/depart.tsx` **NEW** | Not built | **R5** — route line + progress |
| 8 | `journey_telemetry_init` | Journey Departure (alt) | Merge into `depart.tsx` | — | Pick **one** transition layout |
| 9 | `journey_departure_transition_2` | Journey HUD | `app/journey.tsx` | Basic HUD | **R5/R9** — glass HUD, large speed, Hold SOS |
| 10 | `locate_emergency` | Locate Emergency | `app/emergency/locate.tsx` | Real GPS + **demo strings** | **R7** — real geocode, ProgressRail |
| 11 | `start_triage` | START Triage | `app/emergency/triage.tsx` | FSM works | Restyle + chat + ProgressRail |
| 12 | `triage_result` | Triage Result | Inline in `triage.tsx` or sub-view | Severity chip | Restyle result state |
| 13 | `trauma_tier_routing` | Trauma routing | `app/emergency/route.tsx` | SQLite list | Facility cards like Stitch |
| 14 | `golden_hour_packet` | Golden Hour Packet | `app/emergency/packet.tsx` | GHP + QR works | Monospace panel + QR layout |
| 15 | `relay_finish` | Relay & Finish | `app/emergency/relay.tsx` | SMS + cache | Restyle relay steps |

**Not in Stitch (keep P0):** `app/scan.tsx` (bystander QR) — restyle to match HUD; no new Stitch asset.

**Design reference files:** Copy entire folder to `docs/design/refs/stitch_nova_drive_mobile_interface/` for the team (read-only).

---

## 2. Design system resolution (critical)

### 2.1 Two Stitch design tokens — pick one

| File | Palette | Verdict |
|------|---------|---------|
| `night_highway_hud/DESIGN.md` | Amber + cyan + navy | **USE THIS** — matches hackathon brief |
| `nova_drive/DESIGN.md` | Blue + purple + Geist | **Do not use** — conflicts with RoadSoS brand |

`splash_screen/code.html` was generated with **nova_drive** tokens. Re-implement splash using **night_highway_hud** colors (same layout: logo, tagline, Get started).

### 2.2 Token file (create)

**Create:** `novadrive-mobile/src/theme/tokens.ts`

Map from `night_highway_hud/DESIGN.md`:

- Surfaces: `background` `#0c1321`, `surface` `#0c1321`, `surfaceContainer` `#19202e`, `surfaceContainerHigh` `#232a39`, `surfaceContainerHighest` `#2e3544`
- Accents: `primary` / `primaryContainer` `#fbbf24`, `secondary` `#5de6ff` (live/GPS), `tertiary` `#82fbca` (safe/ok)
- Text: `onSurface` `#dce2f6`, `onSurfaceVariant` `#d3c5ac`, `outline` `#9c8f79`
- Semantic triage: keep existing RED/YELLOW/GREEN/BLACK from `colors.ts`
- Radius: card `12`, button/input `8`, chip `full`
- Spacing: base `8`, gutter `16` mobile, stack `16`/`32`

**Modify:** `src/theme/colors.ts` — re-export from `tokens.ts` for backward compatibility.

**Add:** `src/theme/typography.ts` — Sora (headlines), DM Sans (body), JetBrains Mono (data/GHP).

**Install:** `@expo-google-fonts/sora`, `@expo-google-fonts/dm-sans`, `@expo-google-fonts/jetbrains-mono` in `app/_layout.tsx`.

### 2.3 Shared components (from Stitch patterns)

| Component | Stitch pattern | File |
|-----------|----------------|------|
| `HudAppBar` | Fixed top bar, blur, MARGI title | `src/components/HudAppBar.tsx` |
| `GlassCard` | `backdrop-blur` + border `white/10` + `surfaceContainer` | `src/components/GlassCard.tsx` |
| `NovaLogo` | Shield/highway mark + wordmark | `src/components/NovaLogo.tsx` |
| `TextSizeSlider` | accessibility_settings slider + preview | `src/components/TextSizeSlider.tsx` |
| `ProgressRail` | Locate→Triage→Route→Packet→Relay | **Update** existing |
| `NovaButton` | Primary amber, ghost cyan border | **Update** existing |
| `SeverityChip` | Pill + triage colors | **Update** existing |
| `HoldSOSButton` | 100px circle, fill progress | **Update** existing |
| `CrashCandidateModal` | journey_departure_transition_2 overlay | **Update** existing |
| `FacilityCard` | trauma_tier_routing list items | `src/components/FacilityCard.tsx` |
| `TripBriefingCard` | route_discovery articles | `src/components/TripBriefingCard.tsx` |
| `DispatchCard` | golden_hour_packet monospace block | **Update** existing |

**Icons:** `@expo/vector-icons` MaterialSymbols subset — map Stitch `material-symbols-outlined` names.

---

## 3. Phase order (do not reorder)

```text
Phase 0 — Design refs + tokens + fonts     (0.5 day)
Phase 1 — R7 Real GPS + POI bbox          (1–2 days)  ← trust first
Phase 2 — R1–R3 Onboarding UI            (1.5 days)
Phase 3 — R4–R5 Home + journey handoff   (1.5 days)
Phase 4 — R6 Trip plan (if go)           (2 days)
Phase 5 — Emergency flow restyle R9      (2 days)
Phase 6 — R8 CrashEngine + scan polish   (1 day)
Phase 7 — QA airplane mode + demo script   (0.5 day)
```

---

## 4. Phase 0 — Foundation

### Task 0.1: Archive Stitch export

**Files:**
- Create: `docs/design/refs/stitch_nova_drive_mobile_interface/` (copy from Downloads)

- [ ] Copy `C:\Users\storm\Downloads\stitch_nova_drive_mobile_interface` into repo refs folder
- [ ] Add `docs/design/refs/README.md` — one-line per screen + route mapping (table §1)

### Task 0.2: Theme + fonts

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/typography.ts`
- Modify: `src/theme/colors.ts`, `app/_layout.tsx`

- [ ] Load fonts Sora, DM Sans, JetBrains Mono in root layout
- [ ] Apply `fontScale` from profile in `ScreenShell` (prep for R3)
- [ ] Wire `reduceMotion` — skip Reanimated sequences when true

---

## 5. Phase 1 — R7 Real location (backend before pixels)

**Stitch:** `locate_emergency` — shows coords + ProgressRail; copy must not say Chennai demo.

### Task 1.1: Geocode helper

**Files:**
- Create: `src/lib/geocode.ts`
- Modify: `app/emergency/locate.tsx`

- [ ] `reverseGeocode(lat, lng)` → `{ city, district, line }` via `expo-location`
- [ ] Remove hardcoded `landmark: 'Chennai–Trichy corridor (demo)'`, `nhKm: 87` unless NH lookup matches
- [ ] Display lat/lng in JetBrains Mono (Stitch data-label style)

### Task 1.2: POI bbox filter

**Files:**
- Modify: `src/lib/facilitiesDb.ts`, `app/emergency/route.tsx`

- [ ] `rankFacilities(triage, lat, lng, maxKm = 100)` — filter before sort
- [ ] If empty: show honest empty state — *“No trauma centers in offline pack for this region — call 108”*
- [ ] Cap UI: warn if selected facility > 150 km

### Task 1.3: Regional seed (document)

**Files:**
- Modify: `scripts/ingestCorridors.py`, `README.md`

- [ ] Document how to re-seed for user's state (team action)
- [ ] Optional: bundle second corridor asset if time permits

**Acceptance:** Locate screen shows **your** city name; nearest facility &lt; 100 km when POIs exist in region.

---

## 6. Phase 2 — Onboarding (R1–R3 + Stitch 1–4)

### Task 2.1: Splash — `splash_screen` + R1

**Files:** `app/splash.tsx`, `src/components/NovaLogo.tsx`

**Stitch spec:**
- Logo scale-in (~0.8s), wordmark, tagline *“Signal drops. The critical minute doesn’t.”*
- Subline: *“Offline triage · trauma routing · QR relay”*
- Amber **Get started** CTA
- Colors from **night_highway_hud**, not nova_drive blue

- [ ] Reanimated sequence (or static if `reduceMotion`)
- [ ] Navigate to `/auth`

### Task 2.2: Sign-in — `sign_in` + R2

**Files:** `app/auth.tsx`

**Stitch spec:**
- Email field (required validation)
- Primary: Continue with email
- Secondary: Continue as Guest (demo)
- Footer: no password on device

- [ ] Store email on profile; keep Guest path for judges

### Task 2.3: Medical profile — `medical_profile`

**Files:** `app/medical.tsx`, `src/lib/ghp.ts`

- [ ] Match Stitch card layout and inputs
- [ ] Pass blood type / allergies / conditions / ICE into `buildPacket()` when present

### Task 2.4: Accessibility — `accessibility_settings` + R3

**Files:** `app/accessibility.tsx`, `src/components/TextSizeSlider.tsx`, `src/components/ScreenShell.tsx`

**Stitch spec (already designed):**
- Slider 80–150% with live value badge
- Preview: *“Can the injured person walk?”*
- Toggles: high contrast, reduce motion, TTS stub

- [ ] Persist `a11y.fontScale`
- [ ] Global `fontScale` on all Text via ScreenShell

---

## 7. Phase 3 — Home & journey (R4–R5 + Stitch 5, 7–9)

### Task 3.1: Home dashboard — `drive_dashboard` + R4

**Files:** `app/home.tsx`

**Stitch spec:**
- Greeting + hero card (*“Ready for the highway?”* / golden hour copy)
- Primary **Start Journey**
- Secondary: Emergency (SOS), Scan QR
- Tertiary: Replay onboarding, link to **Plan route** (if R6)

- [ ] Start Journey → `/journey/depart` (not direct `/journey`)

### Task 3.2: Journey depart — `journey_departure_transition_1` + R5

**Files:** Create `app/journey/depart.tsx`, update `app/_layout.tsx`

**Stitch spec:**
- Map background + animated route SVG + progress bar
- *“Starting journey…”* / *“Initializing Telemetry”*
- Auto-navigate to `/journey` after ~1.5s (respect reduceMotion → 400ms)

- [ ] Request location permission here or on HUD mount (document in README)

### Task 3.3: Journey HUD — `journey_departure_transition_2` + R9

**Files:** `app/journey.tsx`, `AppContext.tsx`

**Stitch spec:**
- Large speed in Sora 120px, `km/h` mono label
- Hold SOS 100px circle with progress fill
- Simulate crash pill button
- Crash modal: *“Possible impact detected”* / Need help / I am okay — **no auto-route at 0s**

- [ ] Keep CrashEngine + GPS logic unchanged
- [ ] Match glass HUD background (grid/streaks optional, performance-safe)

---

## 8. Phase 4 — Trip Info (R6 + Stitch `route_discovery`) — optional on `go slim`

### Task 4.1: Trip plan screen

**Files:** Create `app/trip/plan.tsx`, `src/lib/tripBriefing.ts`, `src/lib/parseTripQuery.ts`

**Stitch spec:**
- Point A (default current GPS), Point B input
- **CALCULATE VECTOR** → scroll briefing cards:
  - Trauma centers en route
  - Detected hazards (`corridor_hazards` table)
  - Signal integrity / dead zones
  - Atmospheric / precautions
  - Emergency contacts

**SQLite:**
```sql
corridor_hazards (id, name, lat, lng, severity, nh_code, note);
dead_zones (id, name, lat, lng, radius_km, note);
```

- [ ] Seed from `ingestCorridors.py` or static NH48 demo for hackathon
- [ ] Cache last plan in AsyncStorage
- [ ] Chat field: offline keywords → scroll to card (no hallucination)

**Skip if `go slim`.**

---

## 9. Phase 5 — Emergency flow restyle (Stitch 10–15)

Apply `HudAppBar` + `ProgressRail` + `GlassCard` consistently.

### Task 5.1: Locate — `locate_emergency`

- [ ] ProgressRail step 1 active
- [ ] Capture CTA + mono coords (Phase 1 data)

### Task 5.2: Triage — `start_triage` + `triage_result`

- [ ] START question cards, Hindi support kept
- [ ] Chat row at bottom; offline parser prefill
- [ ] Result severity uses `SeverityChip` full-width Stitch layout

### Task 5.3: Route — `trauma_tier_routing`

- [ ] `FacilityCard` — distance, tier badge, verified chip
- [ ] BLACK triage bypass copy unchanged

### Task 5.4: Packet — `golden_hour_packet`

- [ ] `DispatchCard` monospace GHP
- [ ] QR centered, white quiet zone
- [ ] Continue to Relay CTA

### Task 5.5: Relay — `relay_finish`

- [ ] Cache status, SMS 108, link to scan
- [ ] Human-readable SMS only

### Task 5.6: Scan QR (no Stitch)

- [ ] Restyle `app/scan.tsx` to HUD; fix stub packet reconstruction if time

---

## 10. Phase 6 — R8 CrashEngine + polish

### Task 6.1: Crash tuning

**Files:** `src/lib/crashEngine.ts`, optional dev overlay on journey screen

- [ ] Keep speed gate 25→5 km/h for real driving
- [ ] Dev: show last accel peak for judges
- [ ] Document: phone throw will not trigger — use Simulate crash

### Task 6.2: Reject scream

- [ ] No mic listener; optional README note for slides

### Task 6.3: Haptics + press states

- [ ] Light haptic on Hold SOS complete, triage confirm (expo-haptics)

---

## 11. Phase 7 — Verification

### Task 7.1: Automated tests

- [ ] `npm test` — FSM tests still pass
- [ ] Typecheck `npx tsc --noEmit` if configured

### Task 7.2: Manual acceptance (required)

- [ ] Full onboarding: splash animation → auth → medical → a11y slider → home
- [ ] Start journey → depart transition → HUD
- [ ] Trip plan shows 4+ card types (if R6)
- [ ] Airplane mode: triage → GHP → QR → second device scan → SMS
- [ ] Replay onboarding from home
- [ ] Real GPS believable distances (R7)

### Task 7.3: Demo script

- [ ] Update `docs/SUBMISSION.md` 90s script with new UI names

---

## 12. File change summary

| Action | Path |
|--------|------|
| **Create** | `app/journey/depart.tsx`, `app/trip/plan.tsx` |
| **Create** | `src/theme/tokens.ts`, `typography.ts` |
| **Create** | `src/lib/geocode.ts`, `tripBriefing.ts`, `parseTripQuery.ts` |
| **Create** | `HudAppBar`, `GlassCard`, `NovaLogo`, `TextSizeSlider`, `FacilityCard`, `TripBriefingCard` |
| **Modify** | All `app/*.tsx` screens, `ScreenShell`, `NovaButton`, `ProgressRail`, `HoldSOS`, `CrashCandidateModal`, `DispatchCard` |
| **Modify** | `facilitiesDb.ts`, `ghp.ts`, `locate.tsx`, `AppContext.tsx`, `app/_layout.tsx` |
| **Copy** | Stitch → `docs/design/refs/` |

---

## 13. Decisions locked vs need from you

| Decision | Plan choice |
|----------|-------------|
| Design system | **night_highway_hud** only |
| Splash palette | Rebuild — ignore nova_drive blue |
| Journey transition | Use `journey_departure_transition_1` layout; skip duplicate `journey_telemetry_init` |
| Journey HUD | Use `journey_departure_transition_2` |
| Scream / voice crash | **Rejected** |
| R6 Trip Info | Full on `go`, skip on `go slim` |
| Supabase | Stub only |

**Before `go`, helpful inputs:**
1. Your **state/region** for POI re-seed (fixes 800 km)
2. Confirm **`go`** vs **`go slim`**
3. Optional: replace Stitch placeholder hospital names with Tamil Nadu real names from SQLite

---

## 14. How to proceed

| You say | Agent does |
|---------|------------|
| **`proceed`** or **`go`** | Start Phase 0 → 7 full plan |
| **`go slim`** | Phases 0–3, 5–7 + R7–R9; **skip Phase 4** (Trip Info) |
| **`go r7 only`** | Phase 1 only (GPS/POI fix), then pause |

---

## 15. Links (reference)

| Resource | URL / path |
|----------|------------|
| Stitch export (your PC) | `C:\Users\storm\Downloads\stitch_nova_drive_mobile_interface` |
| Refinement plan (markdown) | `docs/MARGI_REFINEMENT_PLAN.md` |
| P0 implementation plan | `docs/MARGI_FINAL_IMPLEMENTATION_PLAN.md` |
| Complete UI brief (HTML) | https://roadsafetyhackathon-six.vercel.app/margi-complete.html |
| GitHub | https://github.com/Stormynubee/novadrive |

---

*Margi · Stitch + Refinement Final Plan v1 · May 2026*
