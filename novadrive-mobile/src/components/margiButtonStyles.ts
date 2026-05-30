import { ViewStyle } from 'react-native';
import { tokens } from '../theme/tokens';

export type MargiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';

/**
 * Pressed styles use deep fill colors — never opacity (opacity reads as grey on white).
 * The iron rule: darken, never desaturate.
 */
export function margiButtonPressedStyle(variant: MargiButtonVariant): ViewStyle | undefined {
  switch (variant) {
    case 'primary':
      return { backgroundColor: tokens.primaryDeep };
    case 'secondary':
      return { backgroundColor: tokens.secondaryDeep };
    case 'danger':
      return { backgroundColor: tokens.onErrorContainer };
    case 'ghost':
      return { backgroundColor: tokens.primaryContainer, borderColor: tokens.primaryDeep };
    case 'mint':
      return { backgroundColor: tokens.tertiaryFixedDim };
    default:
      return undefined;
  }
}

export function margiButtonUsesOpacityPress(): boolean {
  return false;
}

/**
 * Gender chip selected state — deep navy fill with white text.
 * Never a pale container wash: that creates low-contrast, washed-out selection.
 */
export function genderChipActiveStyle(): ViewStyle {
  return {
    backgroundColor: tokens.primary,
    borderColor: tokens.primary,
  };
}

/**
 * Gender chip transient press state — mid-tone darkening, no opacity.
 */
export function genderChipPressedStyle(): ViewStyle {
  return {
    backgroundColor: tokens.primaryContainer,
    borderColor: tokens.primaryFixed,
  };
}
