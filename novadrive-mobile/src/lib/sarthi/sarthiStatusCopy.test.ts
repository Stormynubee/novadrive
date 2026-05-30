import { sarthiConnectionBanner } from './sarthiStatusCopy';

describe('sarthiStatusCopy', () => {
  it('uses offline KB copy without developer env var names', () => {
    expect(sarthiConnectionBanner({ offlineMode: true, bffUnavailable: false })).toBe(
      'Offline — Sarthi uses on-device safety guidance while you drive.'
    );
    expect(sarthiConnectionBanner({ offlineMode: false, bffUnavailable: true })).toBe(
      'Sarthi is using on-device safety guidance. Cloud assistant reconnects when online.'
    );
    expect(sarthiConnectionBanner({ offlineMode: false, bffUnavailable: false })).toBeNull();
  });
});
