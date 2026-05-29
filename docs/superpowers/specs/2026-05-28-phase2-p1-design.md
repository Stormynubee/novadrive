# Margi Phase 2 P1 — Design Spec

**Date:** 2026-05-28  
**Status:** Approved for implementation  
**Releases:** v1.6.0 (HUD) · v1.7.0 (P1 features)

## Goals

1. **Drive HUD** — SOS at top, compact speedometer, fixed layout (no scroll while driving).
2. **Rah-Veer** — Government Good Samaritan framing for bystanders; local claim log; reliable GHP on QR scan.
3. **Trip intelligence** — Offline briefing cards on Trip tab; optional HUD chip; scroll debrief saved to SQLite + settings history.
4. **TTS narrator** — START FSM questions spoken when accessibility TTS is on.
5. **Offline cards** — Plan cache in AsyncStorage; briefing data from structured sources (not only hardcoded).

## v1.6.0 — Drive HUD

### Layout (top → bottom)

| Zone | Content |
|------|---------|
| Header | Menu (exit options), Margi, emergency-share |
| SOS strip | Full-width hold SOS (`hudTop` variant, 3s hold) |
| Telemetry | Voice + motion sensor row |
| Speed | Compact ring 168px, 40px digits, zone limit badge |
| Footer | End trip (production); dev tools `__DEV__` only |

### Exit menu

Alert actions: Stay · Exit to Home · **End trip & summary** → `/journey/complete`.

### Constants

- `HUD_SPEEDO_SIZE = 168`
- `HUD_SOS_ZONE = 'top'`

## v1.7.0 — Rah-Veer

- Screen `rahveer/index` — MoRTH Good Samaritan explainer, link to official portal (external browser).
- Screen `rahveer/claim` — Log claim ticket locally (SQLite `rahveer_claims`).
- After successful scan: CTA to Rah-Veer + save relay chain entry.
- `scan.tsx`: prefer full GHP decode; fallback reconstruct only if legacy minimal QR.

## v1.7.0 — Trip + debrief

- `PlanCorridorScreen`: collapsible briefing cards when route selected.
- `journey/complete`: sections Stats · Incidents · Route · Feedback; persist `summary_json` on journey log.
- `settings/journey-history`: list recent journeys, tap for read-only debrief.

## v1.7.0 — TTS

- `src/lib/tts/narrator.ts` — `speakTriagePrompt(nodeId, lang)` with policy mute hooks.
- Wired on triage screen mount/step change when `a11y.ttsEnabled`.

## v1.7.0 — Offline

- `tripPlanCache.ts` — AsyncStorage `nd_last_trip_plan`.
- `tripBriefing.ts` — keep hazard fallbacks; structure for DB rows when present.

## Out of scope

- OSM offline tiles, bus mode, Supabase, fake government APIs.

## Testing

- TDD for layout spec, journey DB summary, rahveer claims, narrator, plan cache, ghp round-trip.
- Update DEVICE_SMOKE_MATRIX for HUD SOS position.
