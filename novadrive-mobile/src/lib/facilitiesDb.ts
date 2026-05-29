import * as SQLite from 'expo-sqlite';
import type { Facility, TriageColor } from './types';

const SEED: Omit<Facility, 'distanceKm' | 'etaMinutes' | 'recommended'>[] = [
  { id: 't1', name: 'Apollo Hospitals Greams Road (Trauma)', type: 'trauma', traumaTier: 1, phone: '044-28290200', verified: true },
  { id: 't2', name: 'SRMC Emergency & Trauma (Chennai)', type: 'trauma', traumaTier: 1, phone: '044-27440000', verified: true },
  { id: 't3', name: 'Kauvery Hospital Alwarpet ER', type: 'trauma', traumaTier: 1, phone: '044-40004000', verified: true },
  { id: 't4', name: 'MIOT International Trauma Bay', type: 'trauma', traumaTier: 1, phone: '044-42002288', verified: true },
  { id: 'h1', name: 'Rajiv Gandhi Govt General Hospital ER', type: 'hospital', traumaTier: 2, phone: '044-28194600', verified: true },
  { id: 'h2', name: 'Chengalpattu Medical College Hospital', type: 'hospital', traumaTier: 2, phone: '044-27423333', verified: false },
  { id: 'h3', name: 'Sriperumbudur Govt Hospital (NH48)', type: 'hospital', traumaTier: 2, phone: '044-27162200', verified: false },
  { id: 'h4', name: 'Vellore CMC Casualty (NH referral)', type: 'hospital', traumaTier: 1, phone: '0416-2282010', verified: true },
  { id: 'h5', name: 'Kanchipuram District HQ Hospital', type: 'hospital', traumaTier: 2, phone: '044-27222201', verified: false },
  { id: 'c1', name: 'NH48 Primary Health Centre (demo)', type: 'clinic', traumaTier: 3, phone: '044-27420001', verified: false },
  { id: 'c2', name: 'Tambaram Urban Clinic (demo)', type: 'clinic', traumaTier: 3, phone: '044-22220002', verified: false },
];

/** Hand-curated demo seed date — not NHA/ABDM registry synced. */
export const POI_DATA_VERIFIED = '2026-05-28';

const POI_COORDS: Record<string, { lat: number; lng: number }> = {
  t1: { lat: 13.056, lng: 80.25 },
  t2: { lat: 12.97, lng: 79.95 },
  t3: { lat: 13.03, lng: 80.25 },
  t4: { lat: 13.02, lng: 80.19 },
  h1: { lat: 13.08, lng: 80.27 },
  h2: { lat: 12.69, lng: 79.98 },
  h3: { lat: 12.97, lng: 79.94 },
  h4: { lat: 12.92, lng: 79.13 },
  h5: { lat: 12.83, lng: 79.7 },
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
        const extras = 39;
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
  lng: number,
  maxKm = 100
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

  filtered = filtered.filter((f) => f.distanceKm <= maxKm);

  if (triage === 'RED') filtered = filtered.filter((f) => f.traumaTier <= 2 && f.type !== 'clinic');
  else if (triage === 'YELLOW') filtered = filtered.filter((f) => f.traumaTier <= 3 && f.type !== 'clinic');
  else if (triage === 'GREEN') filtered = filtered.filter((f) => f.type === 'clinic' || f.traumaTier === 3);
  else return [];

  filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  if (filtered.length > 0) filtered[0] = { ...filtered[0], recommended: true };
  return filtered.slice(0, 6);
}
