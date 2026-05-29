# Honest Research Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish CANON.md as single truth, soften production claims, archive doc index, add facilitiesDb tests and Maestro smoke flow definitions.

**Architecture:** Documentation hub-and-spoke from `docs/CANON.md`; code changes limited to tests + Maestro YAML; no feature creep.

**Tech Stack:** Markdown, Jest/ts-jest, Maestro YAML, Expo SDK 54.

---

### Task 1: CANON.md and archive index

**Files:**
- Create: `docs/CANON.md`
- Create: `docs/archive/README.md`
- Modify: `README.md`, `JUDGE_START_HERE.md`

- [ ] Write `docs/CANON.md` (what Margi is, what it is not, repo map, demo path, honesty table)
- [ ] Write `docs/archive/README.md` listing historical/aspirational docs
- [ ] Link CANON from README and JUDGE_START_HERE

### Task 2: Deprecation banner on master brief

**Files:**
- Modify: `docs/MARGI_MASTER_BRIEF.md` (top banner only)

- [ ] Add banner pointing to CANON + native app reality

### Task 3: Research prototype language sweep

**Files:**
- Modify: `docs/SUBMISSION.md`, `docs/PHASE3_SETUP.md`, `README.md`

- [ ] Replace “Phase 3 production” with “Phase 3 integration (optional demo)”
- [ ] Clarify `v2.0.0-production` is a **release tag name**, not clinical production

### Task 4: facilitiesDb tests (TDD)

**Files:**
- Create: `novadrive-mobile/src/lib/facilitiesDb.test.ts`

- [ ] Mock expo-sqlite with seeded nodes
- [ ] Test RED triage prefers trauma over clinic
- [ ] Test POI_DATA_VERIFIED export

### Task 5: Maestro smoke flows

**Files:**
- Create: `novadrive-mobile/.maestro/*.yaml` (5 flows)
- Create: `docs/MAESTRO_SMOKE.md`

- [ ] guest-launch, drive-mode-entry, explore-tab, naari-portal-gate, scan-tab

### Task 6: Verify and commit

- [ ] `npm test`, `verify:docs`, `verify:branding` in novadrive-mobile
- [ ] Commit Phase B
