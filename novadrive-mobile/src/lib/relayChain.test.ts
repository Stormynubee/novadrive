jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete store[k];
    }),
    __reset: () => {
      store = {};
    },
  };
});

import * as SecureStore from 'expo-secure-store';
import { appendRelayChain, loadRelayChain } from './relayChain';
import type { GoldenHourPacket } from './types';

const samplePacket = (): GoldenHourPacket => ({
  id: 'pkt-1',
  createdAt: '2026-05-28T12:00:00.000Z',
  triage: 'YELLOW',
  location: { lat: 13.08, lng: 80.27, capturedAt: '2026-05-28T12:00:00.000Z' },
  victims: {
    count: 1,
    canWalk: false,
    breathing: true,
    severeBleeding: false,
    capillaryRefillOk: true,
    followsCommands: true,
  },
  routing: {
    facilityName: 'GH',
    facilityType: 'hospital',
    phone: '108',
    etaMinutes: 8,
    distanceKm: 4,
  },
  emergency: { dial: '108', state: 'Tamil Nadu', language: 'en' },
  integrity: 'mg-abc12345',
});

describe('relayChain', () => {
  beforeEach(() => {
    (SecureStore as unknown as { __reset: () => void }).__reset();
  });

  it('appends and lists relay entries', async () => {
    expect(await loadRelayChain()).toEqual([]);
    const chain = await appendRelayChain(samplePacket());
    expect(chain).toHaveLength(1);
    expect(chain[0].packetId).toBe('pkt-1');
    expect(chain[0].integrity).toBe('mg-abc12345');
    const again = await loadRelayChain();
    expect(again[0].triage).toBe('YELLOW');
  });
});
