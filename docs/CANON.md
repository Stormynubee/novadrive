# Margi CANON — read this first

**Margi** (Team NovaDrive · IIT Madras RoadSoS 2026) is an **offline-first Golden Hour research prototype**: a native **Expo Android app** that guides START-style triage, ranks demo facilities from local SQLite, builds a **Golden Hour Packet (GHP)**, and encodes it as QR / SMS composer links for bystanders.

This document is the **single source of truth** for what the repo actually ships. If another doc disagrees, **this file wins**.

---

## What Margi is

| Layer | Reality |
|-------|---------|
| **Primary client** | `novadrive-mobile/` — Expo SDK 54, `com.margi.app` |
| **Offline core** | START FSM → SQLite facility rank (~50 demo POIs) → GHP → QR (`ND1:` envelope) |
| **Optional online** | Sarthi Gemini BFF (`novadrive/`), Supabase auth, HTTP dispatch hooks |
| **Web mirror** | Bystander relay at `/relay`, static brief site at `docs/site` |
| **Tests** | 179+ Jest unit tests on lib/FSM/encoders (see `novadrive-mobile/README.md`) |
| **Judge APK** | GitHub Actions → artifact `margi-debug.apk` ([workflow](https://github.com/Stormynubee/Margi/actions/workflows/android-apk.yml)) |

---

## What Margi is not

- **Not production emergency medical software** — no physician-certified triage, no verified national POI registry, no EMS dispatch guarantee.
- **Not a PWA primary client** — early planning docs describe Next.js PWA + sql.js; **implementation is native Expo** (see [archive/README.md](archive/README.md)).
- **Not “always-on crash detection”** — accelerometer heuristics + experimental voice; native crash adapter stubbed unless custom build.
- **Not auto-dial 108** — SOS opens the **SMS composer**; user taps Send (platform policy).

---

## Honesty boundaries (demo vs claim)

| Topic | Demo truth |
|-------|------------|
| POI database | ~11 curated Chennai/NH48 names + synthetic padding; `POI_DATA_VERIFIED` is hand-curated date, not NHA sync |
| Naari police | Chennai corridor **demo** stations aligned with POI geography |
| Phase 3 “production” tag | Historical release name **`v2.0.0-production`** = integration milestone, **not** clinical production |
| Community tab | Mix of local SQLite feedback + seeded demo alerts |
| Sarthi | 31+ offline KB entries; cloud LLM optional |

---

## Fast paths

| Audience | Start here |
|----------|------------|
| **Judges (5 min)** | [JUDGE_START_HERE.md](../JUDGE_START_HERE.md) |
| **Submission checklist** | [SUBMISSION.md](SUBMISSION.md) |
| **Architecture (technical)** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Phase 3 env setup** | [PHASE3_SETUP.md](PHASE3_SETUP.md) |
| **Device smoke (manual)** | [novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md](../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md) |
| **Maestro flows (optional)** | [MAESTRO_SMOKE.md](MAESTRO_SMOKE.md) |
| **POI verification (Phase C)** | [POI_VERIFICATION_RUNBOOK.md](POI_VERIFICATION_RUNBOOK.md) |
| **Historical / aspirational docs** | [archive/README.md](archive/README.md) |

---

## Repo map

```
novadrive-mobile/   ← ship this (Android APK)
novadrive/          ← Sarthi BFF + web relay (Vercel)
docs/site/          ← hackathon brief (static)
docs/CANON.md       ← you are here
scripts/            ← optional OSM ingest (not bundled in app)
```

---

## Recommended demo (Golden Hour)

1. Install APK or `npm run android:apk` locally (JDK 17+).
2. **Continue as Guest** → Trip → **Start Driving** → hold SOS → manual triage → facility → GHP.
3. Toggle **airplane mode** on GHP screen — packet + QR still visible.

---

## Versioning note

Release tags (`v2.0.0-production`, etc.) mark **hackathon milestones**. They do not imply regulatory clearance, field validation, or operational deployment.

**Last updated:** 2026-05-29 · **Tests:** 182 unit (mobile)
