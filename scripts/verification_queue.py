#!/usr/bin/env python3
"""Print prioritized POI verification call queue from nh48_verification.csv."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_CSV = REPO / "data" / "corridors" / "nh48_verification.csv"

TIER1_KEYWORDS = ("trauma", "emergency", "casualty", "medical college", "govt general", "apollo", "miot", "ramachandra", "srm")


def load_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def is_verified(row: dict[str, str]) -> bool:
    return row.get("verified", "").strip() in ("1", "true", "yes") and bool(row.get("phone", "").strip())


def priority(row: dict[str, str]) -> tuple[int, str]:
    name = row.get("canonical_name", "").lower()
    tier = int(row.get("trauma_tier") or 2)
    has_phone = 1 if row.get("phone", "").strip() else 0
    tier1_hint = 0 if any(k in name for k in TIER1_KEYWORDS) else 1
    return (0 if not is_verified(row) else 99, tier1_hint, tier, -has_phone, name)


def main() -> None:
    p = argparse.ArgumentParser(description="Prioritized hospital verification call queue")
    p.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    p.add_argument("--limit", type=int, default=15)
    p.add_argument("--all", action="store_true", help="Include already verified rows")
    args = p.parse_args()

    rows = load_rows(args.csv)
    pending = [r for r in rows if not is_verified(r)] if not args.all else rows
    pending.sort(key=priority)

    print(f"Queue: {len(pending)} hospitals (showing {min(args.limit, len(pending))})")
    print("priority | osm_id     | tier | phone           | name")
    print("-" * 90)
    for i, row in enumerate(pending[: args.limit], 1):
        phone = row.get("phone", "") or "(no phone)"
        print(
            f"{i:8} | {row['osm_id'][:10]:10} | t{row.get('trauma_tier', '?')} | {phone[:15]:15} | {row['canonical_name'][:40]}"
        )


if __name__ == "__main__":
    main()
