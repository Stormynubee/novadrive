# Margi Stabilization Implementation Plan

> **For agentic workers:** Use executing-plans or implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Stabilize Margi mobile (routing, journey safety, tests, Stitch-aligned Trip/HUD) without changing Plan Corridor → Calibration → Live HUD product flow.

**Architecture:** Phased fixes in `AppContext` + safety bridges first; pure helpers in `src/lib` with Jest; shared `PlanCorridorScreen` for Trip tab.

**Tech Stack:** Expo Router, React Native, expo-location/sensors/audio, Jest + ts-jest, GitHub Actions.

---

## Phase 1 — Critical bugs

### Task 1.1: Tab and journey routing

**Files:**
- Modify: `src/components/NovaTabBar.tsx`
- Modify: `src/context/AppContext.tsx`
- Modify: `app/journey/depart.tsx`
- Modify: `app/(tabs)/profile.tsx`

- [x] Profile href `/(tabs)/profile`
- [x] `resetJourneyRuntime` on end/finish
- [x] Depart cancel race + `calibrateOnly=1`

### Task 1.2: Voice, impact, modal

**Files:**
- Modify: `src/components/CrashCandidateModal.tsx`
- Modify: `src/components/JourneyVoiceMonitor.tsx`
- Modify: `src/components/SafetyMonitorBridge.tsx`

- [x] Modal: no backdrop dismiss
- [x] Recorder stop on unmount
- [x] Voice gating via settings only

### Task 1.3: Copy and navigation

**Files:**
- Modify: `app/journey.tsx`, `app/journey/complete.tsx`

- [x] Exit drive copy; complete thank-you → Home

---

## Phase 2 — TDD and CI

### Task 2.1: Tooling

**Files:**
- Modify: `package.json`, `jest.config.js`, `tsconfig.json`
- Create: `.github/workflows/ci.yml`

- [x] `typecheck`, `test:coverage`, `test:watch`
- [x] Include `*.test.ts` in typecheck

### Task 2.2: Unit tests

**Files:**
- Create: `src/lib/parseEmergencyText.test.ts`
- Create: `src/lib/ghp.test.ts`
- Create: `src/lib/storage.test.ts`
- Create: `src/lib/journeyMonitoring.ts` + `.test.ts`
- Modify: `src/lib/crashEngine.ts`, `crashEngine.test.ts`, `startTriageFSM.test.ts`

- [x] All suites green (32 tests)

---

## Phase 3 — UI structure

### Task 3.1: Plan Corridor extraction

**Files:**
- Create: `src/components/PlanCorridorScreen.tsx`
- Modify: `app/(tabs)/drive.tsx`

- [x] Single Plan Corridor implementation

### Task 3.2: Trip dedup and accessibility

**Files:**
- Modify: `app/trip/plan.tsx`, `app/accessibility.tsx`, `app/(tabs)/profile.tsx`

- [x] Discover links; `fromProfile` back nav

### Task 3.3: Smoke matrix

**Files:**
- Create: `docs/DEVICE_SMOKE_MATRIX.md`

- [x] Manual verification checklist

---

## Verification

```bash
npm run typecheck
npm test
```

Then run `docs/DEVICE_SMOKE_MATRIX.md` on device.
