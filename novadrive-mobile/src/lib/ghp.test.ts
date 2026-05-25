jest.mock('./storage', () => ({
  formatIceLine: (c?: { fullName?: string; relationship?: string; phone?: string }) =>
    [c?.fullName, c?.relationship, c?.phone].filter(Boolean).join(' · '),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
  digestStringAsync: jest.fn(async () =>
    'a'.repeat(64)
  ),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
}));

import {
  buildPacket,
  decodeQrPayload,
  encodeQrPayload,
  formatSms,
  hashPayload,
  qrMinimalJson,
} from './ghp';
import type { EmergencySession } from './types';

const baseSession = (): EmergencySession => ({
  location: {
    lat: 13.08,
    lng: 80.27,
    landmark: 'OMR Junction',
    capturedAt: '2026-05-23T12:00:00.000Z',
  },
  triage: 'YELLOW',
  facility: {
    id: 'gov1',
    name: 'Govt GH',
    type: 'hospital',
    traumaTier: 2,
    phone: '0441234567',
    distanceKm: 4.2,
    etaMinutes: 12,
    verified: true,
  },
});

describe('buildPacket', () => {
  it('returns null without location or triage', async () => {
    expect(await buildPacket({}, undefined)).toBeNull();
    expect(await buildPacket({ triage: 'RED' }, undefined)).toBeNull();
  });

  it('builds packet with integrity hash', async () => {
    const packet = await buildPacket(baseSession(), { bloodType: 'O+' });
    expect(packet?.triage).toBe('YELLOW');
    expect(packet?.integrity).toMatch(/^nd-[a-f0-9]{8}$/);
    expect(packet?.routing.facilityName).toBe('Govt GH');
  });
});

describe('formatSms', () => {
  it('includes triage, location, and hash', async () => {
    const packet = await buildPacket(baseSession());
    expect(packet).not.toBeNull();
    const sms = formatSms(packet!, { bloodType: 'B+' });
    expect(sms).toContain('NOVADRIVE GHP');
    expect(sms).toContain('YELLOW');
    expect(sms).toContain('OMR Junction');
    expect(sms).toContain('Hash:');
    expect(sms).toContain('Blood: B+');
  });
});

describe('qr encode/decode', () => {
  it('round-trips ND1 payload', async () => {
    const packet = await buildPacket(baseSession());
    expect(packet).not.toBeNull();
    const encoded = encodeQrPayload(packet!);
    expect(encoded.startsWith('ND1:')).toBe(true);
    const decoded = decodeQrPayload(encoded);
    expect(decoded?.id).toBe(packet!.id);
    expect(decoded?.triage).toBe('YELLOW');
    expect(decoded?.integrity).toBe(packet!.integrity);
  });

  it('rejects malformed payload', () => {
    expect(decodeQrPayload('not-a-packet')).toBeNull();
  });
});

describe('hashPayload', () => {
  it('returns stable nd- prefix', async () => {
    const h1 = await hashPayload('{"a":1}');
    const h2 = await hashPayload('{"a":1}');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^nd-/);
  });
});
