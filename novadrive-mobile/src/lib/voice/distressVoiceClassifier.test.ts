import { DISTRESS_VOICE_FIXTURES } from '../__fixtures__/distressVoiceVectors';
import {
  createDistressVoiceClassifierState,
  evaluateDistressVoice,
  getConfirmThreshold,
} from './distressVoiceClassifier';

const FIXTURES = DISTRESS_VOICE_FIXTURES;
const t0 = 2_000_000;

function calibrate(state: ReturnType<typeof createDistressVoiceClassifierState>) {
  let s = state;
  for (let i = 0; i < 30; i++) {
    s = evaluateDistressVoice(s, FIXTURES.quiet_cabin, { now: t0 + i * 100 }).state;
  }
  return s;
}

function runFixture(fixtureId: keyof typeof FIXTURES, frames = 5) {
  let state = calibrate(createDistressVoiceClassifierState(t0));
  let alert = false;
  for (let i = 0; i < frames; i++) {
    const r = evaluateDistressVoice(state, FIXTURES[fixtureId], {
      now: t0 + 3_500 + i * 120,
    });
    state = r.state;
    alert = r.alert || alert;
  }
  return alert;
}

describe('evaluateDistressVoice', () => {
  it('does not alert on navigation_notification fixture', () => {
    expect(runFixture('nav_notification')).toBe(false);
  });

  it('does not alert on conversation fixture', () => {
    expect(runFixture('conversation')).toBe(false);
  });

  it('does not alert on quiet cabin', () => {
    expect(runFixture('quiet_cabin')).toBe(false);
  });

  it('alerts on scream_spike fixture after confirm frames', () => {
    expect(runFixture('scream_spike')).toBe(true);
  });

  it('requires more frames on low sensitivity', () => {
    expect(getConfirmThreshold('low')).toBeGreaterThan(getConfirmThreshold('high'));
  });
});
