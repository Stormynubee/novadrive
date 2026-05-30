import sqlite3
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
INGEST = REPO / "scripts" / "ingestCorridors.py"


def test_production_mode_rejects_insufficient_rows(tmp_path):
    out = tmp_path / "seed.db"
    result = subprocess.run(
        [
            sys.executable,
            str(INGEST),
            "--corridor",
            "NH48",
            "--mode",
            "production",
            "--min-pois",
            "50",
            "--synthetic-count",
            "0",
            "--skip-fetch",
            "--out",
            str(out),
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "production mode requires" in result.stderr.lower() or "insufficient" in result.stderr.lower()


def test_demo_mode_allows_padding(tmp_path):
    out = tmp_path / "seed.db"
    result = subprocess.run(
        [
            sys.executable,
            str(INGEST),
            "--corridor",
            "NH48",
            "--mode",
            "demo",
            "--min-pois",
            "50",
            "--skip-fetch",
            "--out",
            str(out),
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    conn = sqlite3.connect(out)
    count = conn.execute("SELECT COUNT(*) FROM emergency_nodes").fetchone()[0]
    pad_count = conn.execute(
        "SELECT COUNT(*) FROM emergency_nodes WHERE id LIKE 'pad-%'"
    ).fetchone()[0]
    conn.close()
    assert count == 50
    assert pad_count == 50
