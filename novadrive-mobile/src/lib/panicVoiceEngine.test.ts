import {
  createPanicVoiceState,
  evaluatePanicVoice,
  PANIC_VOICE_CONFIG,
} from './panicVoiceEngine';

describe('evaluatePanicVoice', () => {
  const t0 = 1_000_000;

  it('calibrates before detecting', () => {
    let state = createPanicVoiceState(t0);
    const r = evaluatePanicVoice(state, -40, t0 + 500);
    expect(r.event).toBe('VOICE_SAMPLE');
    expect(r.state.calibrated).toBe(false);
  });

  it('fires on scream-like spike after calibration', () => {
    let state = createPanicVoiceState(t0);
    for (let i = 0; i < 30; i++) {
      state = evaluatePanicVoice(state, -45, t0 + i * 100).state;
    }
    expect(state.calibrated).toBe(true);
    const hit = evaluatePanicVoice(state, -18, t0 + 3_100);
    expect(hit.event).toBe('PANIC_CANDIDATE');
  });

  it('fires on sustained loud burst', () => {
    let state = createPanicVoiceState(t0);
    for (let i = 0; i < 30; i++) {
      state = evaluatePanicVoice(state, -48, t0 + i * 100).state;
    }
    let event: string | undefined;
    for (let i = 0; i < 4; i++) {
      const r = evaluatePanicVoice(state, -28, t0 + 3_200 + i * 120);
      state = r.state;
      event = r.event ?? event;
    }
    expect(event).toBe('PANIC_CANDIDATE');
  });

  it('ignores quiet cabin noise after calibration', () => {
    let state = createPanicVoiceState(t0);
    for (let i = 0; i < 35; i++) {
      state = evaluatePanicVoice(state, -46, t0 + i * 100).state;
    }
    const r = evaluatePanicVoice(state, -44, t0 + 4_000);
    expect(r.event).not.toBe('PANIC_CANDIDATE');
  });

  it('respects cooldown', () => {
    let state = createPanicVoiceState(t0);
    for (let i = 0; i < 30; i++) {
      state = evaluatePanicVoice(state, -48, t0 + i * 100).state;
    }
    const first = evaluatePanicVoice(state, -15, t0 + 3_000);
    state = first.state;
    const second = evaluatePanicVoice(state, -15, t0 + 3_500);
    expect(second.event).not.toBe('PANIC_CANDIDATE');
  });
});
