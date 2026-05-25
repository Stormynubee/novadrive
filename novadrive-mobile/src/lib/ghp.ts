import * as Crypto from 'expo-crypto';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { formatIceLine } from './storage';
import type { EmergencySession, GoldenHourPacket, MedicalProfile } from './types';

async function newPacketId(): Promise<string> {
  return Crypto.randomUUID();
}

export async function hashPayload(payload: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload
  );
  return `nd-${digest.slice(0, 8)}`;
}

const DISPATCH_108: EmergencySession['facility'] = {
  id: '108',
  name: 'National emergency (108)',
  type: 'hospital',
  traumaTier: 2,
  phone: '108',
  distanceKm: 0,
  etaMinutes: 0,
  verified: true,
};

export async function buildPacket(
  session: EmergencySession,
  medical?: MedicalProfile
): Promise<GoldenHourPacket | null> {
  if (!session.location || !session.triage) return null;
  const facility = session.facility ?? (session.triage === 'BLACK' ? DISPATCH_108 : null);
  if (!facility) return null;

  const id = await newPacketId();
  const core = JSON.stringify({
    id,
    triage: session.triage,
    lat: session.location.lat,
    lng: session.location.lng,
  });
  const integrity = await hashPayload(core);

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
      facilityName: facility.name,
      facilityType: facility.type,
      phone: facility.phone,
      etaMinutes: facility.etaMinutes,
      distanceKm: facility.distanceKm,
    },
    emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
    integrity,
  };
}

export function formatSms(packet: GoldenHourPacket, medical?: MedicalProfile): string {
  const loc = packet.location;
  const line = loc.landmark ?? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  let body =
    `NOVADRIVE GHP\n` +
    `Triage: ${packet.triage}\n` +
    `Location: ${line}\n` +
    `Facility: ${packet.routing.facilityName} (~${Math.round(packet.routing.distanceKm)}km, ~${packet.routing.etaMinutes}min)\n` +
    `Phone: ${packet.routing.phone}\n`;
  if (medical?.bloodType) body += `Blood: ${medical.bloodType}\n`;
  const ice =
    medical?.primaryContact
      ? formatIceLine(medical.primaryContact)
      : medical?.emergencyContact;
  if (ice) body += `ICE: ${ice}\n`;
  body += `Hash: ${packet.integrity}`;
  return body.slice(0, 800);
}

export function qrMinimalJson(packet: GoldenHourPacket): string {
  return JSON.stringify({
    id: packet.id,
    triage: packet.triage,
    lat: packet.location.lat,
    lng: packet.location.lng,
    integrity: packet.integrity,
  });
}

export function encodeQrPayload(packet: GoldenHourPacket): string {
  const compressed = compressToEncodedURIComponent(qrMinimalJson(packet));
  return `ND1:${compressed}`;
}

export function decodeQrPayload(raw: string): { id: string; triage: string; lat: number; lng: number; integrity: string } | null {
  try {
    const payload = raw.startsWith('ND1:') ? raw.slice(4) : raw;
    const json = raw.startsWith('ND1:')
      ? decompressFromEncodedURIComponent(payload)
      : raw;
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed?.id || !parsed?.integrity) return null;
    return parsed;
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
