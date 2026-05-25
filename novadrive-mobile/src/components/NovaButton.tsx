import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { tokens } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';

/**
 * GovTech buttons (DESIGN.md §Components/Buttons).
 *
 *   primary   — Deep Navy fill, white label. Default CTA.
 *   secondary — Emergency Saffron fill. High-contrast for urgent action ("emergency" in DESIGN.md).
 *   ghost     — Transparent, navy outline + navy label. "View history", "Cancel".
 *   danger    — Saffron container + red label / error border. Destructive confirm.
 *   mint      — Indian-green tonal pill, used for "I am okay" calm-down replies.
 */
export function NovaButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  large,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          (variant === 'primary' || variant === 'secondary' || variant === 'danger') && styles.labelLight,
          variant === 'ghost' && styles.labelGhost,
          variant === 'mint' && styles.labelMint,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radius.button,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 56 },
  primary: {
    backgroundColor: tokens.primary,
    ...tokens.elevation.card,
  },
  secondary: {
    backgroundColor: tokens.secondary,
    ...tokens.elevation.card,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: tokens.primary,
  },
  danger: {
    backgroundColor: tokens.error,
    ...tokens.elevation.sos,
  },
  mint: {
    backgroundColor: tokens.tertiaryContainer,
    borderWidth: 1,
    borderColor: tokens.tertiary,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  label: {
    fontSize: 16,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.2,
  },
  labelLight: { color: '#ffffff' },
  labelGhost: { color: tokens.primary },
  labelMint: { color: tokens.onTertiaryContainer },
});
