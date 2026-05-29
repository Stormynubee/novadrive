import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface RahVeerClaim {
  id: string;
  relayId: string;
  createdAt: string;
  lat: number | null;
  lng: number | null;
  portalOpened: boolean;
  note: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('margi_rahveer.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS rahveer_claims (
          id TEXT PRIMARY KEY NOT NULL,
          relay_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          lat REAL,
          lng REAL,
          portal_opened INTEGER DEFAULT 0,
          note TEXT DEFAULT ''
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

function rowToClaim(row: Record<string, unknown>): RahVeerClaim {
  return {
    id: String(row.id),
    relayId: String(row.relay_id),
    createdAt: String(row.created_at),
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    portalOpened: Boolean(row.portal_opened),
    note: String(row.note ?? ''),
  };
}

export async function insertRahVeerClaim(input: {
  relayId: string;
  lat?: number | null;
  lng?: number | null;
  note?: string;
}): Promise<string> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO rahveer_claims (id, relay_id, created_at, lat, lng, portal_opened, note) VALUES (?, ?, ?, ?, ?, 0, ?)`,
    id,
    input.relayId,
    new Date().toISOString(),
    input.lat ?? null,
    input.lng ?? null,
    input.note ?? ''
  );
  return id;
}

export async function markRahVeerPortalOpened(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE rahveer_claims SET portal_opened = 1 WHERE id = ?`, id);
}

export async function listRahVeerClaims(limit = 30): Promise<RahVeerClaim[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM rahveer_claims ORDER BY created_at DESC LIMIT ?`,
    limit
  );
  return rows.map(rowToClaim);
}
