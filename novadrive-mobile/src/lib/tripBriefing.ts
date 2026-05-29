import { rankFacilities } from './facilitiesDb';
import type { TriageColor } from './types';

export type BriefingCardType =
  | 'route'
  | 'trauma'
  | 'hazards'
  | 'deadzone'
  | 'precautions'
  | 'contacts';

export interface BriefingCard {
  type: BriefingCardType;
  title: string;
  body: string;
  items?: string[];
  accent?: 'primary' | 'secondary' | 'tertiary' | 'outline';
}

import { listCorridorHazards } from './tripBriefingDb';

export async function buildTripBriefing(
  pointA: { lat: number; lng: number; label: string },
  pointBLabel: string
): Promise<BriefingCard[]> {
  const facilities = await rankFacilities('RED' as TriageColor, pointA.lat, pointA.lng, 120);
  const traumaLines = facilities.slice(0, 3).map(
    (f, i) => `${i + 1}. ${f.name} (Tier ${f.traumaTier}) — ${f.distanceKm.toFixed(0)} km`
  );

  const hazards = await listCorridorHazards('hazard');
  const deadZones = await listCorridorHazards('deadzone');

  return [
    {
      type: 'route',
      title: 'Route summary',
      body: `${pointA.label} → ${pointBLabel || 'Destination'}. Offline corridor pack active.`,
      accent: 'primary',
    },
    {
      type: 'trauma',
      title: 'Trauma centers en route',
      body:
        traumaLines.length > 0
          ? 'Ranked by trauma tier and distance from your start point.'
          : 'No trauma centers in offline pack for this region — dial 108.',
      items: traumaLines.length > 0 ? traumaLines : ['Call 108 for dispatch guidance'],
      accent: 'primary',
    },
    {
      type: 'hazards',
      title: 'Accident-prone zones',
      body:
        hazards.length > 0
          ? hazards.map((h) => `${h.name}: ${h.note}`).join('\n')
          : 'No hazard rows in offline pack.',
      accent: 'tertiary',
    },
    {
      type: 'deadzone',
      title: 'Low-network zones',
      body:
        deadZones.length > 0
          ? deadZones.map((d) => `${d.name}: ${d.note}`).join('\n')
          : 'No dead-zone rows in offline pack.',
      accent: 'outline',
    },
    {
      type: 'precautions',
      title: 'Precautions',
      body: 'Night driving: use high beams only when clear. Rain: extend following distance. Keep Golden Hour Packet path ready before dead zones.',
      accent: 'secondary',
    },
    {
      type: 'contacts',
      title: 'Emergency contacts',
      items: ['108 — National emergency', '112 — Unified emergency (India)'],
      body: facilities[0]?.phone && facilities[0].phone !== 'unverified'
        ? `Nearest verified: ${facilities[0].name} — ${facilities[0].phone}`
        : 'Verify hospital phone when signal returns.',
      accent: 'primary',
    },
  ];
}

export function filterCardsByQuery(cards: BriefingCard[], query: string): BriefingCard[] {
  const q = query.toLowerCase().trim();
  if (!q) return cards;
  const keywords: Record<string, BriefingCardType[]> = {
    trauma: ['trauma'],
    hospital: ['trauma', 'contacts'],
    hazard: ['hazards'],
    accident: ['hazards'],
    signal: ['deadzone'],
    network: ['deadzone'],
    offline: ['deadzone', 'precautions'],
    rain: ['precautions'],
    night: ['precautions'],
    contact: ['contacts'],
    '108': ['contacts'],
  };
  const types = new Set<BriefingCardType>();
  for (const [key, cardTypes] of Object.entries(keywords)) {
    if (q.includes(key)) cardTypes.forEach((t) => types.add(t));
  }
  if (types.size === 0) return cards.filter((c) => c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q));
  return cards.filter((c) => types.has(c.type));
}
