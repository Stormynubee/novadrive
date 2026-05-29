import type { SupabaseClient } from '@supabase/supabase-js';

export type VolunteerProvider = {
  id: string;
  org_name: string;
  contact_name: string;
  phone: string;
  service_area: string;
  lat: number;
  lng: number;
  verified: boolean;
};

export type VolunteerRegistration = {
  orgName: string;
  contactName: string;
  phone: string;
  serviceArea: string;
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export async function registerVolunteerProvider(
  client: SupabaseClient,
  userId: string,
  input: VolunteerRegistration
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await client
    .from('volunteer_providers')
    .insert({
      user_id: userId,
      org_name: input.orgName.trim(),
      contact_name: input.contactName.trim(),
      phone: input.phone.trim(),
      service_area: input.serviceArea.trim(),
      lat: input.lat,
      lng: input.lng,
      verified: false,
    })
    .select('id')
    .single();
  if (error) return { id: null, error: error.message };
  return { id: data.id as string, error: null };
}

export async function listNearbyVerifiedVolunteers(
  client: SupabaseClient,
  origin: { lat: number; lng: number },
  radiusKm = 25
): Promise<VolunteerProvider[]> {
  const { data, error } = await client
    .from('volunteer_providers')
    .select('id, org_name, contact_name, phone, service_area, lat, lng, verified')
    .eq('verified', true);
  if (error || !data) return [];
  return (data as VolunteerProvider[])
    .map((row) => ({ row, km: haversineKm(origin, row) }))
    .filter(({ km }) => km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .map(({ row }) => row);
}

export type VolunteerNotifyResult = {
  notified: VolunteerProvider[];
  smsTargets: string[];
};

export function buildVolunteerNotifyResult(
  volunteers: VolunteerProvider[]
): VolunteerNotifyResult {
  const phones = volunteers.map((v) => v.phone).filter(Boolean);
  return {
    notified: volunteers,
    smsTargets: [...new Set(phones)],
  };
}
