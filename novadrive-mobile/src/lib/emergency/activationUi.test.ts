import {
  activationCountdownProgress,
  autoAdvanceLabel,
  shouldShowManualContinue,
} from './activationUi';
import { ACTIVATION_SPLASH_SECONDS } from './activationAuto';

describe('shouldShowManualContinue', () => {
  it('hides continue during early auto countdown', () => {
    expect(shouldShowManualContinue('auto', 8)).toBe(false);
  });

  it('shows continue in last 3 seconds of auto countdown', () => {
    expect(shouldShowManualContinue('auto', 3)).toBe(true);
    expect(shouldShowManualContinue('auto', 1)).toBe(true);
  });

  it('always shows continue in manual mode', () => {
    expect(shouldShowManualContinue('manual', 10)).toBe(true);
  });
});

describe('autoAdvanceLabel', () => {
  it('formats countdown label', () => {
    expect(autoAdvanceLabel(8)).toBe('Auto-advancing in 8s');
  });

  it('shows advancing when countdown complete', () => {
    expect(autoAdvanceLabel(0)).toBe('Advancing now…');
  });
});

describe('activationCountdownProgress', () => {
  it('starts at 0 when splash begins', () => {
    expect(activationCountdownProgress(ACTIVATION_SPLASH_SECONDS, ACTIVATION_SPLASH_SECONDS)).toBe(
      0
    );
  });

  it('reaches 1 when countdown completes', () => {
    expect(activationCountdownProgress(0, ACTIVATION_SPLASH_SECONDS)).toBe(1);
  });
});
