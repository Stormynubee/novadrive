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
| Implementation plan | `docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md` | ✅ |
| Team brief + PDF | `docs/NOVADRIVE_MASTER_BRIEF.md` | ✅ |
| Slide deck | Team asset (7 slides per plan §20) | Team |
| Word doc + 90s script | Team asset | Team |

---

## P0 acceptance test (airplane mode)

1. Complete onboarding → **Continue as Guest**
2. **Start journey** → grant location
3. **Hold for SOS** (1.5s) → emergency flow
4. **Capture location** → START triage (try chat: *"not breathing, can't walk"*)
5. Select **trauma-tier** facility → **Golden Hour Packet** + QR
6. Enable **airplane mode** — GHP text and QR still visible
7. Second device: **Scan bystander QR** → cache relay → disable airplane mode → **SMS 108**

---

## 90-second demo script (outline)

| Sec | Beat |
|-----|------|
| 0–15 | Problem: highway blackout, 108 can't hear you |
| 15–30 | Start journey — calm HUD, not panic alarm |
| 30–45 | Simulate crash → 15s calm dialog — "nothing auto-sent" |
| 45–60 | Hold SOS → triage → RED → trauma center routing |
| 60–75 | GHP on screen + QR for bystander |
| 75–90 | Airplane mode + scan on phone 2 → SMS when online |

Full script: implementation plan §17.

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
