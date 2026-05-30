#!/usr/bin/env python3
"""Merge human verification CSV into emergency_seed.db and validate production invariants."""
from __future__ import annotations

import argparse
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
        import csv

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


def validate_production_invariants(
    db_path: Path, min_nodes: int, min_verified_phones: int
) -> list[str]:
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
