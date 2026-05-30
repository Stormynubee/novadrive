#!/usr/bin/env python3
"""OSM Overpass → SQLite emergency_seed.db for Margi C1 POI pipeline.

Usage:
  python scripts/ingestCorridors.py --corridor NH48 --min-pois 50 --out data/emergency_seed.db
  python scripts/ingestCorridors.py --mode production --bbox-json data/corridors/nh48_bbox.json ...

Copy output to novadrive-mobile/assets/emergency_seed.db for bundled ingest (optional;
the app also seeds SQLite on first launch via facilitiesDb.ts).
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import urllib.request
from pathlib import Path

# Chennai corridor bbox (demo fallback)
DEFAULT_BBOX = (12.85, 79.90, 13.15, 80.35)
OVERPASS = "https://overpass-api.de/api/interpreter"


def load_bbox(bbox_json: Path | None) -> tuple[float, float, float, float]:
    if bbox_json is None:
        return DEFAULT_BBOX
    data = json.loads(bbox_json.read_text(encoding="utf-8"))
    return (data["south"], data["west"], data["north"], data["east"])


def fetch_hospitals(bbox: tuple[float, float, float, float]) -> list[dict]:
    south, west, north, east = bbox
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


def pad_rows(count: int, start_index: int = 0) -> list[dict]:
    rows = []
    for i in range(count):
        idx = start_index + i
        rows.append(
            {
                "id": f"pad-{idx}",
                "name": f"Corridor POI {idx}",
                "type": "clinic" if idx % 3 else "hospital",
                "trauma_tier": (idx % 3) + 1,
                "phone": "",
                "lat": 12.9 + (idx % 10) * 0.02,
                "lng": 79.95 + (idx // 10) * 0.02,
                "verified": 0,
            }
        )
    return rows


def write_db(
    path: Path,
    rows: list[dict],
    min_pois: int,
    mode: str,
    synthetic_count: int | None,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    if mode == "production":
        if len(rows) < min_pois:
            print(
                f"production mode requires >= {min_pois} real OSM rows; got {len(rows)}. "
                "Run verify workflow or use demo mode for hackathon builds.",
                file=sys.stderr,
            )
            raise SystemExit(1)
    elif mode == "demo":
        pad_target = (
            synthetic_count
            if synthetic_count is not None
            else max(0, min_pois - len(rows))
        )
        if pad_target > 0:
            rows = rows + pad_rows(pad_target)
    else:
        raise SystemExit(f"unknown mode: {mode}")

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
    print(f"Wrote {min(len(rows), max(min_pois, len(rows)))} nodes to {path} (mode={mode})")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--corridor", default="NH48")
    p.add_argument("--min-pois", type=int, default=50)
    p.add_argument("--out", default="data/emergency_seed.db")
    p.add_argument("--mode", choices=("demo", "production"), default="demo")
    p.add_argument("--skip-fetch", action="store_true", help="Skip Overpass; use empty row list")
    p.add_argument(
        "--synthetic-count",
        type=int,
        default=None,
        help="Demo mode only: number of pad-* rows to add",
    )
    p.add_argument("--bbox-json", type=Path, default=None, help="Load south/west/north/east from JSON")
    args = p.parse_args()

    bbox = load_bbox(args.bbox_json)
    rows: list[dict] = []
    if not args.skip_fetch:
        try:
            rows = fetch_hospitals(bbox)
        except Exception as e:
            print(f"Overpass failed ({e}); using empty row list.")
            rows = []

    write_db(
        Path(args.out),
        rows,
        args.min_pois,
        args.mode,
        args.synthetic_count,
    )


if __name__ == "__main__":
    main()
