#!/usr/bin/env python3
"""Report C1 POI verification progress from nh48_verification.csv."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_CSV = REPO / "data" / "corridors" / "nh48_verification.csv"


def load_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def is_verified(row: dict[str, str]) -> bool:
    return row.get("verified", "").strip() in ("1", "true", "yes") and bool(row.get("phone", "").strip())


def main() -> None:
    p = argparse.ArgumentParser(description="C1 verification progress report")
    p.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    p.add_argument("--target-verified", type=int, default=40)
    p.add_argument("--target-nodes", type=int, default=50)
    args = p.parse_args()

    rows = load_rows(args.csv)
    verified = [r for r in rows if is_verified(r)]
    pending_phone = [r for r in rows if not r.get("phone", "").strip()]
    candidate_phone = [r for r in rows if r.get("phone", "").strip() and not is_verified(r)]

    print(f"CSV rows: {len(rows)}")
    print(f"Phone-verified: {len(verified)} / {args.target_verified} target")
    print(f"Candidate phones (not yet verified): {len(candidate_phone)}")
    print(f"No phone yet: {len(pending_phone)}")
    print(f"Nodes target: {len(rows)} / {args.target_nodes}")

    if len(verified) >= args.target_verified and len(rows) >= args.target_nodes:
        print("STATUS: C1 verification target met — run verify_pois.py without --min-verified-phones 0")
    else:
        need = max(0, args.target_verified - len(verified))
        print(f"STATUS: need {need} more phone-verified rows (Task 6)")


if __name__ == "__main__":
    main()
