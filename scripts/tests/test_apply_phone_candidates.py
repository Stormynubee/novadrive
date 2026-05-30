"""Tests for apply_phone_candidates.py."""
from __future__ import annotations

import csv
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def test_apply_phone_candidates_dry_run(tmp_path: Path) -> None:
    csv_path = tmp_path / "test.csv"
    src_csv = REPO / "data" / "corridors" / "nh48_verification.csv"
    with src_csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    target = next(r for r in rows if r.get("verified", "0") == "0")
    fields = list(rows[0].keys())
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerow(target)

    candidates = tmp_path / "candidates.json"
    candidates.write_text(
        json.dumps(
            [
                {
                    "osm_id": target["osm_id"],
                    "phone": "044-11112222",
                    "trauma_tier": 2,
                    "source_url": "https://example.org/",
                }
            ]
        ),
        encoding="utf-8",
    )

    out = subprocess.check_output(
        [
            sys.executable,
            str(REPO / "scripts" / "apply_phone_candidates.py"),
            "--csv",
            str(csv_path),
            "--candidates",
            str(candidates),
            "--mode",
            "candidate",
            "--dry-run",
        ],
        text=True,
    )
    assert "Applied: 1" in out
