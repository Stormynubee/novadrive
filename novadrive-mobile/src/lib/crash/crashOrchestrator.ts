import { createNativeCrashAdapter, mergeCrashSources, type CrashSource } from './nativeCrashAdapter';

export type CrashOrchestratorState = {
  lastSource: CrashSource;
  nativeSubscribed: boolean;
};

export function createCrashOrchestratorState(): CrashOrchestratorState {
  return { lastSource: 'Sensors', nativeSubscribed: false };
}

export function createCrashOrchestrator(deps?: {
  adapter?: ReturnType<typeof createNativeCrashAdapter>;
  journeyActive: () => boolean;
  onCandidate: (source: CrashSource) => void;
}) {
  const adapter = deps?.adapter ?? createNativeCrashAdapter();
  let nativeEvent: { confidence: number; at: number } | null = null;

  const unsubscribe =
    adapter.isSupported() && deps
      ? adapter.subscribe((event) => {
          nativeEvent = event;
          if (!deps.journeyActive()) return;
          const merged = mergeCrashSources(event, false);
          if (merged.shouldPrompt) {
            deps.onCandidate(merged.source);
          }
        })
      : () => undefined;

  return {
    adapter,
    unsubscribe,
    notifySensorCandidate: () => {
      if (!deps?.journeyActive()) return;
      const merged = mergeCrashSources(nativeEvent ? { ...nativeEvent, source: 'OS' } : null, true);
      if (merged.shouldPrompt) deps.onCandidate(merged.source);
    },
    notifyManual: () => {
      deps?.onCandidate('Manual');
    },
    isNativeSupported: () => adapter.isSupported(),
  };
}

export { mergeCrashSources };
