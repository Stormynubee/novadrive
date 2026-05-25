import {
  SARTHI_KB_ENTRIES,
  matchKnowledgeBase,
  shouldUseOfflineFirst,
  validateKnowledgeBase,
} from './sarthiKnowledgeBase';

describe('sarthiKnowledgeBase', () => {
  it('every intent has en, hi, and ta replies', () => {
    const errors = validateKnowledgeBase();
    expect(errors).toEqual([]);
    expect(SARTHI_KB_ENTRIES.length).toBeGreaterThanOrEqual(20);
  });

  it('matches crash to emergency category', () => {
    const m = matchKnowledgeBase('we had a crash on NH');
    expect(m?.entry.id).toBe('crash_accident');
    expect(m?.entry.category).toBe('emergency');
  });

  it('prefers higher priority when multiple match', () => {
    const m = matchKnowledgeBase('SOS not breathing help');
    expect(m?.priority).toBeGreaterThanOrEqual(90);
  });

  it('offline-first for high priority crisis', () => {
    const m = matchKnowledgeBase('vehicle on fire');
    expect(shouldUseOfflineFirst(m)).toBe(true);
  });
});
