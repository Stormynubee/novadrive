import { resolveDailyBriefCards } from './safetyBriefExperience';

describe('resolveDailyBriefCards', () => {
  it('uses verified pack copy inside NH48 bbox', () => {
    const cards = resolveDailyBriefCards(13.0, 80.2);
    expect(cards.regional.title).toBe('Regional Alert');
    expect(cards.protocol.subtitle).toContain('fatigue detection');
  });

  it('uses baseline copy outside verified pack', () => {
    const cards = resolveDailyBriefCards(28.6, 77.2);
    expect(cards.regional.title).toContain('Baseline');
    expect(cards.protocol.subtitle).toContain('unavailable');
  });
});
