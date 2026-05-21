import { applyAnswer, initialState } from './startTriageFSM';

describe('START triage FSM', () => {
  it('GREEN when can walk', () => {
    const r = applyAnswer(initialState(), {}, { canWalk: true });
    expect(r.result).toBe('GREEN');
  });

  it('BLACK when airway fails', () => {
    let s = initialState();
    let ctx = {};
    ({ next: s, ctx } = applyAnswer(s, ctx, { canWalk: false }));
    ({ next: s, ctx } = applyAnswer(s, ctx, { breathing: false }));
    const r = applyAnswer(s, ctx, { airwayOk: false, breathing: false });
    expect(r.result).toBe('BLACK');
  });

  it('goes to RESPIRATORY_RATE after airway success (not instant RED)', () => {
    let s = initialState();
    let ctx = {};
    ({ next: s, ctx } = applyAnswer(s, ctx, { canWalk: false }));
    ({ next: s, ctx } = applyAnswer(s, ctx, { breathing: false }));
    const r = applyAnswer(s, ctx, { airwayOk: true, breathing: true });
    expect(r.next).toBe('RESPIRATORY_RATE');
    expect(r.result).toBeUndefined();
  });

  it('RED on fast respiratory rate', () => {
    let s = 'RESPIRATORY_RATE' as const;
    const r = applyAnswer(s, {}, { respiratoryRateOver30: true });
    expect(r.result).toBe('RED');
  });

  it('YELLOW when all checks pass and non-ambulatory', () => {
    let s = 'MENTAL_STATUS' as const;
    const ctx = {
      canWalk: false,
      breathing: true,
      capillaryRefillOk: true,
    };
    const r = applyAnswer(s, ctx, { followsCommands: true });
    expect(r.result).toBe('YELLOW');
  });
});
