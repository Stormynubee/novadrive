import {
  holdSosHudTopSublabelCopy,
  holdSosHudTopUsesAbsoluteSublabel,
} from './holdSosHudTopLayout';

describe('holdSosHudTopLayout', () => {
  it('does not absolutely position the sublabel', () => {
    expect(holdSosHudTopUsesAbsoluteSublabel()).toBe(false);
  });

  it('shows hold duration when idle', () => {
    expect(holdSosHudTopSublabelCopy(false)).toBe('Hold 3 seconds');
  });

  it('shows steady message while holding', () => {
    expect(holdSosHudTopSublabelCopy(true)).toBe('Hold steady…');
  });
});
