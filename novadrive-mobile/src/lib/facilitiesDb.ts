import * as SQLite from 'expo-sqlite';
import type { Facility, TriageColor } from './types';

const SEED: Omit<Facility, 'distanceKm' | 'etaMinutes' | 'recommended'>[] = [
  { id: 't1', name: 'Apollo Highway Trauma Center', type: 'trauma', traumaTier: 1, phone: '044-27428888', verified: true },
  { id: 't2', name: 'SRMC Emergency & Trauma', type: 'trauma', traumaTier: 2, phone: '044-27440000', verified: true },
  { id: 'h1', name: 'District General Hospital ER', type: 'hospital', traumaTier: 2, phone: '108', verified: true },
  { id: 'h2', name: 'Chengalpattu Govt Hospital', type: 'hospital', traumaTier: 2, phone: '044-27423333', verified: false },
  { id: 'c1', name: 'NH48 Primary Health Centre', type: 'clinic', traumaTier: 3, phone: '044-27420001', verified: false },
  { id: 'c2', name: 'Tambaram Urban Clinic', type: 'clinic', traumaTier: 3, phone: '044-22220002', verified: false },
];

const POI_COORDS: Record<string, { lat: number; lng: number }> = {
  t1: { lat: 13.017, lng: 80.22 },
  t2: { lat: 12.97, lng: 79.95 },
  h1: { lat: 13.05, lng: 80.18 },
  h2: { lat: 12.69, lng: 79.98 },
  c1: { lat: 13.08, lng: 80.27 },
  c2: { lat: 12.92, lng: 80.12 },
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('emergency_seed.db');
      await db.execAsync(`
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
      `);
      const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM emergency_nodes');
      if (!row || row.c < SEED.length) {
        await db.runAsync('DELETE FROM emergency_nodes');
        for (const node of SEED) {
          const coord = POI_COORDS[node.id];
          await db.runAsync(
            'INSERT OR REPLACE INTO emergency_nodes (id, name, type, trauma_tier, phone, lat, lng, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              node.id,
              node.name,
              node.type,
              node.traumaTier,
              node.phone,
              coord.lat,
              coord.lng,
              node.verified ? 1 : 0,
            ]
          );
        }
        const extras = 44;
        for (let i = 0; i < extras; i++) {
          const lat = 12.9 + (i % 10) * 0.02;
          const lng = 79.9 + Math.floor(i / 10) * 0.03;
          await db.runAsync(
            'INSERT OR REPLACE INTO emergency_nodes (id, name, type, trauma_tier, phone, lat, lng, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              `seed-${i}`,
              `Corridor Facility ${i + 1}`,
              i % 3 === 0 ? 'trauma' : i % 3 === 1 ? 'hospital' : 'clinic',
              (i % 3) + 1,
              i % 5 === 0 ? '108' : '',
              lat,
              lng,
              0,
            ]
          );
        }
      }
      return db;
    })();
  }
  return dbPromise;
}

export async function rankFacilities(
  triage: TriageColor,
  lat: number,
  lng: number
): Promise<Facility[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    type: string;
    trauma_tier: number;
    phone: string;
    lat: number;
    lng: number;
    verified: number;
  }>('SELECT * FROM emergency_nodes');

  let filtered: Facility[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as Facility['type'],
    traumaTier: r.trauma_tier as 1 | 2 | 3,
    phone: r.phone && r.phone.length > 0 ? r.phone : 'unverified',
    distanceKm: haversineKm(lat, lng, r.lat, r.lng),
    etaMinutes: Math.max(5, Math.round(haversineKm(lat, lng, r.lat, r.lng) * 2.5)),
    verified: r.verified === 1,
  }));

  if (triage === 'RED') filtered = filtered.filter((f) => f.traumaTier <= 2 && f.type !== 'clinic');
  else if (triage === 'YELLOW') filtered = filtered.filter((f) => f.traumaTier <= 3 && f.type !== 'clinic');
  else if (triage === 'GREEN') filtered = filtered.filter((f) => f.type === 'clinic' || f.traumaTier === 3);
  else return [];

  filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  if (filtered.length > 0) filtered[0] = { ...filtered[0], recommended: true };
  return filtered.slice(0, 6);
}
