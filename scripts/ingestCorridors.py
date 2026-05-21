#!/usr/bin/env python3
"""OSM Overpass → SQLite emergency_seed.db for NovaDrive P0.

Usage:
  python scripts/ingestCorridors.py --corridor NH48 --min-pois 50 --out data/emergency_seed.db

Copy output to novadrive-mobile/assets/emergency_seed.db for bundled ingest (optional;
the app also seeds SQLite on first launch).
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import urllib.request
from pathlib import Path

# Chennai corridor bbox (demo)
BBOX = (12.85, 79.90, 13.15, 80.35)
OVERPASS = "https://overpass-api.de/api/interpreter"


def fetch_hospitals() -> list[dict]:
    south, west, north, east = BBOX
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]({south},{west},{north},{east});
      way["amenity"="hospital"]({south},{west},{north},{east});
    );
    out center 50;
    """
    req = urllib.request.Request(OVERPASS, data=query.encode(), method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.load(resp)
    nodes = []
    for el in data.get("elements", []):
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lng = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat is None or lng is None:
            continue
        tags = el.get("tags", {})
        name = tags.get("name") or f"Facility {el.get('id')}"
        phone = tags.get("phone") or tags.get("contact:phone") or ""
        nodes.append(
            {
                "id": str(el["id"]),
                "name": name,
                "type": "hospital",
                "trauma_tier": 2,
                "phone": phone,
                "lat": lat,
                "lng": lng,
                "verified": 1 if phone else 0,
            }
        )
    return nodes


def write_db(path: Path, rows: list[dict], min_pois: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if len(rows) < min_pois:
        # Pad with synthetic corridor nodes for hackathon demo
        for i in range(min_pois - len(rows)):
            rows.append(
                {
                    "id": f"pad-{i}",
                    "name": f"Corridor POI {i}",
                    "type": "clinic" if i % 3 else "hospital",
                    "trauma_tier": (i % 3) + 1,
                    "phone": "",
                    "lat": 12.9 + (i % 10) * 0.02,
                    "lng": 79.95 + (i // 10) * 0.02,
                    "verified": 0,
                }
            )
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS emergency_nodes (
          id TEXT PRIMARY KEY,
          name TEXT,
          type TEXT,
          trauma_tier INTEGER,
          phone TEXT,
          lat REAL,
          lng REAL,
          verified INTEGER DEFAULT 0
        );
        """
    )
    conn.execute("DELETE FROM emergency_nodes")
    for r in rows[: max(min_pois, len(rows))]:
        conn.execute(
            "INSERT INTO emergency_nodes (id, name, type, trauma_tier, phone, lat, lng, verified) VALUES (?,?,?,?,?,?,?,?)",
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
    print(f"Wrote {len(rows)} nodes to {path}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--corridor", default="NH48")
    p.add_argument("--min-pois", type=int, default=50)
    p.add_argument("--out", default="data/emergency_seed.db")
    args = p.parse_args()
    try:
        rows = fetch_hospitals()
    except Exception as e:
        print(f"Overpass failed ({e}); using synthetic seed only.")
        rows = []
    write_db(Path(args.out), rows, args.min_pois)


if __name__ == "__main__":
    main()
