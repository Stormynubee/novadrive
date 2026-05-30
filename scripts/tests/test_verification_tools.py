"""Tests for Task 6 verification operator scripts."""
from __future__ import annotations

import csv
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CSV = REPO / "data" / "corridors" / "nh48_verification.csv"


def test_verification_status_runs() -> None:
    out = subprocess.check_output(
        [sys.executable, str(REPO / "scripts" / "verification_status.py"), "--csv", str(CSV)],
        text=True,
    )
    assert "Phone-verified:" in out
    assert "50" in out or "CSV rows:" in out


def test_verification_queue_runs() -> None:
    out = subprocess.check_output(
        [sys.executable, str(REPO / "scripts" / "verification_queue.py"), "--csv", str(CSV), "--limit", "3"],
        text=True,
    )
    assert "Queue:" in out
    assert "osm_id" in out


def test_record_verification_updates_row(tmp_path: Path) -> None:
    src = tmp_path / "test.csv"
    with CSV.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    fields = list(rows[0].keys())
    with src.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows[:2])

    osm_id = rows[0]["osm_id"]
    subprocess.check_call(
        [
            sys.executable,
            str(REPO / "scripts" / "record_verification.py"),
            "--csv",
            str(src),
            "--osm-id",
            osm_id,
            "--phone",
            "044-99998888",
            "--verified",
            "1",
            "--verifier",
            "pytest",
            "--notes",
            "test update",
        ]
    )
    with src.open(newline="", encoding="utf-8") as f:
        updated = {r["osm_id"]: r for r in csv.DictReader(f)}
    assert updated[osm_id]["phone"] == "044-99998888"
    assert updated[osm_id]["verified"] == "1"
    assert updated[osm_id]["verifier"] == "pytest"
