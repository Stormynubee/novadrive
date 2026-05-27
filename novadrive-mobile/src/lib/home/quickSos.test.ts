import { QUICK_SOS_ALERT } from './quickSosAlert';

describe('QUICK_SOS_ALERT', () => {
  it('uses formal government tone', () => {
    expect(QUICK_SOS_ALERT.title).toMatch(/Emergency/i);
    expect(QUICK_SOS_ALERT.message).toMatch(/incident type/i);
    expect(QUICK_SOS_ALERT.confirm).toBe('Proceed');
    expect(QUICK_SOS_ALERT.cancel).toMatch(/Cancel/i);
  });
});
