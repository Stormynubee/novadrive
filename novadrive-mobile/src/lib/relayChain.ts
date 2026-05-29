import * as SecureStore from 'expo-secure-store';
import type { GoldenHourPacket } from './types';

const KEY = 'nd_relay_chain';

export interface RelayChainEntry {
  packetId: string;
  integrity: string;
  triage: string;
  savedAt: string;
  lat: number;
  lng: number;
}

export async function loadRelayChain(): Promise<RelayChainEntry[]> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RelayChainEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendRelayChain(packet: GoldenHourPacket): Promise<RelayChainEntry[]> {
  const chain = await loadRelayChain();
  const entry: RelayChainEntry = {
    packetId: packet.id,
    integrity: packet.integrity,
    triage: packet.triage,
    savedAt: new Date().toISOString(),
    lat: packet.location.lat,
    lng: packet.location.lng,
  };
  const next = [entry, ...chain.filter((e) => e.packetId !== packet.id)].slice(0, 50);
  await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  return next;
}
