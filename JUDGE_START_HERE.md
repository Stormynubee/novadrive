# Judge start here — Margi (5 minutes)

**Margi** is an offline-first Golden Hour **research prototype** for Indian highway corridors (IIT Madras RoadSoS 2026). **Canonical scope:** [docs/CANON.md](docs/CANON.md).

| | |
|---|---|
| **Repo** | [github.com/Stormynubee/Margi](https://github.com/Stormynubee/Margi) |
| **Release tag** | [`v2.0.0-production`](https://github.com/Stormynubee/Margi/releases/tag/v2.0.0-production) (demo build — not clinical production) |
| **Brief site** | [roadsafetyhackathon-six.vercel.app](https://roadsafetyhackathon-six.vercel.app) |
| **Full checklist** | [docs/SUBMISSION.md](docs/SUBMISSION.md) |

---

## Fastest path: install the APK

1. Open **GitHub → Releases → `v2.0.0-production`** and download **`margi-debug.apk`** (or build locally — [novadrive-mobile/scripts/BUILD_APK.md](novadrive-mobile/scripts/BUILD_APK.md)).
2. Install on Android (allow unknown sources if needed).
3. Open Margi → **Continue as Guest** → grant location when asked.

No Gradle or JDK required if you use the release APK.

---

## Three demos (pick any)

### A — Golden Hour (2 min)

1. Home → **ENTER DRIVE MODE** → Trip → **Start Driving** → finish calibration.
2. On the drive HUD → **hold SOS 3s** → activation splash → trauma response.
3. Optional: **Manual** mode on activation → START triage → facility → GHP + QR.
4. **Airplane mode** on GHP screen — packet text and QR still visible.

### B — Bystander QR (1 min)

1. Complete A until you have a GHP QR, or open **Bystander QR** on Home.
2. Second phone: Margi **Scan** tab, or open relay URL from QR if encoded as web link.
3. **SMS 108** opens the OS composer — user taps **Send** (Android/iOS policy).

### C — Naari Shakti (1 min)

1. Medical profile → gender **Female** → Home → **NAARI SHAKTI** → **Enable Portal**.
2. Safety Mode ON → hold **Emergency Help** 2s → distress HUD + SMS composer.

---

## What to look for (honest scope)

| Works offline | Needs network |
|---------------|---------------|
| START triage FSM, SQLite facility routing (NH48 verified pack ~50 POIs), **baseline 108 mode outside pack**, GHP, QR encode | Sarthi Gemini BFF, Supabase sign-in, HTTP dispatch to configured endpoints |
| 24+ Sarthi FAQ playbooks (en/hi/ta) | Live LLM answers |

**Not production medical software:** START triage is a deterministic demo tree — not physician-certified. Crash/voice detection are **experimental**; no auto-dial to 108 without user confirming SMS. **NH48 corridor** has verified hospital phones; **other states** (e.g. Odisha) use **baseline mode** — call 108, share GPS + triage, no verified ER list.

**Unit tests:** `cd novadrive-mobile && npm test` — **194** tests.

**APK CI:** [Android debug APK workflow](https://github.com/Stormynubee/Margi/actions/workflows/android-apk.yml) — download artifact **`margi-debug.apk`** if the release asset is not yet attached.

---

## Build from source (optional)

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npm run android:apk
```

Requires **JDK 17+** and Android SDK. Uses a clean prebuild without `expo-dev-client` (fixes `expo-dev-menu` Kotlin errors).

Phase 3 (Supabase + Vercel Sarthi): [docs/PHASE3_SETUP.md](docs/PHASE3_SETUP.md)

---

## Everything else

Deep docs live under `docs/` — start here first. Encyclopedia: [docs/MARGI_MASTER_ENCYCLOPEDIA.md](docs/MARGI_MASTER_ENCYCLOPEDIA.md) · Device smoke: [novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md](novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md)
