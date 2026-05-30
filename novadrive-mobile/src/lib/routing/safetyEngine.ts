import * as SQLite from 'expo-sqlite';
import type { LatLng } from './nominatim';

export type SafetyHotspot = {
  id?: string;
  area: string;
  risk: 'High' | 'Medium' | 'Low';
  reason: string;
  lat: number;
  lng: number;
  suggestion: string;
};

export type SafetyAnalysis = {
  safetyPct: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  advice: string;
  closestHotspot: SafetyHotspot | null;
  distanceToHotspot: number | null;
  dataSource: 'cloud' | 'sqlite' | 'memory';
};

export const STATIC_SAFETY_HOTSPOTS: SafetyHotspot[] = [
  // Pune Hotspots
  {
    area: 'Shivajinagar, Pune',
    risk: 'High',
    reason: 'Heavy transit congestion and complex signal timings',
    lat: 18.5308,
    lng: 73.8475,
    suggestion: 'Avoid peak hours (6–9 PM). Use designated flyovers where possible.',
  },
  {
    area: 'Katraj Ghat & Highway Merging, Pune',
    risk: 'High',
    reason: 'Sharp downhill curves and high-speed freight merging',
    lat: 18.4575,
    lng: 73.8657,
    suggestion: 'Maintain lower gears, extend vehicle gap, and avoid overtaking on curves.',
  },
  {
    area: 'Hinjewadi Phase 1 Gates, Pune',
    risk: 'Medium',
    reason: 'Severe IT corridor bottleneck and heavy two-wheeler merging',
    lat: 18.5912,
    lng: 73.7389,
    suggestion: 'Anticipate sudden lane changes and watch for commuter pedestrian crossings.',
  },
  {
    area: 'Chandni Chowk, Pune',
    risk: 'High',
    reason: 'Complex multi-way junction with ongoing highway transit bypasses',
    lat: 18.5085,
    lng: 73.7762,
    suggestion: 'Expect sudden lane mergers. Follow diversion signage precisely.',
  },
  {
    area: 'Hadapsar Gadital, Pune',
    risk: 'Medium',
    reason: 'Heavy bus transit congestion and high pedestrian density',
    lat: 18.4967,
    lng: 73.9416,
    suggestion: 'Drive cautiously, stay in designated lanes, and limit speed to 30 km/h.',
  },

  // Odisha Hotspots
  {
    area: 'Khandagiri Chowk, Bhubaneswar (NH-16)',
    risk: 'High',
    reason: 'Severe highway-to-urban merging bottleneck and heavy pedestrian footfall',
    lat: 20.2588,
    lng: 85.7876,
    suggestion: 'Anticipate sudden braking, slow down, and monitor left-hand blindspots.',
  },
  {
    area: 'Palasuni Junction, Bhubaneswar (NH-16)',
    risk: 'High',
    reason: 'High-speed highway crossing with severe mid-block pedestrian crossings',
    lat: 20.2974,
    lng: 85.8679,
    suggestion: 'Reduce speed below 50 km/h. Be alert for pedestrians crossing the highway divider.',
  },
  {
    area: 'Manguli Chowk, Cuttack (NH-16)',
    risk: 'High',
    reason: 'Major multi-highway arterial junction with high-speed commercial freight transit',
    lat: 20.5284,
    lng: 85.9123,
    suggestion: 'High-risk merging zone. Maintain clear trailing distance behind large commercial trucks.',
  },
  {
    area: 'Batabhuasuni Bypass, Khurda (NH-16)',
    risk: 'High',
    reason: 'Sharp highway curves with poor visibility and high freight collision rates',
    lat: 20.1983,
    lng: 85.6263,
    suggestion: 'Maintain lane discipline. Avoid overtaking on blind curves or under wet road conditions.',
  },
  {
    area: 'Acharya Vihar Square, Bhubaneswar',
    risk: 'Medium',
    reason: 'Severe arterial crossroads congestion and high-density two-wheeler traffic',
    lat: 20.2917,
    lng: 85.8398,
    suggestion: 'Monitor close-range traffic. Extend vigilance towards sudden two-wheeler cuts.',
  },
  {
    area: 'Sason Highway Bypass, Sambalpur (SH-10)',
    risk: 'Medium',
    reason: 'Sharp turns with heavy commercial dump-truck freight traffic',
    lat: 21.5721,
    lng: 84.0205,
    suggestion: 'Keep a safe 3-second distance. Do not attempt high-speed overtakes.',
  },
  {
    area: 'Godbhaga Junction, Sambalpur (NH-6)',
    risk: 'Medium',
    reason: 'High-speed highway junction with local agricultural vehicle crossings',
    lat: 21.3653,
    lng: 83.8214,
    suggestion: 'Watch for slower-moving local transit merging from arterial rural links.',
  },
  {
    area: 'Jamjhadi Chowk, Balasore (NH-16)',
    risk: 'High',
    reason: 'Narrow bridge highway transit bottleneck and high truck traffic density',
    lat: 21.3325,
    lng: 86.6710,
    suggestion: 'Slow down and maintain clear lane discipline on bridges.',
  },

  // Chennai Hotspots
  {
    area: 'Kathipara Junction & Flyover, Chennai',
    risk: 'High',
    reason: 'Multi-level cloverleaf merging curves and extreme high-speed speed variance',
    lat: 13.0076,
    lng: 80.2052,
    suggestion: 'Strictly follow lane markings. Maintain constant speed and watch blindspots.',
  },
  {
    area: 'Koyambedu Roundabout & Metro, Chennai',
    risk: 'High',
    reason: 'High density transit hub with heavy bus traffic and pedestrian movement',
    lat: 13.0727,
    lng: 80.2016,
    suggestion: 'Keep speed under 30 km/h. Watch for sudden stops by commercial transport buses.',
  },
  {
    area: 'Sholinganallur Junction, Chennai (OMR)',
    risk: 'High',
    reason: 'Extreme tech-corridor traffic volume with frequent heavy signal delays',
    lat: 12.9011,
    lng: 80.2269,
    suggestion: 'Anticipate long delays. Keep a safe distance from sudden merging commuter vehicles.',
  },
  {
    area: 'Ambattur Telephone Exchange, Chennai (CTH Road)',
    risk: 'High',
    reason: 'Narrow industrial highway stretch with high commercial freight transit',
    lat: 13.1147,
    lng: 80.1548,
    suggestion: 'Watch out for heavy commercial trucks and poor road shoulder quality.',
  },
  {
    area: 'Akkarai Overspeed Curve, Chennai (ECR)',
    risk: 'Medium',
    reason: 'High-speed coastal transit lanes with frequent sharp night-time curves',
    lat: 12.9122,
    lng: 80.2520,
    suggestion: 'Reduce speeds to 50 km/h. High caution recommended during night driving.',
  },
  {
    area: 'Siruseri IT Park Junction, Chennai (OMR)',
    risk: 'Medium',
    reason: 'High commuter volume during morning/evening shift change intervals',
    lat: 12.8252,
    lng: 80.2199,
    suggestion: 'Be prepared for high-volume commuter rush. Keep speed moderate.',
  },
  {
    area: 'Vandalur Flyover Merging, Chennai (GST Road)',
    risk: 'High',
    reason: 'Highway junction with heavy commercial freight merging at speed',
    lat: 12.8906,
    lng: 80.0812,
    suggestion: 'Highway junction. Exercise caution when joining high-speed traffic lanes.',
  },
  {
    area: 'Kelambakkam Junction, Chennai',
    risk: 'Medium',
    reason: 'Multi-way junction with high-density rural-to-urban transit flow',
    lat: 12.7885,
    lng: 80.2215,
    suggestion: 'Slow down. Be aware of non-motorized transport vehicles crossing junctions.',
  },

  // Bengaluru Hotspots
  {
    area: 'Silk Board Junction, Bengaluru',
    risk: 'High',
    reason: 'Severe multi-way traffic weaving patterns and long queuing congestion',
    lat: 12.9176,
    lng: 77.6244,
    suggestion: 'Maintain extreme patience. Anticipate frequent close-proximity lane cuts.',
  },
  {
    area: 'Tin Factory Flyover, Bengaluru',
    risk: 'High',
    reason: 'Severe bottlenecks and heavy lane-narrowing under metro construction',
    lat: 12.9934,
    lng: 77.6811,
    suggestion: 'Expect sudden narrowing of lanes. Watch out for temporary road barriers.',
  },
  {
    area: 'Hebbal Flyover Merging, Bengaluru',
    risk: 'High',
    reason: 'Steep curved flyover ramps with extreme speed differences',
    lat: 13.0359,
    lng: 77.5978,
    suggestion: 'Maintain lane discipline. Avoid overtaking on tight interchange ramps.',
  },

  // Delhi Hotspots
  {
    area: 'Chanakyapuri Roundabouts, Delhi',
    risk: 'Medium',
    reason: 'Broad high-speed diplomatic corridors with frequent active pedestrian crossings',
    lat: 28.5983,
    lng: 77.1895,
    suggestion: 'Maintain absolute speed limits. Yield to all pedestrian crosswalk zones.',
  },
  {
    area: 'Mukarba Chowk, Delhi',
    risk: 'High',
    reason: 'Multi-highway flyover merging with severe commercial truck weaving patterns',
    lat: 28.7372,
    lng: 77.1601,
    suggestion: 'Merging bottleneck. Anticipate heavy truck movements and broad turns.',
  },
  {
    area: 'Dhaula Kuan Interchange, Delhi',
    risk: 'High',
    reason: 'Complex multi-directional transit tunnels and rapid speed changes',
    lat: 28.5919,
    lng: 77.1616,
    suggestion: 'Complex highway junction. Ensure correct lane selection well in advance.',
  },

  // Mumbai Hotspots
  {
    area: 'Mulund Toll Naka, Mumbai (EEH)',
    risk: 'High',
    reason: 'Heavy commercial truck queue mergers and severe peak congestion',
    lat: 19.1678,
    lng: 72.9622,
    suggestion: 'Expect long vehicular queues. Approach toll merging lines slowly.',
  },
  {
    area: 'Bandra Reclamation Curve, Mumbai (WEH)',
    risk: 'High',
    reason: 'High-speed wet-weather skidding zone approaching Sea Link toll',
    lat: 19.0435,
    lng: 72.8396,
    suggestion: 'High-speed curve. Reduce speed significantly during wet weather conditions.',
  },
  {
    area: 'Sion Circle Bypass, Mumbai',
    risk: 'Medium',
    reason: 'Heavy urban traffic junctions and multi-lane commercial merging lanes',
    lat: 19.0384,
    lng: 72.8643,
    suggestion: 'Urban junction. Keep a sharp watch for local buses and two-wheelers.',
  },

  // Kolkata Hotspots
  {
    area: 'Maa Flyover Curve, Kolkata',
    risk: 'High',
    reason: 'Sharp high-speed elevated curves with low friction under wet weather',
    lat: 22.5442,
    lng: 88.3914,
    suggestion: 'Elevated sharp curve. Strictly maintain the 50 km/h speed limit.',
  },
  {
    area: 'Howrah Bridge Merging, Kolkata',
    risk: 'High',
    reason: 'Extremely high pedestrian densities and slow moving cargo handcarts',
    lat: 22.5851,
    lng: 88.3478,
    suggestion: 'High-density transit lane. Watch for pedestrians and manual handcarts.',
  },

  // Hyderabad Hotspots
  {
    area: 'Gachibowli X Roads, Hyderabad',
    risk: 'High',
    reason: 'IT gateway crossroads with rapid speed changes and heavy vehicle weaving',
    lat: 17.4475,
    lng: 78.3562,
    suggestion: 'Expect heavy weaving traffic. Signal lane changes early and clearly.',
  },
  {
    area: 'Panjagutta Junction, Hyderabad',
    risk: 'Medium',
    reason: 'Heavy commercial urban transit and severe multi-level queuing delays',
    lat: 17.4264,
    lng: 78.4531,
    suggestion: 'Busy urban intersection. Yield to crossing public transit vehicles.',
  },

  // Ahmedabad Hotspots
  {
    area: 'Iscon Crossroad, Ahmedabad (SG Highway)',
    risk: 'High',
    reason: 'Broad high-speed expressway lanes with frequent cross-overs',
    lat: 23.0247,
    lng: 72.5074,
    suggestion: 'High-speed highway stretch. Yield to vehicles entering the main highway.',
  },
  {
    area: 'CTM Double Road, Ahmedabad',
    risk: 'Medium',
    reason: 'Heavy highway merging transit and commercial trucking terminals',
    lat: 22.9938,
    lng: 72.6289,
    suggestion: 'Trucking corridor. Keep a safe following distance from loaded trucks.',
  },
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('emergency_seed.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS safety_hotspots (
          id TEXT PRIMARY KEY,
          area TEXT,
          risk TEXT,
          reason TEXT,
          lat REAL,
          lng REAL,
          suggestion TEXT
        );
      `);
      const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM safety_hotspots');
      if (!row || row.c < STATIC_SAFETY_HOTSPOTS.length) {
        await db.runAsync('DELETE FROM safety_hotspots');
        for (let i = 0; i < STATIC_SAFETY_HOTSPOTS.length; i++) {
          const item = STATIC_SAFETY_HOTSPOTS[i];
          await db.runAsync(
            'INSERT OR REPLACE INTO safety_hotspots (id, area, risk, reason, lat, lng, suggestion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [`hotspot-${i}`, item.area, item.risk, item.reason, item.lat, item.lng, item.suggestion]
          );
        }
      }
      return db;
    })();
  }
  return dbPromise;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Dynamic cloud safety fetch with absolute timeout.
 */
async function fetchCloudSafety(destName: string, fetchImpl: typeof fetch): Promise<SafetyHotspot[]> {
  const url = `https://api.margisafety.gov.in/v1/blackspots?query=${encodeURIComponent(destName)}`;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000); // 2 second timeout

  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(id);
    if (!res.ok) throw new Error('API unreachable');
    const data = await res.json() as { hotspots: SafetyHotspot[] };
    return data.hotspots || [];
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/**
 * Hybrid proximity safety analyser:
 * Queries Cloud Safety API, falls back to SQLite, falls back to static in-memory array.
 */
export async function queryRouteSafety(
  coordinates: LatLng[] | null,
  destName: string,
  fetchImpl: typeof fetch = fetch
): Promise<SafetyAnalysis> {
  let hotspots: SafetyHotspot[] = [];
  let source: 'cloud' | 'sqlite' | 'memory' = 'cloud';

  // 1. Primary: Cloud API
  try {
    hotspots = await fetchCloudSafety(destName, fetchImpl);
  } catch {
    // 2. Failsafe level 1: Offline SQLite
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<{
        area: string;
        risk: string;
        reason: string;
        lat: number;
        lng: number;
        suggestion: string;
      }>('SELECT * FROM safety_hotspots');
      hotspots = rows.map((r) => ({
        area: r.area,
        risk: r.risk as 'High' | 'Medium' | 'Low',
        reason: r.reason,
        lat: r.lat,
        lng: r.lng,
        suggestion: r.suggestion,
      }));
      source = 'sqlite';
    } catch {
      // 3. Failsafe level 2: In-memory Static presets
      hotspots = STATIC_SAFETY_HOTSPOTS;
      source = 'memory';
    }
  }

  if (hotspots.length === 0) {
    hotspots = STATIC_SAFETY_HOTSPOTS;
  }

  // Calculate safety coordinates
  if (!coordinates || coordinates.length === 0) {
    const matched = hotspots.find((h) =>
      destName.toLowerCase().includes(h.area.toLowerCase().split(',')[0].trim())
    );
    if (matched) {
      const safetyPct = matched.risk === 'High' ? 62 : matched.risk === 'Medium' ? 82 : 98;
      return {
        safetyPct,
        riskLevel: matched.risk,
        advice: matched.suggestion,
        closestHotspot: matched,
        distanceToHotspot: 0,
        dataSource: source,
      };
    }
    return {
      safetyPct: 98,
      riskLevel: 'Low',
      advice: 'Optimal corridor selected. Drive within speed limits.',
      closestHotspot: null,
      distanceToHotspot: null,
      dataSource: source,
    };
  }

  let minDistance = Infinity;
  let closest: SafetyHotspot | null = null;

  for (const coord of coordinates) {
    for (const hotspot of hotspots) {
      const dist = getDistanceKm(coord.lat, coord.lng, hotspot.lat, hotspot.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = hotspot;
      }
    }
  }

  if (closest && minDistance <= 5.0) {
    const safetyPct =
      closest.risk === 'High'
        ? Math.max(55, Math.round(55 + (minDistance / 5.0) * 15))
        : closest.risk === 'Medium'
        ? Math.max(75, Math.round(75 + (minDistance / 5.0) * 13))
        : 98;

    return {
      safetyPct,
      riskLevel: closest.risk,
      advice: closest.suggestion,
      closestHotspot: closest,
      distanceToHotspot: Math.round(minDistance * 10) / 10,
      dataSource: source,
    };
  }

  return {
    safetyPct: 98,
    riskLevel: 'Low',
    advice: 'No major accident hotspots detected on route. Safe to travel.',
    closestHotspot: null,
    distanceToHotspot: null,
    dataSource: source,
  };
}
