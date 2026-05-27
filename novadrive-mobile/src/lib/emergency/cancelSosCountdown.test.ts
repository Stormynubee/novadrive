import {
  CANCEL_SOS_SECONDS,
  canCancelSos,
  formatCancelSosLabel,
  nextCancelSeconds,
} from './cancelSosCountdown';

describe('cancelSosCountdown', () => {
  it('starts at 10 seconds', () => {
    expect(CANCEL_SOS_SECONDS).toBe(10);
  });

  it('formats active countdown label', () => {
    expect(formatCancelSosLabel(7)).toBe('CANCEL SOS (7s)');
    expect(formatCancelSosLabel(1)).toBe('CANCEL SOS (1s)');
  });

  it('formats expired label when time is up', () => {
    expect(formatCancelSosLabel(0)).toBe('CANCEL SOS (EXPIRED)');
    expect(formatCancelSosLabel(-3)).toBe('CANCEL SOS (EXPIRED)');
  });

  it('allows cancel only while seconds remain', () => {
    expect(canCancelSos(10)).toBe(true);
    expect(canCancelSos(1)).toBe(true);
    expect(canCancelSos(0)).toBe(false);
  });

  it('ticks down each second until zero', () => {
    expect(nextCancelSeconds(10)).toBe(9);
    expect(nextCancelSeconds(1)).toBe(0);
    expect(nextCancelSeconds(0)).toBe(0);
  });
});
