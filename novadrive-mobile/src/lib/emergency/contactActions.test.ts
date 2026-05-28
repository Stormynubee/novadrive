import { toDialUrl, toSmsUrl } from './contactActions';

describe('contactActions', () => {
  it('creates dial URL for valid phone values', () => {
    expect(toDialUrl('108')).toBe('tel:108');
  });

  it('returns null dial URL for unavailable phone values', () => {
    expect(toDialUrl('N/A')).toBeNull();
    expect(toDialUrl('')).toBeNull();
  });

  it('creates sms URL for valid phone values', () => {
    expect(toSmsUrl('+91100')).toBe('sms:+91100');
  });

  it('returns null sms URL for unavailable phone values', () => {
    expect(toSmsUrl('n/a')).toBeNull();
  });
});
