import { getOfflineTraumaReply } from './traumaAssistantOffline';

describe('traumaAssistantOffline', () => {
  it('returns bleeding first-aid response for bleeding prompt', () => {
    const response = getOfflineTraumaReply('patient bleeding from left leg heavily', 'en');
    expect(response.intent).toBe('bleeding');
    expect(response.actions.join(' ')).toMatch(/pressure/i);
  });

  it('returns breathing protocol for unconscious + no breathing', () => {
    const response = getOfflineTraumaReply('patient unconscious and not breathing', 'en');
    expect(response.intent).toBe('airway_breathing');
    expect(response.actions.join(' ')).toMatch(/airway|compressions/i);
  });
});
