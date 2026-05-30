import { margiButtonPressedStyle, margiButtonUsesOpacityPress, genderChipActiveStyle, genderChipPressedStyle } from './margiButtonStyles';

describe('margiButtonPressedStyle', () => {
  it('uses primaryDeep for primary variant', () => {
    expect(margiButtonPressedStyle('primary')).toEqual({ backgroundColor: '#000714' });
  });

  it('uses secondaryDeep for secondary variant', () => {
    expect(margiButtonPressedStyle('secondary')).toEqual({ backgroundColor: '#a04100' });
  });

  it('ghost pressed uses dark primaryContainer — never a pale opacity wash', () => {
    const style = margiButtonPressedStyle('ghost');
    // Must darken, not add opacity
    expect(style).not.toHaveProperty('opacity');
    expect(style?.backgroundColor).toBeDefined();
  });

  it('does not use opacity for press feedback', () => {
    expect(margiButtonUsesOpacityPress()).toBe(false);
  });
});

describe('genderChipActiveStyle', () => {
  it('uses deep primary fill for selected gender — not a pale wash', () => {
    const style = genderChipActiveStyle();
    // Active chip must use primary (deep navy) not a light container wash
    expect(style.backgroundColor).toBe('#000a1e');
    expect(style.borderColor).toBe('#000a1e');
  });

  it('never uses opacity for selected state', () => {
    expect(genderChipActiveStyle()).not.toHaveProperty('opacity');
  });
});

describe('genderChipPressedStyle', () => {
  it('uses primaryContainer fill on press — not opacity reduction', () => {
    const style = genderChipPressedStyle();
    expect(style).not.toHaveProperty('opacity');
    expect(style.backgroundColor).toBeDefined();
  });
});
