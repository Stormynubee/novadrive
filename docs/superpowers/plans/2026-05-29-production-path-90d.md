# C1 Verified POI Pipeline — First 90 Days Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the NH48 Chennai corridor verified POI pack (≥50 nodes, ≥40 phone-verified, zero synthetic `pad-*` rows) and integrate it into the mobile app with documented verification workflow.

**Architecture:** OSM Overpass ingest produces a raw SQLite seed; human verifiers merge a CSV with phone-call outcomes and trauma-tier assignments; `verify_pois.py` merges CSV into the DB and fails CI if production-mode invariants break; the app bundles `emergency_seed.db` or syncs from generated seed metadata; CANON honesty row updates only when merge reports ≥80% verified phones.

**Tech Stack:** Python 3.11+, sqlite3, pytest; Expo SDK 54 / TypeScript for app seed wiring; GitHub Actions for ingest validation.

**Parent spec:** [2026-05-29-production-path-design.md](../specs/2026-05-29-production-path-design.md) — sub-project **C1** only (months 1–3).

**Start date assumption:** 2026-06-01 (day after hackathon freeze).

---

## File map (created or modified)

| File | Responsibility |
|------|----------------|
| `docs/POI_TRAUMA_TIER_RUBRIC.md` | Rules for tier 1/2/3 assignment |
| `docs/POI_VERIFICATION_RUNBOOK.md` | Human verifier call script and CSV instructions |
| `data/corridors/nh48_verification.csv` | Verification ledger (source of truth for phones/tiers) |
| `data/corridors/nh48_bbox.json` | Corridor bounding box preset |
| `scripts/ingestCorridors.py` | OSM fetch; `--mode demo|production` |
| `scripts/verify_pois.py` | CSV merge + invariant checks |
| `scripts/tests/test_verify_pois.py` | pytest for merge logic |
| `scripts/tests/test_ingest_corridors.py` | pytest for schema + mode flags |
| `data/emergency_seed.db` | Generated SQLite (git-tracked for reproducibility) |
| `novadrive-mobile/assets/emergency_seed.db` | Bundled copy for app (optional path if app loads asset) |
| `novadrive-mobile/src/lib/facilitiesDb.ts` | Load bundled seed or keep SEED sync from generator |
| `novadrive-mobile/scripts/generate-facilities-seed.mjs` | TS seed snippet from SQLite export |
| `.github/workflows/poi-ingest.yml` | CI validate production pack |
| `docs/CANON.md` | Update POI honesty row when C1 complete |

---

### Task 1: Trauma tier rubric

**Files:**
- Create: `docs/POI_TRAUMA_TIER_RUBRIC.md`

- [ ] **Step 1: Write rubric document**

Create `docs/POI_TRAUMA_TIER_RUBRIC.md`:

```markdown
# POI trauma tier rubric (Margi C1)

| Tier | Label | Assignment criteria | Examples |
|------|-------|---------------------|----------|
| 1 | Trauma center | Hospital advertises 24×7 trauma/ER with surgical capability; or state-designated trauma center | Apollo Greams Trauma, SRMC Emergency |
| 2 | Hospital ER | General hospital with emergency department; no verified dedicated trauma bay | District HQ hospitals, medical college hospitals |
| 3 | Clinic / PHC | Primary health centre, urban clinic, no 24×7 surgical ER | NH48 PHC, Tambaram clinic |

**Rules:**
- Tier must be assigned by verifier after phone call or official hospital website check.
- If phone unreachable after 2 attempts on 2 days, set `verified=0` and `phone=` empty; do not invent numbers.
- Never assign tier 1 without explicit trauma/ER confirmation.
- Police stations and Naari demo stations use separate tables; do not mix into `emergency_nodes`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/POI_TRAUMA_TIER_RUBRIC.md
git commit -m "docs: add POI trauma tier rubric for C1 verification"
```

---

### Task 2: Corridor bbox preset

**Files:**
- Create: `data/corridors/nh48_bbox.json`

- [ ] **Step 1: Add bbox JSON**

```json
{
  "corridor": "NH48",
  "description": "Chennai metro south to Chengalpattu along NH48",
  "south": 12.65,
  "west": 79.85,
  "north": 13.15,
  "east": 80.35
}
```

- [ ] **Step 2: Commit**

```bash
git add data/corridors/nh48_bbox.json
git commit -m "data: NH48 corridor bbox preset for POI ingest"
```

---

### Task 3: Extend ingestCorridors.py (production mode)

**Files:**
- Modify: `scripts/ingestCorridors.py`
- Create: `scripts/tests/test_ingest_corridors.py`

- [ ] **Step 1: Write failing test for production mode (no padding)**

Create `scripts/tests/test_ingest_corridors.py`:

```python
import sqlite3
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
INGEST = REPO / "scripts" / "ingestCorridors.py"


def test_production_mode_rejects_insufficient_rows(tmp_path):
    out = tmp_path / "seed.db"
    # Force empty OSM by using tiny bbox file via env or mock; use --synthetic-count 0
    result = subprocess.run(
        [
            sys.executable,
            str(INGEST),
            "--corridor",
            "NH48",
            "--mode",
            "production",
            "--min-pois",
            "50",
            "--synthetic-count",
            "0",
            "--skip-fetch",
            "--out",
            str(out),
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "production mode requires" in result.stderr.lower() or "insufficient" in result.stderr.lower()


def test_demo_mode_allows_padding(tmp_path):
    out = tmp_path / "seed.db"
    result = subprocess.run(
        [
            sys.executable,
            str(INGEST),
            "--corridor",
            "NH48",
            "--mode",
            "demo",
            "--min-pois",
            "50",
            "--skip-fetch",
            "--out",
            str(out),
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    conn = sqlite3.connect(out)
    count = conn.execute("SELECT COUNT(*) FROM emergency_nodes").fetchone()[0]
    conn.close()
    assert count == 50
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\storm\roadsafetyhackathon && python -m pytest scripts/tests/test_ingest_corridors.py -v`

Expected: FAIL — `--mode`, `--skip-fetch`, `--synthetic-count` not defined yet.

- [ ] **Step 3: Implement flags in ingestCorridors.py**

Add to `scripts/ingestCorridors.py` (conceptual diff — implement in file):

```python
# New argparse flags:
#   --mode {demo,production}  default demo
#   --skip-fetch              use empty rows (tests / offline)
#   --synthetic-count N       override pad count; demo only
#   --bbox-json PATH          load bbox from data/corridors/nh48_bbox.json

def write_db(path: Path, rows: list[dict], min_pois: int, mode: str, synthetic_count: int | None) -> None:
    if mode == "production" and len(rows) < min_pois:
        raise SystemExit(
            f"production mode requires >= {min_pois} real OSM rows; got {len(rows)}. "
            "Run verify workflow or use demo mode for hackathon builds."
        )
    if mode == "demo":
        pad_target = synthetic_count if synthetic_count is not None else max(0, min_pois - len(rows))
        for i in range(pad_target):
            rows.append({"id": f"pad-{i}", ...})  # existing pad logic
    # production: never append pad-* rows
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest scripts/tests/test_ingest_corridors.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/ingestCorridors.py scripts/tests/test_ingest_corridors.py
git commit -m "feat(scripts): ingest production mode without synthetic POI padding"
```

---

### Task 4: Verification CSV schema

**Files:**
- Create: `data/corridors/nh48_verification.csv`
- Create: `docs/POI_VERIFICATION_RUNBOOK.md`

- [ ] **Step 1: Create CSV header + seed rows from current facilitiesDb**

Create `data/corridors/nh48_verification.csv`:

```csv
osm_id,canonical_name,phone,trauma_tier,verified,verifier,verified_date,notes
t1,Apollo Hospitals Greams Road (Trauma),044-28290200,1,1,,2026-05-28,Pre-curated demo
t2,SRMC Emergency & Trauma (Chennai),044-27440000,1,1,,2026-05-28,Pre-curated demo
t3,Kauvery Hospital Alwarpet ER,044-40004000,1,1,,2026-05-28,Pre-curated demo
t4,MIOT International Trauma Bay,044-42002288,1,1,,2026-05-28,Pre-curated demo
h1,Rajiv Gandhi Govt General Hospital ER,044-28194600,2,1,,2026-05-28,Pre-curated demo
```

Document in runbook that verifiers append OSM ids after ingest fetch.

- [ ] **Step 2: Write runbook**

Create `docs/POI_VERIFICATION_RUNBOOK.md` with sections: Prerequisites, Call script ("Namaste, verifying ER contact for navigation app research…"), CSV columns, tier rubric link, weekly merge cadence, definition of done (≥40 verified phones).

- [ ] **Step 3: Commit**

```bash
git add data/corridors/nh48_verification.csv docs/POI_VERIFICATION_RUNBOOK.md
git commit -m "docs: POI verification CSV schema and runbook"
```

---

### Task 5: verify_pois.py merge script (TDD)

**Files:**
- Create: `scripts/verify_pois.py`
- Create: `scripts/tests/test_verify_pois.py`

- [ ] **Step 1: Write failing merge test**

Create `scripts/tests/test_verify_pois.py`:

```python
import csv
import sqlite3
from pathlib import Path

from verify_pois import merge_verification_csv, validate_production_invariants

REPO = Path(__file__).resolve().parents[2]


def _make_db(path: Path, rows):
    conn = sqlite3.connect(path)
    conn.execute(
        """CREATE TABLE emergency_nodes (
          id TEXT PRIMARY KEY, name TEXT, type TEXT, trauma_tier INTEGER,
          phone TEXT, lat REAL, lng REAL, verified INTEGER DEFAULT 0)"""
    )
    for r in rows:
        conn.execute(
            "INSERT INTO emergency_nodes VALUES (?,?,?,?,?,?,?,?)",
            (r["id"], r["name"], r["type"], r["trauma_tier"], r["phone"], r["lat"], r["lng"], r["verified"]),
        )
    conn.commit()
    conn.close()


def test_merge_updates_phone_and_verified(tmp_path):
    db = tmp_path / "seed.db"
    _make_db(db, [{"id": "osm-1", "name": "Test Hospital", "type": "hospital", "trauma_tier": 2, "phone": "", "lat": 13.0, "lng": 80.0, "verified": 0}])
    csv_path = tmp_path / "v.csv"
    csv_path.write_text(
        "osm_id,canonical_name,phone,trauma_tier,verified,verifier,verified_date,notes\n"
        "osm-1,Test Hospital ER,044-11112222,2,1,volunteer-a,2026-06-15,called main desk\n",
        encoding="utf-8",
    )
    stats = merge_verification_csv(db, csv_path)
    assert stats["updated"] == 1
    conn = sqlite3.connect(db)
    row = conn.execute("SELECT phone, verified, trauma_tier FROM emergency_nodes WHERE id='osm-1'").fetchone()
    conn.close()
    assert row == ("044-11112222", 1, 2)


def test_production_invariants_reject_pad_ids(tmp_path):
    db = tmp_path / "bad.db"
    _make_db(db, [{"id": "pad-0", "name": "Corridor POI 0", "type": "clinic", "trauma_tier": 3, "phone": "", "lat": 12.9, "lng": 79.95, "verified": 0}])
    errors = validate_production_invariants(db, min_nodes=50, min_verified_phones=40)
    assert any("pad-" in e for e in errors)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd scripts && python -m pytest tests/test_verify_pois.py -v`

Expected: FAIL — `verify_pois` module missing.

- [ ] **Step 3: Implement verify_pois.py**

Create `scripts/verify_pois.py`:

```python
#!/usr/bin/env python3
"""Merge human verification CSV into emergency_seed.db and validate production invariants."""
from __future__ import annotations

import argparse
import csv
import sqlite3
from dataclasses import dataclass
from pathlib import Path


@dataclass
class MergeStats:
    updated: int = 0
    skipped: int = 0


def merge_verification_csv(db_path: Path, csv_path: Path) -> MergeStats:
    stats = MergeStats()
    conn = sqlite3.connect(db_path)
    with csv_path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            osm_id = row["osm_id"].strip()
            if not osm_id:
                continue
            cur = conn.execute("SELECT id FROM emergency_nodes WHERE id = ?", (osm_id,))
            if cur.fetchone() is None:
                stats.skipped += 1
                continue
            conn.execute(
                """UPDATE emergency_nodes
                   SET name = ?, phone = ?, trauma_tier = ?, verified = ?
                   WHERE id = ?""",
                (
                    row["canonical_name"].strip(),
                    row["phone"].strip(),
                    int(row["trauma_tier"]),
                    1 if row["verified"].strip() in ("1", "true", "yes") else 0,
                    osm_id,
                ),
            )
            stats.updated += 1
    conn.commit()
    conn.close()
    return stats


def validate_production_invariants(db_path: Path, min_nodes: int, min_verified_phones: int) -> list[str]:
    conn = sqlite3.connect(db_path)
    errors: list[str] = []
    rows = conn.execute("SELECT id, phone, verified FROM emergency_nodes").fetchall()
    conn.close()
    if len(rows) < min_nodes:
        errors.append(f"node count {len(rows)} < min_nodes {min_nodes}")
    pad = [r[0] for r in rows if str(r[0]).startswith("pad-")]
    if pad:
        errors.append(f"synthetic pad ids present: {pad[:5]}")
    verified_phones = sum(1 for _, phone, verified in rows if verified and phone)
    if verified_phones < min_verified_phones:
        errors.append(f"verified phone count {verified_phones} < min {min_verified_phones}")
    return errors


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--db", default="data/emergency_seed.db")
    p.add_argument("--csv", default="data/corridors/nh48_verification.csv")
    p.add_argument("--min-nodes", type=int, default=50)
    p.add_argument("--min-verified-phones", type=int, default=40)
    p.add_argument("--check-only", action="store_true")
    args = p.parse_args()
    db_path = Path(args.db)
    if not args.check_only:
        stats = merge_verification_csv(db_path, Path(args.csv))
        print(f"merge: updated={stats.updated} skipped={stats.skipped}")
    errors = validate_production_invariants(db_path, args.min_nodes, args.min_verified_phones)
    if errors:
        raise SystemExit("production invariant failed:\n- " + "\n- ".join(errors))
    print("production invariants OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run tests**

Run: `cd scripts && python -m pytest tests/test_verify_pois.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/verify_pois.py scripts/tests/test_verify_pois.py
git commit -m "feat(scripts): merge POI verification CSV with production invariants"
```

---

### Task 6: Full ingest + merge pipeline (operator workflow)

**Files:**
- Modify: `data/emergency_seed.db` (generated)
- Modify: `data/corridors/nh48_verification.csv` (expand to ≥50 rows over weeks 5–8)

- [ ] **Step 1: Fetch OSM hospitals (week 1 operator run)**

Run:

```powershell
cd C:\Users\storm\roadsafetyhackathon
python scripts/ingestCorridors.py --corridor NH48 --bbox-json data/corridors/nh48_bbox.json --mode demo --min-pois 50 --out data/emergency_seed_raw.db
```

Expected: `Wrote 50 nodes to data/emergency_seed_raw.db` (demo mode OK until CSV catches up).

- [ ] **Step 2: Map OSM ids into CSV**

Export ids:

```powershell
python -c "import sqlite3; c=sqlite3.connect('data/emergency_seed_raw.db'); print('\n'.join(r[0] for r in c.execute('SELECT id,name FROM emergency_nodes LIMIT 60')))"
```

Verifiers add rows to `nh48_verification.csv` for each real hospital; prioritize tier-1 candidates first per runbook.

- [ ] **Step 3: Merge and check (repeat weekly until pass)**

Run:

```powershell
python scripts/verify_pois.py --db data/emergency_seed.db --csv data/corridors/nh48_verification.csv --min-nodes 50 --min-verified-phones 40
```

Expected (early weeks): FAIL with verified phone count below 40 — continue verification.

Expected (week 8 target): `production invariants OK`

- [ ] **Step 4: Switch ingest to production for final pack**

Run:

```powershell
python scripts/ingestCorridors.py --corridor NH48 --bbox-json data/corridors/nh48_bbox.json --mode production --min-pois 50 --out data/emergency_seed.db
python scripts/verify_pois.py --db data/emergency_seed.db --csv data/corridors/nh48_verification.csv
```

Expected: Both succeed with zero `pad-*` ids.

- [ ] **Step 5: Commit data artifacts**

```bash
git add data/emergency_seed.db data/corridors/nh48_verification.csv
git commit -m "data: NH48 verified POI pack v1 (C1)"
```

---

### Task 7: App seed integration

**Files:**
- Create: `novadrive-mobile/scripts/generate-facilities-seed.mjs`
- Modify: `novadrive-mobile/src/lib/facilitiesDb.ts`
- Modify: `novadrive-mobile/src/lib/facilitiesDb.test.ts`

- [ ] **Step 1: Write failing test for seed metadata**

Add to `novadrive-mobile/src/lib/facilitiesDb.test.ts`:

```typescript
import { POI_DATA_VERIFIED, countVerifiedFacilities } from './facilitiesDb';

describe('C1 verified pack metadata', () => {
  it('POI_DATA_VERIFIED is ISO date', () => {
    expect(POI_DATA_VERIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('reports at least 40 verified facilities in production pack', () => {
    expect(countVerifiedFacilities()).toBeGreaterThanOrEqual(40);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd novadrive-mobile && npm test -- facilitiesDb.test.ts`

Expected: FAIL — `countVerifiedFacilities` not exported / count too low.

- [ ] **Step 3: Add generator script**

Create `novadrive-mobile/scripts/generate-facilities-seed.mjs` that reads `../../data/emergency_seed.db`, emits SEED array + POI_COORDS + sets `POI_DATA_VERIFIED` from CSV max date or `--verified-date` arg.

- [ ] **Step 4: Implement countVerifiedFacilities and regenerate seed**

In `facilitiesDb.ts`:

```typescript
export function countVerifiedFacilities(): number {
  return SEED.filter((n) => n.verified && n.phone && n.phone !== 'unverified').length;
}
```

Run generator after DB merge:

```powershell
node novadrive-mobile/scripts/generate-facilities-seed.mjs --db data/emergency_seed.db --verified-date 2026-08-15
```

- [ ] **Step 5: Run full mobile tests**

Run: `cd novadrive-mobile && npm test`

Expected: PASS (183+ tests)

- [ ] **Step 6: Commit**

```bash
git add novadrive-mobile/scripts/generate-facilities-seed.mjs novadrive-mobile/src/lib/facilitiesDb.ts novadrive-mobile/src/lib/facilitiesDb.test.ts
git commit -m "feat(mobile): sync facilitiesDb from verified POI pack"
```

---

### Task 8: CI workflow poi-ingest.yml

**Files:**
- Create: `.github/workflows/poi-ingest.yml`

- [ ] **Step 1: Add workflow**

```yaml
name: POI ingest validate

on:
  pull_request:
    paths:
      - 'scripts/**'
      - 'data/corridors/**'
      - 'data/emergency_seed.db'
  push:
    branches: [master]
    paths:
      - 'scripts/**'
      - 'data/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install pytest
      - run: python -m pytest scripts/tests -v
      - run: python scripts/verify_pois.py --db data/emergency_seed.db --csv data/corridors/nh48_verification.csv --check-only
```

Note: `--check-only` on PRs validates committed DB; full merge runs locally before commit.

- [ ] **Step 2: Push branch and confirm workflow green**

Expected: GitHub Actions job `POI ingest validate` passes on PR.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/poi-ingest.yml
git commit -m "ci: validate verified POI pack on scripts/data changes"
```

---

### Task 9: CANON honesty update (C1 completion gate)

**Files:**
- Modify: `docs/CANON.md`

- [ ] **Step 1: Update POI row only when Task 6 passes**

Change CANON honesty table row:

```markdown
| POI database | NH48 verified corridor pack (≥50 nodes, ≥40 phone-verified); synthetic padding removed in production builds; see docs/POI_VERIFICATION_RUNBOOK.md |
```

Update `POI_DATA_VERIFIED` mention to match generator date.

- [ ] **Step 2: Link runbook from CANON Fast paths**

Add row: **POI verification** → `docs/POI_VERIFICATION_RUNBOOK.md`

- [ ] **Step 3: Commit**

```bash
git add docs/CANON.md
git commit -m "docs: CANON POI honesty row for C1 verified pack"
```

---

### Task 10: 90-day checkpoint review

**Files:**
- Modify: `docs/FIELD_TEST.md` (pointer only — first session waits for C4)

- [ ] **Step 1: Run full verification suite**

```powershell
python -m pytest scripts/tests -v
cd novadrive-mobile
npm test
npm run verify:docs
npm run verify:branding
python ../scripts/verify_pois.py --db ../data/emergency_seed.db --csv ../data/corridors/nh48_verification.csv --check-only
```

Expected: All pass; production invariants OK.

- [ ] **Step 2: Write 90-day summary in POI runbook appendix**

Add section **90-day outcomes** with counts: total nodes, verified phones, date completed, known gaps (facilities outside bbox).

- [ ] **Step 3: Final commit**

```bash
git add docs/POI_VERIFICATION_RUNBOOK.md docs/FIELD_TEST.md
git commit -m "docs: C1 90-day checkpoint — verified NH48 POI pack complete"
```

---

## 90-day calendar (operator view)

| Week | Focus | Exit criterion |
|------|-------|----------------|
| 1–2 | Tasks 1–3: rubric, bbox, ingest production mode | pytest green for ingest |
| 3–4 | Task 4–5: CSV + verify_pois.py | merge tests green |
| 5–8 | Task 6: human verification blitz | ≥40 verified phones in CSV |
| 9–10 | Task 7: app seed sync | facilitiesDb tests pass ≥40 verified |
| 11 | Task 8: CI | poi-ingest workflow green |
| 12 | Tasks 9–10: CANON + checkpoint | production invariants OK |

---

## Self-review (plan vs spec)

| Spec requirement (C1) | Task |
|-----------------------|------|
| Extended ingestCorridors.py, no silent pad in production | Task 3 |
| verify_pois.py + CSV workflow | Tasks 4–5 |
| POI_VERIFICATION_RUNBOOK.md | Task 4 |
| ≥50 nodes, ≥40 verified, 0 pad-* | Task 6 invariants |
| App integration + POI_DATA_VERIFIED | Task 7 |
| CANON update | Task 9 |
| CI validation | Task 8 |

No TBD steps; operator weeks 5–8 require human phone calls (documented in runbook, not code).

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-production-path-90d.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in-session using executing-plans with checkpoints  

**Which approach?**
