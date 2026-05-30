import type { EmergencySession } from '../types';

export function resolveHospitalNavTarget(
  session: Pick<EmergencySession, 'facility' | 'location'>
): { lat: number; lng: number; label: string } | null {
  const facility = session.facility;
  if (facility?.lat != null && facility?.lng != null) {
    return { lat: facility.lat, lng: facility.lng, label: facility.name };
  }
  return null;
}
