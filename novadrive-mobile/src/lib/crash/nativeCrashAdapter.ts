export type CrashSource = 'OS' | 'Sensors' | 'Manual';

export type NativeCrashEvent = {
  source: 'OS';
  confidence: number;
  at: number;
};

export type NativeCrashAdapter = {
  isSupported: () => boolean;
  subscribe: (onEvent: (event: NativeCrashEvent) => void) => () => void;
};

/** Expo Go / web fallback — no native vehicular crash APIs. */
export function createNativeCrashAdapter(): NativeCrashAdapter {
  return {
    isSupported: () => false,
    subscribe: () => () => undefined,
  };
}

export function mergeCrashSources(
  native: NativeCrashEvent | null,
  sensorCandidate: boolean
): { shouldPrompt: boolean; source: CrashSource } {
  if (native && native.confidence >= 0.6) {
    return { shouldPrompt: true, source: 'OS' };
  }
  if (sensorCandidate) {
    return { shouldPrompt: true, source: 'Sensors' };
  }
  return { shouldPrompt: false, source: 'Sensors' };
}
