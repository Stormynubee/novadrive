import type { EmergencySession, GoldenHourPacket } from './types';

export function buildPacket(session: EmergencySession): GoldenHourPacket | null {
  if (!session.location || !session.triage || !session.facility) return null;

  const id = crypto.randomUUID();
  const payload = JSON.stringify({
    id,
    triage: session.triage,
    lat: session.location.lat,
    lng: session.location.lng,
  });

  return {
    id,
    createdAt: new Date().toISOString(),
    triage: session.triage,
    location: session.location,
    victims: {
      count: 1,
      canWalk: session.triage === 'GREEN',
      breathing: session.triage !== 'BLACK',
      severeBleeding: session.triage === 'RED',
      capillaryRefillOk: session.triage !== 'RED',
      followsCommands: session.triage === 'GREEN' || session.triage === 'YELLOW',
    },
    routing: {
      facilityName: session.facility.name,
      facilityType: session.facility.type,
      phone: session.facility.phone,
      etaMinutes: session.facility.etaMinutes,
      distanceKm: session.facility.distanceKm,
    },
    emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
    integrity: hashSimple(payload),
  };
}

function hashSimple(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `nd-${Math.abs(h).toString(16).padStart(8, '0')}`;
}

export function formatSms(packet: GoldenHourPacket): string {
  const loc = packet.location;
  const line = loc.landmark || loc.nhCode
    ? `${loc.nhCode ?? 'NH'} km ${loc.nhKm ?? '—'}`
    : `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  return (
    `MARGI GHP\n` +
    `Triage: ${packet.triage}\n` +
    `Location: ${line}\n` +
    `Facility: ${packet.routing.facilityName} (${packet.routing.distanceKm}km ~${packet.routing.etaMinutes}m)\n` +
    `Call: ${packet.routing.phone}\n` +
    `Hash: ${packet.integrity}`
  );
}

export function qrPayload(packet: GoldenHourPacket): string {
  return JSON.stringify({
    id: packet.id,
    triage: packet.triage,
    lat: packet.location.lat,
    lng: packet.location.lng,
    integrity: packet.integrity,
  });
}
