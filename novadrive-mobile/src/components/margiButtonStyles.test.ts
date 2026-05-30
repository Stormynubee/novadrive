import { margiButtonPressedStyle, margiButtonUsesOpacityPress } from './margiButtonStyles';

describe('margiButtonPressedStyle', () => {
  it('uses primaryDeep for primary variant', () => {
    expect(margiButtonPressedStyle('primary')).toEqual({ backgroundColor: '#000714' });
  });

  it('uses secondaryDeep for secondary variant', () => {
    expect(margiButtonPressedStyle('secondary')).toEqual({ backgroundColor: '#a04100' });
  });

  it('does not use opacity for press feedback', () => {
    expect(margiButtonUsesOpacityPress()).toBe(false);
  });
});
