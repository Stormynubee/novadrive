import * as SQLite from 'expo-sqlite';
import type { Facility, TriageColor } from './types';

const SEED: Omit<Facility, 'distanceKm' | 'etaMinutes' | 'recommended'>[] = [
  { id: '459635161', name: 'Apollo Hospitals Greams Road (Trauma)', type: 'trauma', traumaTier: 1, phone: '044-28290200', verified: true },
  { id: '364650995', name: 'MIOT International Trauma Bay', type: 'trauma', traumaTier: 1, phone: '044-42002288', verified: true },
  { id: '1015571601', name: 'SRMC Emergency & Trauma (Chennai)', type: 'trauma', traumaTier: 1, phone: '044-27440000', verified: true },
  { id: '310909754', name: 'Vellore CMC Casualty (NH referral)', type: 'trauma', traumaTier: 1, phone: '0416-2282010', verified: true },
  { id: '1127285905', name: 'Aakash Fertility Centre & Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1472969165', name: 'Amma Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '258978416', name: 'Amrit Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '289486820', name: 'Apollo Hospitals, Tondiarpet', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '941471945', name: 'Appasamy Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '941611681', name: 'Appasamy Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '941621037', name: 'Appolo Clinic', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1621246558', name: 'Ashwini Eye Care', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1185699253', name: 'Avadi Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '540658116', name: 'B.M.Orthopaedic Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '310910945', name: 'BM Hospital', type: 'hospital', traumaTier: 2, phone: '044-22670277', verified: true },
  { id: '1446415367', name: 'Bhadra Homeo', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '312000326', name: 'Cancer Institute', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '262452334', name: 'City Tower Hospitals', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '303590777', name: 'Corporation Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1129195836', name: 'Facility 1129195836', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1597151538', name: 'Facility 1597151538', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '370967673', name: 'Facility 370967673', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '310504820', name: 'Goverment dental hospital & collage', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '320275820', name: 'Govt Maternity Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '308811614', name: 'Hindu Mission Health Services, Kanchipuram', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '320275824', name: 'Institute of Child Health', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '320275839', name: 'Institute of Obstetrics and Gynaecology dd', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '597590621', name: 'JJ Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '311429396', name: 'K.F. Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '295544111', name: 'K.H.M.Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '248420920', name: 'Kalaignar Karunanidhi Nagar', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '248560797', name: 'Kasimedu', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '310732936', name: 'Kilpauk Medical College', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '310015097', name: 'Military Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1152858038', name: 'Rajan Eye Care Hospital', type: 'hospital', traumaTier: 2, phone: '2834 0500/0300', verified: true },
  { id: '375668400', name: 'Rajiv Gandhi Govt General Hospital ER', type: 'hospital', traumaTier: 2, phone: '044-28194600', verified: true },
  { id: '1474055555', name: 'Right Hospitals', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '983957837', name: 'Sankara Eye Hospital, Kanchipuram', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '442508332', name: 'Sarswathi Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '295552092', name: 'Sri Devi Speciality Hospial', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '313027868', name: 'Sri Ramachandra Medical Centre and Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1015571498', name: 'Srm Speciality Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '367795605', name: 'St. Thomas Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '295552091', name: 'Sundaram Medical Foundation', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1560720462', name: 'Vasan Eye Care Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '595706154', name: 'Vasan Eye Care Hospital, Vadapalani', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '459648701', name: 'Vijaya Heart Centre', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '258978417', name: 'Vikram Hospital', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '591555028', name: 'skandan nursing home', type: 'hospital', traumaTier: 2, phone: '', verified: false },
  { id: '1315895438', name: 'sree dhanalakshmi family clinic', type: 'hospital', traumaTier: 2, phone: '', verified: false },
];

/** Verification CSV merge date — see docs/POI_VERIFICATION_RUNBOOK.md */
export const POI_DATA_VERIFIED = '2026-05-30';

export function countVerifiedFacilities(): number {
  return SEED.filter((n) => n.verified && n.phone && n.phone !== 'unverified').length;
}

const POI_COORDS: Record<string, { lat: number; lng: number }> = {
  '459635161': { lat: 13.05244, lng: 80.2041657 },
  '364650995': { lat: 13.0211808, lng: 80.1858412 },
  '1015571601': { lat: 13.0321291, lng: 80.1801201 },
  '310909754': { lat: 12.9847145, lng: 80.1905906 },
  '1127285905': { lat: 13.0554597, lng: 80.2118365 },
  '1472969165': { lat: 13.0626045, lng: 80.2305209 },
  '258978416': { lat: 13.0922007, lng: 80.2792912 },
  '289486820': { lat: 13.1289367, lng: 80.2905623 },
  '941471945': { lat: 13.0750445, lng: 80.2151198 },
  '941611681': { lat: 13.073239, lng: 80.2148826 },
  '941621037': { lat: 13.0892073, lng: 80.2178866 },
  '1621246558': { lat: 13.1187083, lng: 80.1572422 },
  '1185699253': { lat: 13.1174941, lng: 80.1008132 },
  '540658116': { lat: 13.1181104, lng: 80.1499411 },
  '310910945': { lat: 12.9887616, lng: 80.1904116 },
  '1446415367': { lat: 12.9663879, lng: 80.2474724 },
  '312000326': { lat: 13.0061338, lng: 80.239884 },
  '262452334': { lat: 13.08438, lng: 80.2160862 },
  '303590777': { lat: 13.0336624, lng: 80.2572467 },
  '1129195836': { lat: 12.9445695, lng: 80.1210689 },
  '1597151538': { lat: 13.0584072, lng: 80.2011738 },
  '370967673': { lat: 13.009781, lng: 80.1949734 },
  '310504820': { lat: 13.0829605, lng: 80.281264 },
  '320275820': { lat: 13.0720996, lng: 80.2589871 },
  '308811614': { lat: 12.9787682, lng: 80.1846471 },
  '320275824': { lat: 13.0735496, lng: 80.257025 },
  '320275839': { lat: 13.0735431, lng: 80.2591463 },
  '597590621': { lat: 13.0571293, lng: 80.1942138 },
  '311429396': { lat: 12.973463, lng: 80.1841397 },
  '295544111': { lat: 13.0844424, lng: 80.2130723 },
  '248420920': { lat: 13.0386493, lng: 80.2052158 },
  '248560797': { lat: 13.122775, lng: 80.2960584 },
  '310732936': { lat: 13.0785984, lng: 80.2433369 },
  '310015097': { lat: 13.0194622, lng: 80.1972947 },
  '1152858038': { lat: 13.0508335, lng: 80.2434416 },
  '375668400': { lat: 13.0293624, lng: 80.2440921 },
  '1474055555': { lat: 13.0787952, lng: 80.2405731 },
  '983957837': { lat: 12.965059, lng: 80.128212 },
  '442508332': { lat: 12.9653846, lng: 80.2067733 },
  '295552092': { lat: 13.0887983, lng: 80.1994692 },
  '313027868': { lat: 13.0380979, lng: 80.1428047 },
  '1015571498': { lat: 13.0331325, lng: 80.1810857 },
  '367795605': { lat: 13.0122733, lng: 80.196428 },
  '295552091': { lat: 13.08217, lng: 80.2069819 },
  '1560720462': { lat: 13.0015307, lng: 80.2552541 },
  '595706154': { lat: 13.0495316, lng: 80.211027 },
  '459648701': { lat: 13.0483819, lng: 80.2070144 },
  '258978417': { lat: 13.0985007, lng: 80.2796178 },
  '591555028': { lat: 12.9447938, lng: 80.1405596 },
  '1315895438': { lat: 13.0583046, lng: 80.211745 },
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
