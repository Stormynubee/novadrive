# NovaDrive device smoke matrix

Run after stabilization changes on a physical Android device (Expo dev client or release build).

| # | Flow | Steps | Expected |
|---|------|-------|----------|
| 1 | Plan Corridor | Home → ENTER DRIVE MODE → Trip tab | Map + bottom sheet; route cards scroll; **Start Driving** visible |
| 2 | Full drive | Start Driving → calibration → HUD | Cancel never leaves ghost `ACTIVE`; HUD speed + SOS hold 3s |
| 3 | End journey | HUD menu → Exit drive OR End trip → complete | Trip destination cleared; Home reachable |
| 4 | Settings gear | Open settings from Home, Trip, Community, Profile | `/settings` Configuration screen |
| 5 | Profile tab | Tap Profile in tab bar | Highlights correctly; no crash |
| 6 | Profile photo | Change photo on Profile | Picker opens; avatar persists |
| 7 | Voice off | Settings/Profile: voice crash detection off → journey | No mic; HUD voice standby |
| 8 | Distress modal | Simulate crash on HUD only | Modal on foreground journey; no backdrop dismiss |
| 9 | Idle safety | Home/Community idle | No distress modal from voice/impact |
| 10 | Sensor check | Profile → Motion Sensor Calibration | Preview only; no live journey |
| 11 | Emergency SOS | Hold SOS 3s on HUD | Emergency locate flow |
| 12 | Accessibility | Profile → Accessibility | Back returns to profile |

**Commands before release:** `npm run typecheck` · `npm test`
