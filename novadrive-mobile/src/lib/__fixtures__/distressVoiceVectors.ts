import type { DistressAudioFeatures } from '../voice/distressAudioFeatures';

export type DistressVoiceFixture = {
  id: string;
  meteringDb: number;
  features: DistressAudioFeatures;
  yamnetDistress?: number;
  expectAlert: boolean;
};

export const DISTRESS_VOICE_FIXTURES: Record<string, DistressVoiceFixture> = {
  quiet_cabin: {
    id: 'quiet_cabin',
    meteringDb: -48,
    features: { highBandRatio: 0.12, zcr: 0.08, crestFactor: 1.4 },
    expectAlert: false,
  },
  nav_notification: {
    id: 'nav_notification',
    meteringDb: -32,
    features: { highBandRatio: 0.55, zcr: 0.35, crestFactor: 2.2 },
    yamnetDistress: 0.12,
    expectAlert: false,
  },
  conversation: {
    id: 'conversation',
    meteringDb: -34,
    features: { highBandRatio: 0.28, zcr: 0.18, crestFactor: 1.8 },
    yamnetDistress: 0.08,
    expectAlert: false,
  },
  scream_spike: {
    id: 'scream_spike',
    meteringDb: -18,
    features: { highBandRatio: 0.72, zcr: 0.42, crestFactor: 4.1 },
    yamnetDistress: 0.68,
    expectAlert: true,
  },
};
