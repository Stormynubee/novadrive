import { ViewStyle } from 'react-native';
import { tokens } from '../theme/tokens';

export type MargiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';

/** Pressed styles use deep fill colors — never opacity (reads as grey on white). */
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
