#!/usr/bin/env python3
"""Bulk-export OSM nodes from ingest DB into nh48_verification.csv.

Preserves phone-verified rows from legacy demo ids (t1, h1, …) by fuzzy name match
to OSM hospital names. Unmatched OSM rows get verified=0 for human follow-up.
"""
from __future__ import annotations

import argparse
import csv
import re
import sqlite3
from difflib import SequenceMatcher
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_DB = REPO / "data" / "emergency_seed_raw.db"
DEFAULT_CSV = REPO / "data" / "corridors" / "nh48_verification.csv"

# Legacy demo ids → keywords for matching OSM `name` (lowercase)
LEGACY_HINTS: dict[str, list[str]] = {
    "t1": ["apollo", "greams"],
    "t2": ["sri ramachandra", "srm", "ramachandra"],
    "t3": ["kauvery", "alwarpet"],
    "t4": ["miot"],
    "h1": ["rajiv gandhi", "govt general", "general hospital"],
    "h2": ["chengalpattu", "medical college"],
    "h3": ["sriperumbudur"],
    "h4": ["cmc", "vellore", "christian medical"],
    "h5": ["kanchipuram", "district hq"],
    "c1": ["primary health", "phc"],
    "c2": ["tambaram", "clinic"],
}

CSV_FIELDS = [
    "osm_id",
    "canonical_name",
    "phone",
    "trauma_tier",
    "verified",
    "verifier",
    "verified_date",
    "notes",
]


def normalize_name(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def score_match(osm_name: str, hints: list[str]) -> float:
    norm = normalize_name(osm_name)
    best = 0.0
    for hint in hints:
        if hint in norm:
            best = max(best, 0.85)
        best = max(best, SequenceMatcher(None, norm, hint).ratio())
    return best


def load_legacy_csv(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        return {}
    with path.open(newline="", encoding="utf-8") as f:
        return {row["osm_id"].strip(): row for row in csv.DictReader(f) if row.get("osm_id")}


def load_osm_rows(db_path: Path) -> list[dict]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, name, phone, trauma_tier, verified FROM emergency_nodes ORDER BY name"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def map_legacy_to_osm(
    osm_rows: list[dict], legacy: dict[str, dict[str, str]]
) -> dict[str, dict[str, str]]:
    """Map legacy demo osm_id → best matching OSM row id."""
    assigned_osm: set[str] = set()
    legacy_to_osm: dict[str, dict[str, str]] = {}

    for leg_id, leg_row in legacy.items():
        hints = LEGACY_HINTS.get(leg_id, [normalize_name(leg_row.get("canonical_name", ""))])
        best_score = 0.0
        best_osm: dict | None = None
        for osm in osm_rows:
            if osm["id"] in assigned_osm:
                continue
            sc = score_match(osm["name"], hints)
            if sc > best_score:
                best_score = sc
                best_osm = osm
        if best_osm and best_score >= 0.45:
            assigned_osm.add(best_osm["id"])
            legacy_to_osm[leg_id] = best_osm

    return legacy_to_osm


def build_csv_rows(
    osm_rows: list[dict], legacy: dict[str, dict[str, str]]
) -> list[dict[str, str]]:
    osm_by_id = {r["id"]: r for r in osm_rows}
    out: list[dict[str, str]] = []
    matched_osm_ids: set[str] = set()

    # Rows already keyed by real OSM id (re-run safe)
    for leg_id, leg in legacy.items():
        if leg_id in osm_by_id:
            matched_osm_ids.add(leg_id)
            out.append(
                {
                    "osm_id": leg_id,
                    "canonical_name": leg.get("canonical_name") or osm_by_id[leg_id]["name"],
                    "phone": leg.get("phone", "") or osm_by_id[leg_id].get("phone") or "",
                    "trauma_tier": leg.get("trauma_tier") or str(osm_by_id[leg_id].get("trauma_tier") or 2),
                    "verified": leg.get("verified", "0"),
                    "verifier": leg.get("verifier", ""),
                    "verified_date": leg.get("verified_date", ""),
                    "notes": leg.get("notes") or "Preserved from verification CSV",
                }
            )

    # Legacy demo ids (t1, h1, …) → fuzzy match to OSM
    demo_legacy = {k: v for k, v in legacy.items() if k not in osm_by_id}
    leg_to_osm = map_legacy_to_osm(osm_rows, demo_legacy)
    for leg_id, osm in leg_to_osm.items():
        if osm["id"] in matched_osm_ids:
            continue
        leg = demo_legacy[leg_id]
        matched_osm_ids.add(osm["id"])
        out.append(
            {
                "osm_id": osm["id"],
                "canonical_name": leg.get("canonical_name") or osm["name"],
                "phone": leg.get("phone", "") or osm.get("phone") or "",
                "trauma_tier": leg.get("trauma_tier") or str(osm.get("trauma_tier") or 2),
                "verified": leg.get("verified", "0"),
                "verifier": leg.get("verifier", ""),
                "verified_date": leg.get("verified_date", ""),
                "notes": leg.get("notes") or f"Matched legacy {leg_id} → OSM {osm['id']}",
            }
        )

    for osm in osm_rows:
        if osm["id"] in matched_osm_ids:
            continue
        phone = osm.get("phone") or ""
        verified = "1" if osm.get("verified") and phone else "0"
        out.append(
            {
                "osm_id": osm["id"],
                "canonical_name": osm["name"],
                "phone": phone,
                "trauma_tier": str(osm.get("trauma_tier") or 2),
                "verified": verified,
                "verifier": "",
                "verified_date": "",
                "notes": "OSM ingest — pending phone verification",
            }
        )

    out.sort(key=lambda r: (r["canonical_name"].lower(), r["osm_id"]))
    return out


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    p = argparse.ArgumentParser(description="Bulk map OSM hospital ids into verification CSV")
    p.add_argument("--db", type=Path, default=DEFAULT_DB)
    p.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not args.db.exists():
        raise SystemExit(
            f"Missing {args.db}. Run ingest first:\n"
            "  python scripts/ingestCorridors.py --bbox-json data/corridors/nh48_bbox.json "
            "--mode demo --min-pois 50 --out data/emergency_seed_raw.db"
        )

    osm_rows = load_osm_rows(args.db)
    legacy = load_legacy_csv(args.csv)
    rows = build_csv_rows(osm_rows, legacy)
    verified = sum(1 for r in rows if r["verified"] in ("1", "true", "yes") and r["phone"])

    print(f"OSM hospitals: {len(osm_rows)}")
    print(f"CSV rows: {len(rows)} ({verified} phone-verified from legacy matches)")
    print(f"Legacy matches: {sum(1 for r in rows if 'Matched legacy' in r.get('notes', ''))}")

    if args.dry_run:
        for r in rows[:5]:
            print(f"  {r['osm_id']}: {r['canonical_name'][:50]} verified={r['verified']}")
        print("  ...")
        return

    write_csv(args.csv, rows)
    print(f"Wrote {args.csv}")


if __name__ == "__main__":
    main()
