# Margi device smoke matrix

Run after stabilization changes on a physical Android device (Expo dev client or release build).

| # | Flow | Steps | Expected |
|---|------|-------|----------|
| 1 | Plan Corridor | Home → ENTER DRIVE MODE → Trip tab | Map + bottom sheet; route cards scroll; **Start Driving** visible |
| 2 | Full drive | Start Driving → calibration → HUD | Fixed HUD (no scroll); **SOS strip at top**; compact speedo; menu offers End trip & summary |
| 3 | End journey | HUD menu → Exit drive OR End trip → complete | Trip destination cleared; Home reachable |
| 4 | Settings gear | Open settings from Home, Trip, Community, Profile | `/settings` Configuration screen |
| 5 | Profile tab | Tap Profile in tab bar | Highlights correctly; no crash |
| 6 | Profile photo | Change photo on Profile | Picker opens; avatar persists |
| 7 | Voice off | Settings/Profile: voice crash detection off → journey | No mic; HUD voice standby |
| 8 | Distress modal | Simulate crash on HUD only | Modal on foreground journey; no backdrop dismiss |
| 9 | Idle safety | Home/Community idle | No distress modal from voice/impact |
| 10 | Sensor check | Profile → Motion Sensor Calibration | Preview only; no live journey |
| 11 | Emergency SOS | Hold SOS 3s on **top HUD strip** (no scroll) | Emergency Activation splash opens, then Trauma Response |
| 12 | Accessibility | Profile → Accessibility | Back returns to profile |
| 13 | Naari home (female) | Medical → Female → Home | Stacked drive + Naari cards; male profile shows drive card only |
| 14 | Naari protocol + portal | Tap Naari → Enable Portal → Safety Mode ON | Portal loads; toggle persists |
| 15 | Naari emergency hold | Hold Emergency Help 2s once | Distress HUD on first hold; SMS composer opens; no second hold needed |
| 16 | Home weather | Home → Daily Safety Brief (location on) | City + °C from GPS; Open-Meteo summary |
| 17 | Home weather denied | Deny location permission | “Location unavailable” + settings hint; no crash |
| 18 | Safety briefs | Tap Protocol Alpha / Regional Alert | Detail screens with institutional copy |
| 19 | Quick SOS confirm | Tap Quick SOS → Cancel | Stays on home; no activation screen |
| 20 | Quick SOS proceed | Tap Quick SOS → Proceed | Activation splash with language + mode selector |
| 20b | Trauma response | Activation auto/guided → scroll down | Chatbot, first-aid board, dispatch cards, QR visible |
| 21 | Report Hazard | Tap Report Hazard | Feedback form with safety category |
| 22 | Sarthi home widget | Home → peek bubble → FAB → expand | Peek 5s; pulse FAB; mini panel + quick links + chat |
| 23 | Journey + tab switch | Active journey → Home / Community / Settings tabs | No distress modal from UI sounds or app speech |
| 24 | Journey + notification | Play phone notification chime during journey | No distress modal |
| 25 | Journey + test yell | Loud intentional yell near mic (test only) | Distress modal after ~1–2 s confirmation |
| 26 | Naari only | Safety Mode ON, no active journey, idle on portal/home | Mic policy active; no false modal while idle |

**Commands before release:** `npm run typecheck` · `npm test`
