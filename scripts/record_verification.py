#!/usr/bin/env python3
"""Record one hospital phone verification outcome into nh48_verification.csv."""
from __future__ import annotations

import argparse
import csv
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_CSV = REPO / "data" / "corridors" / "nh48_verification.csv"

FIELDS = [
    "osm_id",
    "canonical_name",
    "phone",
    "trauma_tier",
    "verified",
    "verifier",
    "verified_date",
    "notes",
]


def main() -> None:
    p = argparse.ArgumentParser(description="Update one POI verification row in CSV")
    p.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    p.add_argument("--osm-id", required=True)
    p.add_argument("--phone", default="")
    p.add_argument("--verified", choices=("0", "1"), default="1")
    p.add_argument("--verifier", default="")
    p.add_argument("--verified-date", default=date.today().isoformat())
    p.add_argument("--trauma-tier", type=int, choices=(1, 2, 3))
    p.add_argument("--name")
    p.add_argument("--notes", default="")
    args = p.parse_args()

    if args.verified == "1" and not args.phone.strip():
        raise SystemExit("verified=1 requires --phone")

    with args.csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    match = next((r for r in rows if r["osm_id"].strip() == args.osm_id.strip()), None)
    if not match:
        raise SystemExit(f"osm_id not found in CSV: {args.osm_id}")

    if args.phone:
        match["phone"] = args.phone.strip()
    if args.name:
        match["canonical_name"] = args.name.strip()
    if args.trauma_tier is not None:
        match["trauma_tier"] = str(args.trauma_tier)
    match["verified"] = args.verified
    if args.verifier:
        match["verifier"] = args.verifier
    if args.verified == "1":
        match["verified_date"] = args.verified_date
    if args.notes:
        match["notes"] = args.notes

    with args.csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Updated {args.osm_id}: verified={match['verified']} phone={match['phone'] or '(empty)'}")


if __name__ == "__main__":
    main()
