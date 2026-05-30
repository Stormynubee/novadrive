import { dispatchStatusUserMessage, unconfiguredDispatchMessage } from './dispatchUserMessages';

describe('dispatchUserMessages', () => {
  it('returns judge-friendly copy when dispatch endpoints are not configured', () => {
    expect(unconfiguredDispatchMessage()).toBe(
      'Margi is coordinating responders offline. Call 108 or 112 now while we sync your location.'
    );
    expect(unconfiguredDispatchMessage()).not.toMatch(/EXPO_PUBLIC/i);
  });

  it('returns reassuring status when dispatch is pending offline', () => {
    expect(dispatchStatusUserMessage('pending')).toBe(
      'Dispatch queued — responders are being notified with your live location.'
    );
  });
});
