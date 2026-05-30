#!/usr/bin/env python3
"""Apply researched public phone numbers to nh48_verification.csv.

Modes:
  candidate         — fill phone, keep verified=0 (default; for call follow-up)
  website-official  — fill phone, verified=1, verifier=web-official (hospital .gov/.edu official lines only)
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_CSV = REPO / "data" / "corridors" / "nh48_verification.csv"
DEFAULT_CANDIDATES = REPO / "data" / "corridors" / "nh48_public_phone_candidates.json"

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


def load_candidates(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("candidates file must be a JSON array")
    return data


def main() -> None:
    p = argparse.ArgumentParser(description="Apply public phone candidates to verification CSV")
    p.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    p.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES)
    p.add_argument("--mode", choices=("candidate", "website-official"), default="candidate")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    candidates = load_candidates(args.candidates)
    with args.csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    by_id = {r["osm_id"].strip(): r for r in rows}

    applied = 0
    skipped = 0
    for cand in candidates:
        osm_id = str(cand["osm_id"]).strip()
        phone = str(cand.get("phone", "")).strip()
        if not osm_id or not phone:
            skipped += 1
            continue
        row = by_id.get(osm_id)
        if not row:
            skipped += 1
            continue
        if row.get("verified", "").strip() in ("1", "true", "yes") and row.get("phone", "").strip():
            skipped += 1
            continue

        row["phone"] = phone
        if cand.get("canonical_name"):
            row["canonical_name"] = cand["canonical_name"]
        if cand.get("trauma_tier"):
            row["trauma_tier"] = str(cand["trauma_tier"])

        source = cand.get("source_url", "public research")
        note = f"Official/public line per {source}"
        if args.mode == "website-official":
            row["verified"] = "1"
            row["verifier"] = cand.get("verifier", "web-official")
            row["verified_date"] = cand.get("verified_date", "2026-05-30")
            row["notes"] = note
        else:
            row["verified"] = "0"
            row["notes"] = f"{note} — pending call confirmation"

        applied += 1

    verified = sum(
        1 for r in rows if r.get("verified", "").strip() in ("1", "true", "yes") and r.get("phone", "").strip()
    )
    print(f"Applied: {applied}, skipped: {skipped}, phone-verified now: {verified}")

    if args.dry_run:
        return

    with args.csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {args.csv}")


if __name__ == "__main__":
    main()
