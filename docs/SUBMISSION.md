# Hackathon submission — Margi (RoadSoS 2026)

**Start here:** [JUDGE_START_HERE.md](../JUDGE_START_HERE.md) (5-minute judge path)

**Team repo:** [github.com/Stormynubee/Margi](https://github.com/Stormynubee/Margi)  
**Brief site:** [roadsafetyhackathon-six.vercel.app](https://roadsafetyhackathon-six.vercel.app)  
**Track:** RoadSoS — AI emergency chatbot + location-based services  
**Deadline:** May 31, 2026, 11:59 PM IST

---

## Deliverables checklist

| Item | Location | Status |
|------|----------|--------|
| Android-capable Expo app | `novadrive-mobile/` | P0 built |
| **Debug APK (judges)** | GitHub Release `v2.0.0-production` → `margi-debug.apk` | See [BUILD_APK.md](../novadrive-mobile/scripts/BUILD_APK.md) |
| START triage FSM + tests | `src/lib/startTriageFSM.ts` | ✅ `npm test` |
| Offline POI routing | SQLite in app | ✅ ~50 demo nodes (11 curated NH48 + padding) |
| GHP + QR + SMS 108 | `emergency/packet`, `relay`, `scan` | ✅ |
| Web bystander relay | `novadrive/src/app/relay/` | ✅ browser decode |
| Naari Shakti portal | `app/naari-shakti.tsx`, `src/lib/naariShakti/` | ✅ |
| Distress voice detection | `src/lib/voice/*` (experimental) | ✅ 173+ mobile unit tests |
| Phase 3 production | Supabase, Sarthi BFF, HTTP dispatch | ✅ [PHASE3_SETUP.md](PHASE3_SETUP.md) |
| Implementation plan | `docs/MARGI_FINAL_IMPLEMENTATION_PLAN.md` | ✅ |
| Team brief + PDF | `docs/MARGI_MASTER_BRIEF.md` | ✅ |
| Slide deck | Team asset (7 slides per plan §20) | Team |
| Word doc + 90s script | Team asset | Team |

---

## P0 acceptance test (airplane mode)

1. Complete onboarding → **Continue as Guest**
2. Home → **ENTER DRIVE MODE** → Trip tab → **Start Driving** → grant location
3. **Hold for SOS** (3s on HUD) → SMS 108 composer may open → activation → trauma response
4. **Manual mode** on activation → START triage (try chat: *"not breathing, can't walk"*)
5. Select **trauma-tier** facility → **Golden Hour Packet** + QR + web relay link
6. Enable **airplane mode** — GHP text and QR still visible
7. Second device: **Scan bystander QR** or open web relay URL → cache relay → **SMS 108**

---

## Build commands for judges

**Preferred:** Download `margi-debug.apk` from [Releases](https://github.com/Stormynubee/Margi/releases/tag/v2.0.0-production).

**From source:**

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npm test
npx expo run:android
```

---

## GitHub

Repository: **[Stormynubee/Margi](https://github.com/Stormynubee/Margi)** — product name **Margi**; folder names `novadrive*` retained for history.

Latest release tag: **`v2.0.0-production`** — see [VERSION_HISTORY.md](VERSION_HISTORY.md).

**Unit tests:** 179 (`cd novadrive-mobile && npm test`)

**Honest limits:** START triage is decision support only (not physician-certified). Crash/voice detection experimental. POI data is demo seed — verify facilities by phone.
