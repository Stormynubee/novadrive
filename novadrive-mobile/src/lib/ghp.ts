import * as Crypto from 'expo-crypto';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { v4 as uuidv4 } from 'uuid';
import type { EmergencySession, GoldenHourPacket } from './types';

export async function hashPayload(payload: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload
  );
  return `nd-${digest.slice(0, 8)}`;
}

export async function buildPacket(session: EmergencySession): Promise<GoldenHourPacket | null> {
  if (!session.location || !session.triage || !session.facility) return null;

  const id = uuidv4();
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
      facilityName: session.facility.name,
      facilityType: session.facility.type,
      phone: session.facility.phone,
      etaMinutes: session.facility.etaMinutes,
      distanceKm: session.facility.distanceKm,
    },
    emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
    integrity,
  };
}

export function formatSms(packet: GoldenHourPacket): string {
  const loc = packet.location;
  const line = loc.landmark || loc.nhCode
    ? `${loc.nhCode ?? 'NH'} km ${loc.nhKm ?? '—'} (${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)})`
    : `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  const body =
    `NOVADRIVE GHP\n` +
    `Triage: ${packet.triage}\n` +
    `Location: ${line}\n` +
    `Facility: ${packet.routing.facilityName} (~${packet.routing.distanceKm}km, ~${packet.routing.etaMinutes}min)\n` +
    `Phone: ${packet.routing.phone}\n` +
    `Hash: ${packet.integrity}`;
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
