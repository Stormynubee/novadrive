#!/usr/bin/env python3
"""Export emergency_nodes from SQLite as JSON for generate-facilities-seed.mjs."""
from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--db", required=True)
    args = p.parse_args()
    conn = sqlite3.connect(args.db)
    rows = conn.execute(
        """SELECT id, name, type, trauma_tier, phone, lat, lng, verified
           FROM emergency_nodes ORDER BY trauma_tier, name"""
    ).fetchall()
    conn.close()
    out = [
        {
            "id": r[0],
            "name": r[1],
            "type": r[2],
            "trauma_tier": r[3],
            "phone": r[4] or "",
            "lat": r[5],
            "lng": r[6],
            "verified": bool(r[7]),
        }
        for r in rows
    ]
    print(json.dumps(out))


if __name__ == "__main__":
    main()
