import sqlite3
from pathlib import Path

from verify_pois import merge_verification_csv, validate_production_invariants


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
            (
                r["id"],
                r["name"],
                r["type"],
                r["trauma_tier"],
                r["phone"],
                r["lat"],
                r["lng"],
                r["verified"],
            ),
        )
    conn.commit()
    conn.close()


def test_merge_updates_phone_and_verified(tmp_path):
    db = tmp_path / "seed.db"
    _make_db(
        db,
        [
            {
                "id": "osm-1",
                "name": "Test Hospital",
                "type": "hospital",
                "trauma_tier": 2,
                "phone": "",
                "lat": 13.0,
                "lng": 80.0,
                "verified": 0,
            }
        ],
    )
    csv_path = tmp_path / "v.csv"
    csv_path.write_text(
        "osm_id,canonical_name,phone,trauma_tier,verified,verifier,verified_date,notes\n"
        "osm-1,Test Hospital ER,044-11112222,2,1,volunteer-a,2026-06-15,called main desk\n",
        encoding="utf-8",
    )
    stats = merge_verification_csv(db, csv_path)
    assert stats.updated == 1
    conn = sqlite3.connect(db)
    row = conn.execute(
        "SELECT phone, verified, trauma_tier FROM emergency_nodes WHERE id='osm-1'"
    ).fetchone()
    conn.close()
    assert row == ("044-11112222", 1, 2)


def test_production_invariants_reject_pad_ids(tmp_path):
    db = tmp_path / "bad.db"
    _make_db(
        db,
        [
            {
                "id": "pad-0",
                "name": "Corridor POI 0",
                "type": "clinic",
                "trauma_tier": 3,
                "phone": "",
                "lat": 12.9,
                "lng": 79.95,
                "verified": 0,
            }
        ],
    )
    errors = validate_production_invariants(db, min_nodes=50, min_verified_phones=40)
    assert any("pad-" in e for e in errors)
