import { sarthiConnectionBanner } from './sarthiStatusCopy';

describe('sarthiStatusCopy', () => {
  it('uses offline KB copy without developer env var names', () => {
    expect(sarthiConnectionBanner({ offlineMode: true, bffUnavailable: false })).toBe(
      'Offline — Sarthi uses on-device safety guidance while you drive.'
    );
    expect(sarthiConnectionBanner({ offlineMode: false, bffUnavailable: true })).toContain(
      'Gemini is not responding'
    );
    expect(sarthiConnectionBanner({ offlineMode: false, bffUnavailable: false })).toBeNull();
  });
});
