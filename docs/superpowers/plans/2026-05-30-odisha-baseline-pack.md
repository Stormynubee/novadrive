# Odisha Baseline Pack (Tier 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When GPS is outside the verified NH48 pack, Margi enters baseline mode — 108-first UX, inferred state in GHP, no fake hospital routing.

**Architecture:** `resolveRegionalCoverage(lat,lng)` gates route UX and `buildPacket` 108 fallback; coarse `indianStateBboxes` infers state offline; Naari returns 112 when demo stations are >150 km away.

**Tech Stack:** Expo React Native, Jest/ts-jest, TypeScript

**Design spec:** [docs/superpowers/specs/2026-05-30-odisha-baseline-pack-design.md](../specs/2026-05-30-odisha-baseline-pack-design.md)

---

### Task 1: Regional coverage module

**Files:**
- Create: `novadrive-mobile/src/lib/indianStateBboxes.ts`
- Create: `novadrive-mobile/src/lib/regionalCoverage.ts`
- Test: `novadrive-mobile/src/lib/indianStateBboxes.test.ts`
- Test: `novadrive-mobile/src/lib/regionalCoverage.test.ts`

- [x] Write failing tests for NH48 verified vs Odisha baseline vs TN outside pack
- [x] Implement bbox tables and `resolveRegionalCoverage`
- [x] Run: `npm test -- --testPathPattern="regionalCoverage|indianStateBboxes"`

---

### Task 2: GHP state inference + baseline 108

**Files:**
- Modify: `novadrive-mobile/src/lib/ghp.ts`
- Test: `novadrive-mobile/src/lib/ghp.test.ts`

- [x] Export `DISPATCH_108`
- [x] `resolvePacketFacility` — baseline RED/YELLOW without facility → 108
- [x] `emergency.state` from `resolveRegionalCoverage`
- [x] Run: `npm test -- --testPathPattern=ghp.test`

---

### Task 3: Route screen 108-first baseline UX

**Files:**
- Modify: `novadrive-mobile/app/emergency/route.tsx`

- [x] Compute `coverage` and `baselineMode`
- [x] Auto-select `DISPATCH_108` in baseline mode
- [x] Primary `Call 108`, secondary `Build Golden Hour Packet`
- [x] Baseline copy per design spec

---

### Task 4: Naari national fallback

**Files:**
- Modify: `novadrive-mobile/src/lib/naariShakti/stations.ts`
- Test: `novadrive-mobile/src/lib/naariShakti/stations.test.ts`

- [x] Add `NATIONAL_EMERGENCY_STATION` (112)
- [x] Return fallback when nearest demo station > 150 km
- [x] Run: `npm test -- --testPathPattern=stations.test`

---

### Task 5: Docs and disclaimer

**Files:**
- Modify: `docs/CANON.md`
- Modify: `JUDGE_START_HERE.md`
- Modify: `novadrive-mobile/src/components/MedicalDisclaimerBanner.tsx`

- [x] CANON honesty rows for baseline mode + Naari 112 fallback
- [x] Judge start here NH48 vs baseline note
- [x] Disclaimer mentions NH48 verified vs baseline

---

### Task 6: Verification

- [x] Run: `cd novadrive-mobile && npm test -- --testPathPattern="ghp.test|regionalCoverage|indianStateBboxes|stations.test"`
- [ ] Full suite: `cd novadrive-mobile && npm test` (optional regression)

---

## Manual smoke (Odisha baseline)

1. Mock GPS to Bhubaneswar (20.2961, 85.8245) via emulator extended controls or dev location override.
2. SOS → triage RED → Route screen shows **Odisha · Baseline coverage** and **Call 108** primary.
3. Build GHP — packet `emergency.state` should be **Odisha**, routing phone **108**.
4. Naari portal with same GPS — nearest station should be **National emergency (112)**.

## Future

Add `odisha_nh16` pack bbox to `resolveRegionalCoverage` when verified POI CSV exists — no emergency-flow rewrite required.
