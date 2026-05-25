import {
  CRASH_CONFIG,
  createCrashEngineState,
  evaluateCrashCandidate,
  thresholdsForSensitivity,
} from './crashEngine';

describe('thresholdsForSensitivity', () => {
  it('raises impact thresholds when sensitivity is low', () => {
    const high = thresholdsForSensitivity('high');
    const low = thresholdsForSensitivity('low');
    expect(low.impactPeak).toBeGreaterThan(high.impactPeak);
    expect(low.accelPeak).toBeGreaterThan(high.accelPeak);
  });
});

describe('evaluateCrashCandidate', () => {
  const t0 = 1_000_000;

  it('does not fire when phone is still at desk (low g, no jerk)', () => {
    let state = createCrashEngineState();
    for (let i = 0; i < 20; i++) {
      const r = evaluateCrashCandidate(state, 0, 1.0, t0 + i * 100);
      state = r.state;
      expect(r.event).toBeUndefined();
    }
  });

  it('fires on throw pattern: high jerk + impact peak without vehicle speed', () => {
    let state = createCrashEngineState();
    const samples = [
      { g: 1.0, speed: 0 },
      { g: 1.1, speed: 0 },
      { g: 3.8, speed: 0 },
      { g: 1.2, speed: 0 },
    ];
    let event: string | undefined;
    samples.forEach((s, i) => {
      const r = evaluateCrashCandidate(state, s.speed, s.g, t0 + i * 100);
      state = r.state;
      event = r.event ?? event;
    });
    expect(event).toBe('CRASH_CANDIDATE');
  });

  it('fires on free-fall then impact (drop phone)', () => {
    let state = createCrashEngineState();
    const samples = [
      { g: 1.0, speed: 0 },
      { g: 0.2, speed: 0 },
      { g: 2.6, speed: 0 },
    ];
    let event: string | undefined;
    samples.forEach((s, i) => {
      const r = evaluateCrashCandidate(state, s.speed, s.g, t0 + i * 100);
      state = r.state;
      event = r.event ?? event;
    });
    expect(event).toBe('CRASH_CANDIDATE');
  });

  it('fires on highway deceleration + impact', () => {
    let state = createCrashEngineState();
    const r1 = evaluateCrashCandidate(state, 80, 1.0, t0);
    state = r1.state;
    const r2 = evaluateCrashCandidate(state, 2, 3.0, t0 + 500);
    expect(r2.event).toBe('CRASH_CANDIDATE');
  });

  it('fires impact-only at standstill (throw / desk test)', () => {
    let state = createCrashEngineState();
    const r = evaluateCrashCandidate(state, 0, 3.4, t0);
    expect(r.event).toBe('CRASH_CANDIDATE');
  });

  it('respects cooldown after a candidate', () => {
    let state = createCrashEngineState();
    const first = evaluateCrashCandidate(state, 0, 4.0, t0);
    state = first.state;
    expect(first.event).toBe('CRASH_CANDIDATE');
    const second = evaluateCrashCandidate(state, 0, 4.0, t0 + 1000);
    expect(second.event).toBeUndefined();
  });
});
