# Margi Phase 3 — Production Integrations Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship v2.0.0 with real Supabase auth, NGO registry, OSRM routing, Gemini Sarthi BFF, HTTP dispatch automation, native crash hooks, and zero fake-button CTAs.

**Design spec:** [../specs/2026-05-28-phase3-production-design.md](../specs/2026-05-28-phase3-production-design.md)

---

### Task 1: Supabase + auth

- [x] `supabase/migrations/20260528_phase3_core.sql`
- [x] `src/lib/supabase/client.ts`, `authSession.ts`, `profileSync.ts` + tests
- [x] `app/auth.tsx` sign-in / sign-up / guest tabs
- [x] `.env.example` Supabase keys

### Task 2: HTTP dispatch

- [x] `dispatchOrchestrator.ts` + tests
- [x] Wire `activationAuto`, `response.tsx`, `autoDispatchMedical`
- [x] Remove fake transport/signal alerts

### Task 3: OSRM routing

- [x] `nominatim.ts`, `osrm.ts`, `tripRoute.ts` + tests
- [x] Extend `tripPlanCache`; `PlanCorridorMap` GeoJSON polyline
- [x] `PlanCorridorScreen` online route metrics

### Task 4: NGO registry

- [x] `volunteerProviders.ts` + tests
- [x] `app/ngo/register.tsx`, `app/ngo/index.tsx`
- [x] Wire alternate transport on `response.tsx`

### Task 5: Gemini Sarthi

- [x] `GET /api/sarthi/health` in novadrive BFF
- [x] Mobile connection chip; remove voice placeholder alerts
- [x] Sarthi action card navigation

### Task 6: Native crash

- [x] `nativeCrashAdapter.ts`, `crashOrchestrator.ts` + tests
- [x] `expo-dev-client`; AppContext + modal source label

### Task 7: Fake-button sweep

- [x] profile, settings, sarthi remediated

### Task 8: Release v2.0.0

- [x] CHANGELOG, VERSION_HISTORY, smoke matrix, tag `v2.0.0-production`
