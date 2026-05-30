import { buildIncidentElapsedDisplay, formatIncidentElapsedClock } from './incidentElapsed';

describe('incidentElapsed', () => {
  it('formats mm:ss under one hour', () => {
    expect(formatIncidentElapsedClock(125_000)).toBe('02:05');
  });

  it('formats h:mm:ss at one hour or more', () => {
    expect(formatIncidentElapsedClock(3_661_000)).toBe('1:01:01');
  });

  it('builds display from activation timestamp', () => {
    const now = Date.parse('2026-05-28T12:10:00.000Z');
    const display = buildIncidentElapsedDisplay('2026-05-28T12:05:00.000Z', now);
    expect(display.clock).toBe('05:00');
    expect(display.caption).toBe('SINCE INCIDENT');
    expect(display.severity).toBe('normal');
  });

  it('escalates severity after golden-hour window', () => {
    const now = Date.parse('2026-05-28T12:45:00.000Z');
    const display = buildIncidentElapsedDisplay('2026-05-28T12:05:00.000Z', now);
    expect(display.severity).toBe('critical');
  });
});
