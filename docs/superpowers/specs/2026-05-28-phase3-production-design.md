# Margi Phase 3 — Production Integrations Design Spec

**Date:** 2026-05-28  
**Status:** Approved for implementation  
**Release:** v2.0.0-production

## Goals

1. **Supabase auth** — Email/password sign-in and sign-up; profiles synced to local cache for offline screens.
2. **NGO volunteer registry** — `volunteer_providers` table + register/list UI; real alternate-transport notify on emergency response.
3. **OSM/OSRM routing** — Nominatim geocode + OSRM driving route; GeoJSON polyline on trip map; offline static catalog fallback.
4. **Gemini Sarthi** — Deployed BFF with health check; connection status chip; remove voice placeholder alerts.
5. **HTTP dispatch automation** — Auto activation mode POSTs trauma/police endpoints; `dispatch_events` audit; no fake Alert CTAs.
6. **Native crash (Android-first)** — Dev-client native adapter merged with sensor fusion; UI source label `OS` | `Sensors` | `Manual`.
7. **Fake-button remediation** — No production path whose sole action is a placeholder alert (guest disclaimers excepted).

## Architecture

| Layer | Responsibility |
|-------|----------------|
| Supabase Postgres | `profiles`, `volunteer_providers`, `dispatch_events`; RLS per user |
| Mobile SQLite/AsyncStorage | Offline GHP, journey logs, profile cache |
| Public OSRM/Nominatim | Online A→B route (demo); self-host documented |
| `novadrive` Next BFF | Gemini 2.0 Flash Sarthi chat + `GET /api/sarthi/health` |
| `dispatchAdapters.ts` | POST trauma/police JSON (`center` / `unit` shape) |
| `crashOrchestrator` | Native events + `crashEngine` fusion |

## Supabase schema

- **profiles** — `id` (auth.users FK), `display_name`, `email`, `medical_json`, `settings_json`, `gov_employee`, `updated_at`
- **volunteer_providers** — org, contact, phone, service_area, lat/lng, `verified`
- **dispatch_events** — user_id, reference_id, payload_json, status

RLS: own profile R/W; public read verified volunteers; insert own volunteer row.

## Auth UX

Tabs: Sign in | Create account | Guest demo. Password fields. Session in SecureStore via Supabase client. On success sync to `storage.ts`.

## NGO product

Register with GPS pin; list nearby verified (Haversine). Alternate transport queries Supabase + optional SMS intent per phone (user confirms).

## OSRM flow

1. Geocode destination (Nominatim, User-Agent, debounce).
2. Route via OSRM `overview=full&geometries=geojson`.
3. Extend `CachedTripPlan` with polyline, distanceM, durationS.
4. `PlanCorridorMap` renders GeoJSON path when present; schematic fallback offline.

## Dispatch (auto mode)

After splash + location: `dispatchOrchestrator.requestAutoDispatch` → adapters → persist `dispatch_events` when signed in. Respect `settings.autoDispatchMedical`. Fail closed if env URLs missing (inline error, not silent `.local`).

## Crash rules

Journey `ACTIVE`; user confirm before emergency; source badge; iOS native only with entitlement; Expo Go unsupported — `expo run:android` dev build.

## Out of scope

Realtime volunteer GPS, silent auto-dial, MapLibre offline tiles, NGO admin dashboard.

## Testing

TDD for `authSession`, `volunteerProviders`, `osrm`, `tripRoute`, `dispatchOrchestrator`, `crashOrchestrator`. Target 180+ unit tests. DEVICE_SMOKE_MATRIX rows 27–32.
