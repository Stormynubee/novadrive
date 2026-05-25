# NovaDrive — Command Bridge UI Revamp

> **Status:** Approved — ready for implementation plan  
> **Date:** 2026-05-22  
> **Approach:** Command Bridge (Approach 2)  
> **Priorities:** A (demo wow) + C (bold rebrand) + D (emergency calm)  
> **Platform:** Expo SDK 54, React Native, Expo Router  
> **Medical spine:** Unchanged — START FSM, `ghp`, `facilitiesDb`, `crashEngine`, `AppContext`

---

## 1. Executive summary

NovaDrive’s P0 and refinement pass (R1–R9) shipped the **medical spine** and a partial **Night-Highway HUD**. This spec defines **Command Bridge**: a cohesive rebrand and UI system that maximizes **hackathon demo impact**, delivers a **bold but calm** visual identity, and makes the **emergency flow** step-clear under stress — without changing triage logic, routing algorithms, or offline packet encoding.

**Success criteria:**
- Judge sees brand + live journey in ~30 seconds from cold open
- Every screen uses one token + component system
- Emergency flow shows step N of 5, one primary CTA, FSM-first triage
- `npm test` and `tsc` remain green; `reduceMotion` and `fontScale` respected

---

## 2. Visual identity (§1 — approved)

### 2.1 Concept

**“Calm command under pressure”** — precision night-cockpit, not hospital panic or generic SaaS.

### 2.2 Palette

| Role | Token key | Hex | Usage |
|------|-----------|-----|--------|
| Void background | `background` | `#060a12` | App root; optional radial amber wash 8% top-center |
| Glass surface | `surfaceContainer` | `#121a28` | Cards @ ~92% opacity feel |
| Inner highlight | — | `#ffffff14` | 1px inner edge on glass |
| Signal Amber | `primary` | `#f5a623` | Primary CTAs, SOS ring, logo pulse |
| Telemetry Cyan | `secondary` | `#2dd4bf` | Live GPS, journey HUD, locate fix, online chips |
| Clear Mint | `tertiary` | `#6ee7b7` | “I am okay”, GREEN triage, success checks |
| Ice White | `onSurface` | `#e8edf7` | Primary text |
| Warm Fog | `onSurfaceVariant` | `#a8b0c4` | Secondary text |
| Border | `outlineVariant` | `#4f4633` → tune to `#2a3548` | Card borders |
| Triage semantic | `triage.*` | unchanged | RED/YELLOW/GREEN/BLACK — never decorative |

### 2.3 Typography

| Role | Family | Weights | Usage |
|------|--------|---------|--------|
| Display | **Syne** | 600, 700 | Splash wordmark, home hero, emergency step titles |
| Body | **DM Sans** | 400, 500, 700 | Labels, descriptions, onboarding |
| Data | **JetBrains Mono** | 500, 700 | Coords, GHP, speed, step labels, SHA |

Install: `@expo-google-fonts/syne` (+ existing dm-sans, jetbrains-mono).

### 2.4 Shape & depth

- Cards: **16px** radius, optional left accent bar (3px amber/cyan/mint)
- Buttons/inputs: **10px** radius
- Chips: pill (999)
- Depth: **no drop shadows** — inner glow + 1px border; active step may have 4px accent glow at 10% opacity
- Logo: refreshed `NovaLogo` — shield + lane + pulse; amber ring on splash only

### 2.5 Design source

Evolves `docs/design/refs/stitch_nova_drive_mobile_interface/night_highway_hud/DESIGN.md`. **Do not** use `nova_drive` blue/purple palette.

---

## 3. Demo moments (§2 — approved)

### 3.1 Splash — ignition sequence (~3s)

| Time | Element |
|------|---------|
| 0–0.6s | Logo scale 0.7→1 spring; one amber ring pulse |
| 0.6–1.2s | Wordmark NovaDrive (Syne 700) |
| 1.2–1.8s | Tagline: *Signal drops. The critical minute doesn’t.* |
| 1.8–2.2s | Subline (mono): *Offline triage · trauma routing · QR relay* |
| 2.2s+ | Get started (amber, max-width 320) |

- Background: void + subtle lane-line SVG 15% opacity
- `reduceMotion`: static layout, button visible immediately
- Route: `/auth` (unchanged)
- Optional: light haptic on CTA

### 3.2 Home — mission dashboard

1. `HudAppBar` — mark + NovaDrive + cyan **Co-pilot ready** chip  
2. Time-based greeting + optional name  
3. Hero `HudCard` (amber accent) — headline, value prop, journey status mono chips (`IDLE` / `ACTIVE` / `PAUSED`)  
4. Full-width **Start journey** (amber) + **Plan route A→B** (ghost cyan)  
5. **2×2 QuickActionTile** grid: Emergency (amber glow), Scan QR, Medical profile, Replay demo  
6. Footer mono: *Works offline after first setup*

- One fade-up on hero mount (once per session)
- Judge path: Start journey → depart → HUD

### 3.3 Journey departure

- Full-screen void + cyan route polyline stroke animation  
- From → To if trip plan exists; else *Highway mode*  
- Progress: *Initializing telemetry…* with bar (not infinite spinner)  
- Auto-advance to `/journey` when GPS + engine ready; **Skip** ghost for judges  
- Permission denied: calm card + guidance (no red panic)

### 3.4 Journey HUD

- Speed: Syne display, cyan when GPS live, respects `fontScale`  
- Glass telemetry strip (mono grid)  
- `HoldSOSButton` bottom center — 100px amber ring, *Hold 1.5s — emergency*  
- Crash modal: glass panel; mint *I am okay* / amber *Need help*  
- CrashEngine / simulate / 15s timer: **logic unchanged**

### 3.5 Onboarding (supporting)

- `OnboardingShell` — progress dots 1–3, Syne step titles  
- Auth: cyan focus `NovaInput`; Guest secondary  
- Accessibility: slider + preview card (restyle only)

### 3.6 30-second judge script

| Seconds | Screen |
|---------|--------|
| 0–3 | Splash |
| 3–8 | Home |
| 8–12 | Depart |
| 12–20 | Journey HUD |
| Optional | Emergency SOS → §4 |

---

## 4. Emergency calm UX (§3 — approved)

### 4.1 EmergencyStepShell

Used on: `locate`, `triage`, `route`, `packet`, `relay`.

| Slot | Content |
|------|---------|
| Header | `STEP n OF 5 · LABEL` (mono uppercase) |
| Rail | `ProgressRail` — connected dots, cyan completed |
| Title | Syne, short verb |
| Subtitle | One calm sentence |
| Body | Scroll content |
| Footer | Sticky: one primary CTA + optional ghost |

### 4.2 Screen specs

**Locate**
- Glass card: coords (mono large), landmark, accuracy pill  
- Optional static map strip (decorative grid + pin)  
- Primary: Capture location → Continue to triage when fix exists (manual continue, no auto-skip)  
- Secondary: Recapture  

**Triage**
- Hero `QuestionCard` — current FSM question + `AnswerChips` (Yes/No/Unsure), ≥48dp targets  
- `CollapsibleChat` collapsed by default — keyword parser unchanged  
- Result: `SeverityHero` + plain English + single *Route to facility*  
- Copy: FSM-first; chat secondary  

**Route**
- Summary count or honest empty within 100 km  
- `FacilityCard` list — distance cyan if &lt;25 km, tier badge, selection checkmark  
- Primary: Build Golden Hour Packet  
- Secondary: Call 108 (intent)  

**Packet**
- `SeverityHero` + `DispatchPanel` (monospace inset, scroll) + `QrQuietZone`  
- SHA-256 truncated mono line  
- Loading: skeleton pulse; errors: amber-bordered inline fix text  
- Actions: Share/copy + Continue to relay  

**Relay**
- Numbered step cards: cache ✓, SMS 108, complete  
- Primary: Finish  

**SOS**
- Home: Emergency tile in quick grid  
- Journey: `HoldSOSButton` — 1.5s hold unchanged  
- No flashing red fullscreen in emergency  

**Scan**
- Lite shell (no 5-step rail); cyan camera corner brackets; logic unchanged  

### 4.3 Copy guidelines

Explain *why* in one line. Avoid “deterministic FSM” in user-facing subtitle.

### 4.4 Accessibility (emergency)

- Primary CTA height ≥56dp on locate/triage  
- `fontScale` on body; hero question wraps, no truncate at 150%  
- High contrast: white text, thicker borders, brighter amber  

---

## 5. Component system (§4 — approved)

### 5.1 Theme files

- `src/theme/tokens.ts` — §2 palette  
- `src/theme/typography.ts` — font helpers  
- `src/theme/variants.ts` — shared style fragments  
- `src/theme/colors.ts` — aliases to tokens  

### 5.2 Component inventory

| Component | Notes |
|-----------|--------|
| `HudText` | Typed text roles + fontScale |
| `NovaButton` | Variants: primary, secondary, ghost, danger, mint |
| `NovaInput` | Cyan focus glow |
| `HudCard` | Replaces `GlassCard`; variants default/inset/hero/telemetry |
| `HudChip` | live, idle, triage-*, distance |
| `HudAppBar` | + LiveChip |
| `EmergencyStepShell` | Emergency routes |
| `OnboardingShell` | Auth, medical, accessibility |
| `QuickActionTile` | Home grid |
| `QuestionCard` + `AnswerChips` | Triage |
| `CollapsibleChat` | Triage accordion |
| `DispatchPanel` + `QrQuietZone` | Packet |
| `SeverityHero` | Result states |
| `ProgressRail` | Restyled |
| `NovaLogo` | §2.4 refresh |
| `HoldSOSButton` | Visual polish |

Migrate `GlassCard` → `HudCard` in same implementation pass.

### 5.3 Patterns

Adopt shadcn-style **variant composition** in RN (not web shadcn install). Optional skill for implementation: `wshobson/agents@react-native-design`.

---

## 6. Motion & accessibility (§5 — approved)

| Context | Motion |
|---------|--------|
| Splash | §3.1 sequence |
| Home | One mount fade-up |
| Depart | Route stroke + progress bar |
| Journey | SOS ring, modal fade |
| Emergency | 200ms step fade |
| Forbidden | Looping glow, shake, flashing emergency BG |

`a11y.reduceMotion` → disable all sequences.  
`accessibilityLabel` on Hold SOS, chips, step headers.

---

## 7. Implementation phases (§6 — approved)

### Phase 1 — Demo spine
- Theme + Syne fonts + core components (`HudText`, `NovaButton`, `HudCard`, `HudAppBar`, `QuickActionTile`)  
- `splash`, `home`, `journey/depart`, `journey`, `CrashCandidateModal`, `NovaLogo`  

### Phase 2 — Emergency calm
- `EmergencyStepShell` + triage/route/packet components  
- All `app/emergency/*` + `HoldSOSButton` + home emergency tile  

### Phase 3 — Consistency
- `auth`, `medical`, `accessibility`, `trip/plan`, `scan`  
- Remove raw hex outside theme  

### Verification
- `npx tsc --noEmit`  
- `npm test`  
- Manual: judge path, full emergency flow, reduceMotion, 125% fontScale  

---

## 8. Out of scope

- Scream / voice crash ML  
- Supabase production auth  
- Live map SDK  
- POI database re-seed  
- Web app / literal shadcn-ui install  
- Changes to START FSM rules, GHP schema, crash countdown behavior, or auto-triage at timer zero  

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Syne font load delay | Block splash on fonts (existing `_layout` pattern) |
| Contrast regression | Test high contrast + 150% fontScale on triage |
| Scope creep | Phased delivery; Phase 1 shippable alone |
| Inconsistent mid-app | Phase 3 explicit hex audit |

---

## 10. Approval record

| Section | Approved |
|---------|----------|
| §1 Visual identity | 2026-05-22 — user yes |
| §2 Demo moments | 2026-05-22 — user yes |
| §3 Emergency calm | 2026-05-22 — user yes |
| §4–§6 Components, motion, phases | 2026-05-22 — user yes |
| Approach | Command Bridge (2) |

**Next step:** User reviews this spec → implementation plan (`writing-plans` skill) → user says `go` on plan → code.
