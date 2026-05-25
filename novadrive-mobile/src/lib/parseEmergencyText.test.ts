import { parseEmergencyText } from './parseEmergencyText';

describe('parseEmergencyText', () => {
  it('extracts ambulatory and breathing slots', () => {
    const { slots, matched } = parseEmergencyText('Patient can walk but not breathing');
    expect(slots.canWalk).toBe(true);
    expect(slots.breathing).toBe(false);
    expect(matched).toContain('can walk');
    expect(matched).toContain('not breathing');
  });

  it('returns empty for unrelated text', () => {
    const { slots, matched } = parseEmergencyText('hello corridor');
    expect(Object.keys(slots)).toHaveLength(0);
    expect(matched).toHaveLength(0);
  });

  it('matches unconscious as followsCommands false', () => {
    const { slots } = parseEmergencyText('driver is unconscious');
    expect(slots.followsCommands).toBe(false);
  });
});
