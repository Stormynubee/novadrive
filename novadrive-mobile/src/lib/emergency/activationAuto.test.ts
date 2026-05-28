import { shouldNavigateToResponse } from './activationAuto';

describe('shouldNavigateToResponse', () => {
  it('does not auto-navigate while splash countdown is still running', () => {
    expect(
      shouldNavigateToResponse({
        mode: 'auto',
        secondsLeft: 6,
        backendReady: true,
        alreadyNavigated: false,
      })
    ).toBe(false);
  });

  it('auto-navigates after countdown completes even if backend became ready early', () => {
    expect(
      shouldNavigateToResponse({
        mode: 'auto',
        secondsLeft: 0,
        backendReady: true,
        alreadyNavigated: false,
      })
    ).toBe(true);
  });

  it('uses countdown fallback in auto mode when backend is not ready', () => {
    expect(
      shouldNavigateToResponse({
        mode: 'auto',
        secondsLeft: 0,
        backendReady: false,
        alreadyNavigated: false,
      })
    ).toBe(true);
  });

  it('does not auto-navigate in manual mode before explicit continue', () => {
    expect(
      shouldNavigateToResponse({
        mode: 'manual',
        secondsLeft: 0,
        backendReady: true,
        alreadyNavigated: false,
      })
    ).toBe(false);
  });

  it('never triggers navigation more than once', () => {
    expect(
      shouldNavigateToResponse({
        mode: 'auto',
        secondsLeft: 0,
        backendReady: true,
        alreadyNavigated: true,
      })
    ).toBe(false);
  });
});
