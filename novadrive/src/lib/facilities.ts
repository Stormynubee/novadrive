import type { Facility, TriageColor } from './types';

const ALL: Facility[] = [
  {
    id: '1',
    name: 'Apollo Highway Trauma Center',
    type: 'trauma',
    traumaTier: 1,
    phone: '108',
    distanceKm: 12.4,
    etaMinutes: 18,
  },
  {
    id: '2',
    name: 'SRMC Emergency & Trauma',
    type: 'trauma',
    traumaTier: 2,
    phone: '044-27428888',
    distanceKm: 15.1,
    etaMinutes: 22,
  },
  {
    id: '3',
    name: 'District General Hospital ER',
    type: 'hospital',
    traumaTier: 2,
    phone: '108',
    distanceKm: 8.2,
    etaMinutes: 14,
  },
  {
    id: '4',
    name: 'NH48 Primary Health Centre',
    type: 'clinic',
    traumaTier: 3,
    phone: '108',
    distanceKm: 4.1,
    etaMinutes: 9,
  },
];

export function rankFacilities(triage: TriageColor): Facility[] {
  let filtered = [...ALL];
  if (triage === 'RED') filtered = filtered.filter((f) => f.traumaTier <= 2);
  else if (triage === 'YELLOW') filtered = filtered.filter((f) => f.traumaTier <= 3 && f.type !== 'clinic');
  else if (triage === 'GREEN') filtered = filtered.filter((f) => f.type === 'clinic' || f.traumaTier === 3);
  else return [];

  filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  if (filtered.length > 0) filtered[0] = { ...filtered[0], recommended: true };
  return filtered;
}
