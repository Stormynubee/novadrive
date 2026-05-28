# Hackathon submission — NovaDrive (RoadSoS 2026)

**Team repo:** [github.com/Stormynubee/novadrive](https://github.com/Stormynubee/novadrive)  
**Brief site:** [roadsafetyhackathon-six.vercel.app](https://roadsafetyhackathon-six.vercel.app)  
**Track:** RoadSoS — AI emergency chatbot + location-based services  
**Deadline:** May 31, 2026, 11:59 PM IST

---

## Deliverables checklist

| Item | Location | Status |
|------|----------|--------|
| Android-capable Expo app | `novadrive-mobile/` | P0 built |
| START triage FSM + tests | `src/lib/startTriageFSM.ts` | ✅ `npm test` |
| Offline POI routing | SQLite in app | ✅ 50+ seeded nodes |
| GHP + QR + SMS 108 | `emergency/packet`, `relay`, `scan` | ✅ |
| Naari Shakti portal | `app/naari-shakti.tsx`, `src/lib/naariShakti/` | ✅ |
| Distress voice detection | `src/lib/voice/*`, design spec, smoke rows 23–26 | ✅ 135 mobile unit tests |
| Implementation plan | `docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md` | ✅ |
| Team brief + PDF | `docs/NOVADRIVE_MASTER_BRIEF.md` | ✅ |
| Slide deck | Team asset (7 slides per plan §20) | Team |
| Word doc + 90s script | Team asset | Team |

---

## P0 acceptance test (airplane mode)

1. Complete onboarding → **Continue as Guest**
2. Home → **ENTER DRIVE MODE** → Trip tab → **Start Driving** → grant location
3. **Hold for SOS** (3s on HUD) → emergency flow
4. **Capture location** → START triage (try chat: *"not breathing, can't walk"*)
5. Select **trauma-tier** facility → **Golden Hour Packet** + QR
6. Enable **airplane mode** — GHP text and QR still visible
7. Second device: **Scan bystander QR** → cache relay → disable airplane mode → **SMS 108**

---

## Naari Shakti acceptance test (optional, ~2 min)

1. Guest onboarding → **Medical profile** → gender **Female**
2. Home → stacked **NAARI SHAKTI** card → **Enable Portal** on protocol modal
3. Portal → **Safety Mode** ON → hold **Emergency Help** 2s (once)
4. Confirm orange distress HUD + SMS composer with coordinates (tap **Send** in OS Messages)

Smoke matrix rows 13–15: [novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md](../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md)

## Distress voice acceptance test (optional, ~1 min)

Requires **Voice Crash Detection** ON (Profile) and an active journey unless testing Naari-only (row 26).

1. Start journey → switch to Home, Community, and Settings tabs → **no** distress modal from UI sounds or app speech (row 23).
2. Play a phone notification chime during journey → **no** modal (row 24).

Smoke matrix rows 23–26: [novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md](../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md)

---

## 90-second demo script (outline)

| Sec | Beat |
|-----|------|
| 0–15 | Problem: highway blackout, 108 can't hear you |
| 15–30 | Home → ENTER DRIVE MODE → Start journey — calm HUD, not panic alarm |
| 30–45 | Simulate crash → 15s calm dialog — "nothing auto-sent" |
| 45–60 | Hold SOS → triage → RED → trauma center routing |
| 60–75 | GHP on screen + QR for bystander |
| 75–90 | Airplane mode + scan on phone 2 → SMS when online |

Full script: implementation plan §17.

### Optional Naari beat (appendix, ~15s)

| Sec | Beat |
|-----|------|
| 0–5 | Same problem — women need a dedicated silent distress lane |
| 5–15 | Female profile → Enable Portal → hold emergency → instant HUD + SMS to nearest station |

---

## Slide talking points (7)

1. Signal drops; golden hour doesn't  
2. START FSM — medically correct, offline  
3. Trauma-tier routing, not nearest clinic  
4. GHP + human SMS to 108  
5. QR bystander relay  
6. Honest crash detection (fusion, not fake OS API)  
7. Roadmap: Rah-Veer, buses, Supabase production  

Details: implementation plan §20.

---

## Build commands for judges

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npm test
npx expo run:android
```

---

## GitHub

Repository: **novadrive** — rename from legacy slug in GitHub Settings → General if your remote still points to the old name.

Latest release tag: **`v1.4.0-distress-voice`** — see [VERSION_HISTORY.md](VERSION_HISTORY.md).
