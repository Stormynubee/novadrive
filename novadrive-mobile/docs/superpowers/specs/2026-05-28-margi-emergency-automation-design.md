# Margi Emergency Automation & Location Safety — Design Spec

**Date:** 2026-05-28  
**Status:** Approved for implementation

## Goal

Restore reliable hold-SOS → Incident Tracker flow, then automate ICE + 108 SMS, nearest-hospital Maps navigation, location-aware Sarthi, and geo-filtered local safety alerts—while reducing false distress modals.

## Emergency flow

1. Hold SOS (3s) → `/emergency/selection` (Incident Tracker)
2. User picks incident → `/emergency/activation` (6s auto countdown)
3. `runEmergencyOrchestrator` runs once before trauma response:
   - GPS capture
   - ICE SMS (if `notifyEmergencyContacts` and primary contact phone)
   - 108 SMS with GPS body
   - Rank nearest trauma facility → `selectFacility` + Maps intent
4. Auto-navigate → `/emergency/response` with Call ICE FAB + Navigate to hospital

Manual Quick SOS / header emergency uses the same path.

## Components

| Module | Responsibility |
|--------|----------------|
| `emergencyOrchestrator.ts` | Side-effect orchestration (SMS, rank, maps) |
| `emergencySms.ts` | ICE + 108 SMS intents |
| `facilitiesDb.ts` | Facility includes lat/lng |
| `localSafetyAlerts.ts` | Haversine filter for community alerts |
| `HoldSOSButton.tsx` | 120ms release grace |

## False distress

- Default `voiceCrashDetection: false`
- No auto-SMS at crash countdown 0
- Voice classifier medium: 4/5 frames required

## Platform constraints

SMS and dial use OS intents; user must confirm Send/Call.

## Testing

212+ unit tests; device smoke: hold SOS → selection → activation → ICE/108 → Maps.
