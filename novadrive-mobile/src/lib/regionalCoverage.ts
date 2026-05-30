import { inferIndianStateName } from './indianStateBboxes';

/** Verified NH48 corridor pack — mirrors data/corridors/nh48_bbox.json */
export const NH48_VERIFIED_PACK_BBOX = {
  south: 12.65,
  west: 79.85,
  north: 13.15,
  east: 80.35,
} as const;

export type RegionalCoverage = {
  mode: 'verified_pack' | 'baseline';
  packId: 'nh48' | 'none';
  stateName: string;
  emergencyDial: '108';
  hasVerifiedHospitals: boolean;
};

function pointInBbox(
  lat: number,
  lng: number,
  bbox: { south: number; west: number; north: number; east: number }
): boolean {
  return lat >= bbox.south && lat <= bbox.north && lng >= bbox.west && lng <= bbox.east;
}

export function resolveRegionalCoverage(lat: number, lng: number): RegionalCoverage {
  const stateName = inferIndianStateName(lat, lng);
  if (pointInBbox(lat, lng, NH48_VERIFIED_PACK_BBOX)) {
    return {
      mode: 'verified_pack',
      packId: 'nh48',
      stateName: 'Tamil Nadu',
      emergencyDial: '108',
      hasVerifiedHospitals: true,
    };
  }
  return {
    mode: 'baseline',
    packId: 'none',
    stateName,
    emergencyDial: '108',
    hasVerifiedHospitals: false,
  };
}

export function isBaselineCoverage(lat: number, lng: number): boolean {
  return resolveRegionalCoverage(lat, lng).mode === 'baseline';
}
