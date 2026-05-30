# Odisha Baseline Pack (Tier 0) — Design Spec

**Date:** 2026-05-30  
**Status:** Approved for implementation  
**Scope:** Tier 0 only — national baseline mode outside verified NH48 pack

---

## 1. Purpose

When a user’s GPS is outside the verified NH48 Chennai corridor pack (e.g. an accident in Odisha), Margi must **not** imply nearby verified hospitals exist. Instead it enters **baseline mode**: 108-first actions, Golden Hour Packet with correct inferred state, and honest UI copy.

This slice does **not** ship Odisha hospital POI data.

---

## 2. Problem

| Gap | Today |
|-----|--------|
| Hospital routing | Only NH48 seed; empty list outside bbox |
| GHP metadata | Hardcoded `state: 'Tamil Nadu'` |
| Route UX | 108 is secondary “Build packet anyway” |
| Naari police | Always picks nearest Chennai demo station |

---

## 3. Approach (selected)

**Approach A — Coverage module:** `resolveRegionalCoverage(lat, lng)` drives route UX, GHP state inference, and baseline 108 fallback.

Rejected: route-only copy patches (B); separate baseline screen stack (C).

---

## 4. Architecture

### 4.1 `regionalCoverage.ts`

```typescript
type RegionalCoverage = {
  mode: 'verified_pack' | 'baseline';
  packId: 'nh48' | 'none';
  stateName: string;
  emergencyDial: '108';
  hasVerifiedHospitals: boolean;
};
```

**Rules:**
- `verified_pack` inside NH48 bbox: `south 12.65, west 79.85, north 13.15, east 80.35`
- `baseline` otherwise
- `stateName` from offline `indianStateBboxes.ts` (coarse rectangles, no network)

### 4.2 GHP (`ghp.ts`)

- Export `DISPATCH_108` facility constant
- `emergency.state` = inferred state from GPS
- `buildPacket`: RED/YELLOW + baseline coverage + no facility → use 108 (same as BLACK)

### 4.3 Route UX (`emergency/route.tsx`)

When baseline or empty facility list:
- Primary: Call 108
- Secondary: Build Golden Hour Packet (enabled immediately)
- Copy: “No verified hospitals in your area. Baseline mode — call 108 and share your GPS + triage.”
- Show: `{stateName} · Baseline coverage`
- Auto-select 108 facility on mount

### 4.4 Naari (`stations.ts`)

If nearest demo station > 150 km → return national 112 fallback.

---

## 5. UX copy (exact)

**Route baseline card headline:** `{stateName} · Baseline coverage`  
**Body:** `No verified hospitals in your area. Baseline mode — call 108 and share your GPS + triage.`

**Buttons:** `Call 108` (primary urgent), `Build Golden Hour Packet` (secondary)

---

## 6. Testing

| File | Cases |
|------|-------|
| `regionalCoverage.test.ts` | NH48 → verified; Bhubaneswar → baseline + Odisha |
| `indianStateBboxes.test.ts` | Odisha coords; Tamil Nadu coords |
| `ghp.test.ts` | Baseline RED → 108 + Odisha state; NH48 → Tamil Nadu |
| `stations.test.ts` | Far coords → 112 fallback |

---

## 7. Out of scope

- Odisha OSM ingest / verification CSV
- OTA pack downloads
- Maps “hospitals near me”
- EMS / 108 API integration

---

## 8. Future hook

Add `packId: 'odisha_nh16'` + bbox when verified Odisha pack exists; `resolveRegionalCoverage` returns `verified_pack` inside that bbox without rewriting emergency flow.

---

## 9. Docs updates

- `docs/CANON.md`: NH48 verified pack vs national baseline mode
- `JUDGE_START_HERE.md`: one line on NH48 vs baseline demo
