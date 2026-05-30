# POI verification runbook (Margi C1 — NH48)

Human operators phone-verify hospitals along the NH48 Chennai→Chengalpattu corridor and record outcomes in `data/corridors/nh48_verification.csv`. The merge script `scripts/verify_pois.py` applies CSV rows to `data/emergency_seed.db`.

**Related docs:** [POI trauma tier rubric](POI_TRAUMA_TIER_RUBRIC.md) · [Phase C spec](superpowers/specs/2026-05-29-production-path-design.md)

---

## Prerequisites

- Python 3.11+ and repo checkout
- OSM ingest completed (see **Overpass 406** note below): `python scripts/ingestCorridors.py --bbox-json data/corridors/nh48_bbox.json --mode demo --min-pois 50 --out data/emergency_seed_raw.db`
- Spreadsheet or text editor for CSV edits
- Tamil/English phone script (below)

### Overpass HTTP 406

If ingest prints `HTTP Error 406: Not Acceptable`, update to latest `scripts/ingestCorridors.py` (sends `User-Agent` + form-encoded `data=` body, retries mirror). Success looks like: `Overpass OK via …` and `Fetched N hospitals from OSM`.

---

## CSV columns

| Column | Description |
|--------|-------------|
| `osm_id` | Must match `emergency_nodes.id` in SQLite (OSM id string, or legacy demo id like `t1`) |
| `canonical_name` | Display name after verification |
| `phone` | ER main desk number; leave empty if unverified |
| `trauma_tier` | 1, 2, or 3 per rubric |
| `verified` | `1` if phone confirmed; `0` otherwise |
| `verifier` | Volunteer initials |
| `verified_date` | ISO date `YYYY-MM-DD` |
| `notes` | Call outcome, website URL, etc. |

After OSM fetch, export ids:

```powershell
python -c "import sqlite3; c=sqlite3.connect('data/emergency_seed_raw.db'); print('\n'.join(f'{r[0]},{r[1]}' for r in c.execute('SELECT id,name FROM emergency_nodes ORDER BY name LIMIT 60')))"
```

Append new CSV rows for each real hospital. Do not invent `pad-*` ids.

---

## Call script

> Namaste, I'm calling from an IIT Madras RoadSoS research team. We're building an **offline navigation research app** for highway emergencies — not a government registry. Could you confirm whether this number reaches your **24×7 emergency or casualty desk**? We will not publish personal numbers publicly without consent.

Record: who answered, department, whether number is correct, trauma capability (see rubric).

---

## Tier assignment

Follow [POI_TRAUMA_TIER_RUBRIC.md](POI_TRAUMA_TIER_RUBRIC.md). Never assign tier 1 without explicit trauma/ER confirmation.

---

## Weekly merge cadence

Each week (or after a verification session):

```powershell
cd C:\Users\storm\roadsafetyhackathon
python scripts/verify_pois.py --db data/emergency_seed.db --csv data/corridors/nh48_verification.csv
```

Early weeks: expect **FAIL** on verified phone count — continue calling.

When merge passes:

```powershell
python scripts/ingestCorridors.py --bbox-json data/corridors/nh48_bbox.json --mode production --min-pois 50 --out data/emergency_seed.db
python scripts/verify_pois.py --db data/emergency_seed.db --csv data/corridors/nh48_verification.csv
node novadrive-mobile/scripts/generate-facilities-seed.mjs --db data/emergency_seed.db
```

---

## Definition of done (C1)

- ≥50 nodes in `emergency_seed.db`
- ≥40 rows with `verified=1` and non-empty `phone` in CSV merged into DB
- Zero `pad-*` ids in production pack
- `python -m pytest scripts/tests -v` green
- CANON POI honesty row updated (Task 9)

---

## EMS dispatch note

**No Tamil Nadu 108 / GVK EMRI sandbox** as of spec approval (2026-05-30). Dispatch remains **SMS composer + fail-closed HTTP stubs** through month 6 per Phase C spec.

---

## 90-day outcomes

*(Fill when C1 completes — week 12 checkpoint.)*

| Metric | Target | Actual |
|--------|--------|--------|
| Total nodes | ≥50 | |
| Phone-verified | ≥40 | |
| Synthetic `pad-*` | 0 | |
| Completion date | | |
| Known gaps | Facilities outside bbox, unreachable phones | |
