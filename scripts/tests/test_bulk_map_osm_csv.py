"""Tests for bulk OSM → verification CSV mapping."""
from __future__ import annotations

import csv
import sqlite3
import tempfile
from pathlib import Path

import pytest

from bulk_map_osm_csv import CSV_FIELDS, build_csv_rows, load_legacy_csv, map_legacy_to_osm


@pytest.fixture
def sample_db(tmp_path: Path) -> Path:
    db = tmp_path / "seed.db"
    conn = sqlite3.connect(db)
    conn.execute(
        """CREATE TABLE emergency_nodes (
        id TEXT PRIMARY KEY, name TEXT, phone TEXT, trauma_tier INTEGER, verified INTEGER
    )"""
    )
    rows = [
        ("way-1", "Apollo Hospitals Greams Road", "", 1, 0),
        ("way-2", "Sri Ramachandra Medical Centre", "", 1, 0),
        ("way-3", "Random District Hospital", "", 2, 0),
    ]
    conn.executemany("INSERT INTO emergency_nodes VALUES (?,?,?,?,?)", rows)
    conn.commit()
    conn.close()
    return db


@pytest.fixture
def legacy_csv(tmp_path: Path) -> Path:
    path = tmp_path / "nh48_verification.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerow(
            {
                "osm_id": "t1",
                "canonical_name": "Apollo Hospitals Greams Road (Trauma)",
                "phone": "044-28290200",
                "trauma_tier": "1",
                "verified": "1",
                "verifier": "demo",
                "verified_date": "2026-05-28",
                "notes": "demo",
            }
        )
    return path


def test_fuzzy_match_legacy_to_osm(sample_db: Path, legacy_csv: Path) -> None:
    import bulk_map_osm_csv as mod

    osm_rows = mod.load_osm_rows(sample_db)
    legacy = load_legacy_csv(legacy_csv)
    matched = map_legacy_to_osm(osm_rows, legacy)
    assert "t1" in matched
    assert matched["t1"]["id"] == "way-1"


def test_build_csv_preserves_verified_phone(sample_db: Path, legacy_csv: Path) -> None:
    import bulk_map_osm_csv as mod

    osm_rows = mod.load_osm_rows(sample_db)
    legacy = load_legacy_csv(legacy_csv)
    rows = build_csv_rows(osm_rows, legacy)
    apollo = next(r for r in rows if r["phone"] == "044-28290200")
    assert apollo["osm_id"] == "way-1"
    assert apollo["verified"] == "1"
    assert len(rows) == 3
