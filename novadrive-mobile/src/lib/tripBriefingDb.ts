import * as SQLite from 'expo-sqlite';

export type HazardKind = 'hazard' | 'deadzone';

export interface CorridorHazardRow {
  id: number;
  name: string;
  note: string;
  kind: HazardKind;
}

const SEED: Omit<CorridorHazardRow, 'id'>[] = [
  {
    name: 'NH48 Wildlife crossing (km 102–115)',
    note: 'Elevated vigilance — reduced visibility at night.',
    kind: 'hazard',
  },
  {
    name: 'Tindivanam merge zone',
    note: 'Heavy truck traffic; maintain safe following distance.',
    kind: 'hazard',
  },
  {
    name: 'Canyon corridor (40 min)',
    note: 'Comm-shadow likely — offline maps and GHP cached on device.',
    kind: 'deadzone',
  },
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('margi_trip_briefing.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS corridor_hazards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          note TEXT NOT NULL,
          kind TEXT NOT NULL
        );
      `);
      const count = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM corridor_hazards`);
      if (!count?.c) {
        for (const row of SEED) {
          await db.runAsync(
            `INSERT INTO corridor_hazards (name, note, kind) VALUES (?, ?, ?)`,
            row.name,
            row.note,
            row.kind
          );
        }
      }
      return db;
    })();
  }
  return dbPromise;
}

export async function listCorridorHazards(kind?: HazardKind): Promise<CorridorHazardRow[]> {
  const db = await getDb();
  const rows = kind
    ? await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM corridor_hazards WHERE kind = ? ORDER BY id`,
        kind
      )
    : await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM corridor_hazards ORDER BY id`);
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    note: String(r.note),
    kind: r.kind as HazardKind,
  }));
}

/** Test hook: replace hazards table contents. */
export async function replaceCorridorHazardsForTests(rows: Omit<CorridorHazardRow, 'id'>[]): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM corridor_hazards`);
  for (const row of rows) {
    await db.runAsync(
      `INSERT INTO corridor_hazards (name, note, kind) VALUES (?, ?, ?)`,
      row.name,
      row.note,
      row.kind
    );
  }
}
