import { inferIndianStateName } from './indianStateBboxes';

describe('inferIndianStateName', () => {
  it('returns Odisha for Bhubaneswar coordinates', () => {
    expect(inferIndianStateName(20.2961, 85.8245)).toBe('Odisha');
  });

  it('returns Tamil Nadu for Chennai coordinates outside NH48 pack edge', () => {
    expect(inferIndianStateName(11.9416, 79.8083)).toBe('Tamil Nadu');
  });

  it('returns India for coordinates outside known state boxes', () => {
    expect(inferIndianStateName(10.0, 72.0)).toBe('India');
  });
});
