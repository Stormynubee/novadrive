import { mergeCrashSources } from './nativeCrashAdapter';

describe('crashOrchestrator', () => {
  it('prefers OS source when native confidence high', () => {
    expect(
      mergeCrashSources({ source: 'OS', confidence: 0.9, at: Date.now() }, false).source
    ).toBe('OS');
  });

  it('falls back to sensors', () => {
    expect(mergeCrashSources(null, true).source).toBe('Sensors');
  });
});
